# pip install duckdb requests orjson pyarrow tenacity python-dateutil
import os, pathlib, time, typing as t, duckdb, requests, orjson, re
from dataclasses import dataclass, field
from urllib.parse import urlencode, urljoin
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

DATA_DIR = pathlib.Path("data").resolve()
RAW_DIR = DATA_DIR / "raw_json"
PARQUET_DIR = DATA_DIR / "parquet"
DB_DIR = DATA_DIR / "duckdb"
for d in (RAW_DIR, PARQUET_DIR, DB_DIR):
    d.mkdir(parents=True, exist_ok=True)

# ====== CONFIG: define your three endpoints here ======
# Replace the sample values with your real endpoints/headers/paths.
CONFIG: list[dict] = [
    {
        "name": "gastro",  # used for file/db/table names
        "db_path": str(DB_DIR / "gastro.duckdb"),  # separate DB for this endpoint
        "table": "items",
        "api": {
            "base_url": "https://connector.hub.austria.info/data/",
            "headers": {
                "Authorization": "Bearer Bearer eyJhbGciOiJFQ0RILUVTK0EyNTZLVyIsImVuYyI6IkEyNTZHQ00iLCJlcGsiOnsia3R5IjoiRUMiLCJjcnYiOiJQLTI1NiIsIngiOiJFS295S0tIWUt5YlVTZVk0WDVZS05pUHowLU1lOFdfYW90czFackFvR2k4IiwieSI6Ijg4MUQ0X21FeDQwVTBDRW96eTJSS1dJVEZUNTJrZ0xBSXdRemdfZ1FtaU0ifSwidHlwIjoiSldFIn0.eDy04l2qirhau-6z2YZF3qUOkeHvYR86FeQ-qpoZOakFL-rMuxu-Zg.5wvelUnlzFqD2b6q.p6LU82drnmJ4uOfuoqmCWigMzUhkGYNN2ribkFQmLjM6BRg0sO_zUsE5RvbvC0HPxBIkgEF7Wv0zt2P3MaEelEmW-kgEGC0Xh2Oj3xAEllOJF92VEjjrct0bdLfS8tpvSQm_IqGOu0QTzO4W2z18VfD3ENklR1MPiDA_6nKl8MFiPu-zdPCHjYuMvHMwgylOlAAmAxTHrbblh0zmp6Cglsak7dscx_fm9Bpx2Dl9yjJfXbLjffRcuL1d4mwrXYeGRecjr_thOwCNjDrazR1KfbraE7B638gXk167mIJOXUuGOAoZS7cPlj2l4sfqe_bfJ0XMuWrj91Mv9Jyz6H63p-MJc7QD9PFVLLAKyPMSKzT3fH8o6dL2NC4lUhTroKstaeV2wcY28-yNWpxoiCw1GsJBwp8ceyUV-vrOA77x.vOk-Mk-ZixOWq-GQ6-BTyQ:aHR0cDovL2NvbnRyb2xwbGFuZS5odWItOW00YTY1bHEuc3ZjLmNsdXN0ZXIubG9jYWwvaW50ZXJuYWwvYXBpL2RhdGFwbGFuZS9hY2Nlc3NJbmZv"
            },
            # "params": {"page_size": 500},  # optional
            "records_path": ["data"],  # where the list of records lives in the JSON
            # "pagination": {  # choose ONE strategy below
            #     "type": "page",  # "page" OR "cursor" OR "none"
            #     "page_param": "page",  # ?page=1,2,3,...
            #     "start": 1,
            #     "stop_when_empty": True,  # stop when a page returns zero records
            # },
        },
        "write_parquet": True,  # also emit a parquet snapshot
    },
]
# ======================================================

Json = dict | list | str | int | float | bool | None


def get_in(d: Json, path: list[str | int]) -> t.Any:
    """Safe nested lookup: path like ['data','items'] or ['results',0,'id']."""
    cur: t.Any = d
    for p in path:
        if isinstance(p, int):
            if isinstance(cur, list) and 0 <= p < len(cur):
                cur = cur[p]
            else:
                return None
        else:
            if isinstance(cur, dict) and p in cur:
                cur = cur[p]
            else:
                return None
    return cur


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=1, max=20),
    retry=retry_if_exception_type((requests.RequestException,)),
)
def http_get(url: str, headers: dict, timeout: int = 60) -> requests.Response:
    r = requests.get(url, headers=headers, timeout=timeout)
    if r.status_code >= 400:
        raise requests.HTTPError(f"{r.status_code} for {url}\n{r.text[:500]}")
    return r


def make_page_url(base_url: str, params: dict, page_param: str, page: int) -> str:
    qp = params.copy()
    qp[page_param] = page
    sep = "&" if ("?" in base_url) else "?"
    return f"{base_url}{sep}{urlencode(qp)}"


def make_cursor_url(
    base_url: str, params: dict, cursor_param: str, cursor: str | None
) -> str:
    qp = params.copy()
    if cursor:
        qp[cursor_param] = cursor
    sep = "&" if ("?" in base_url) else "?"
    return f"{base_url}{sep}{urlencode(qp)}" if qp else base_url


def write_jsonl(path: pathlib.Path, records: list[dict]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "ab") as f:
        for rec in records:
            f.write(orjson.dumps(rec))
            f.write(b"\n")
    return len(records)


def stream_endpoint_to_ndjson(ep_name: str, api_cfg: dict) -> list[pathlib.Path]:
    """
    Streams all pages/cursors to NDJSON files under data/raw_json/<ep_name>/page_*.jsonl
    Returns list of created file paths.
    """
    out_dir = RAW_DIR / ep_name
    out_dir.mkdir(parents=True, exist_ok=True)
    created: list[pathlib.Path] = []

    base_url: str = api_cfg["base_url"]
    headers: dict = api_cfg.get("headers", {})
    params: dict = api_cfg.get("params", {})
    rec_path: list = api_cfg.get("records_path", [])
    pg = api_cfg.get("pagination", {"type": "none"})

    typ = pg.get("type", "none")

    if typ == "page":
        page = int(pg.get("start", 1))
        page_param = pg["page_param"]
        stop_when_empty = bool(pg.get("stop_when_empty", True))
        while True:
            url = make_page_url(base_url, params, page_param, page)
            resp = http_get(url, headers=headers)
            payload = resp.json()
            records = get_in(payload, rec_path) if rec_path else payload
            if not isinstance(records, list):
                records = []
            if stop_when_empty and len(records) == 0:
                break
            file = out_dir / f"page_{page:06d}.jsonl"
            write_jsonl(file, records)
            created.append(file)
            page += 1

    elif typ == "cursor":
        cursor_param = pg["cursor_param"]
        cursor_path = pg["cursor_path"]  # where to read the "next cursor" from
        cursor: str | None = None
        page = 1
        while True:
            url = make_cursor_url(base_url, params, cursor_param, cursor)
            resp = http_get(url, headers=headers)
            payload = resp.json()
            records = get_in(payload, rec_path) if rec_path else payload
            if not isinstance(records, list) or len(records) == 0:
                break
            file = out_dir / f"page_{page:06d}.jsonl"
            write_jsonl(file, records)
            created.append(file)

            # move cursor forward; stop if missing
            cursor = get_in(payload, cursor_path)
            if not cursor:
                break
            page += 1

    else:  # "none" -> single call
        url = make_cursor_url(base_url, params, cursor_param="", cursor=None)
        resp = http_get(url, headers=headers)
        payload = resp.json()
        records = get_in(payload, rec_path) if rec_path else payload
        if not isinstance(records, list):
            # allow a single object; wrap it
            records = [records] if isinstance(records, dict) else []
        file = out_dir / "page_000001.jsonl"
        write_jsonl(file, records)
        created.append(file)

    return created


def load_ndjson_to_duckdb(db_path: str, table: str, files_glob: str):
    con = duckdb.connect(db_path)
    con.execute(f"""
        CREATE OR REPLACE TABLE {duckdb.escape_identifier(table)} AS
        SELECT * FROM read_json_auto('{files_glob}');
    """)
    con.close()


def write_parquet_snapshot(db_path: str, table: str, ep_name: str):
    out_dir = PARQUET_DIR / ep_name
    out_dir.mkdir(parents=True, exist_ok=True)
    parquet_path = str(out_dir / f"{table}.parquet")
    con = duckdb.connect(db_path)
    con.execute(
        f"COPY (SELECT * FROM {duckdb.escape_identifier(table)}) TO '{parquet_path}' (FORMAT PARQUET);"
    )
    con.close()
    return parquet_path


def ingest_endpoint(cfg: dict):
    name = cfg["name"]
    db_path = cfg["db_path"]
    table = cfg["table"]
    api_cfg = cfg["api"]
    print(f"\n=== {name}: fetching ===")
    files = stream_endpoint_to_ndjson(name, api_cfg)
    if not files:
        print(f"{name}: No data files created; skipping DuckDB load.")
        return
    print(f"{name}: {len(files)} jsonl files created.")
    glob = str((RAW_DIR / name / "*.jsonl").as_posix())
    print(f"{name}: loading into DuckDB -> {db_path} table {table}")
    load_ndjson_to_duckdb(db_path, table, glob)
    if cfg.get("write_parquet", False):
        pq = write_parquet_snapshot(db_path, table, name)
        print(f"{name}: parquet snapshot -> {pq}")
    print(f"{name}: done.")


def main():
    for endpoint_cfg in CONFIG:
        ingest_endpoint(endpoint_cfg)


if __name__ == "__main__":
    main()
