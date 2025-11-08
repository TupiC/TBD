# pip install duckdb requests orjson
import os, pathlib, requests, orjson, duckdb

URL = "https://connector.hub.austria.info/data/"
TOKEN = os.environ.get("HUB_BEARER_TOKEN", "").strip()
if not TOKEN:
    raise SystemExit("Set HUB_BEARER_TOKEN (without the 'Bearer ' prefix).")

HEADERS = {"Authorization": f"Bearer {TOKEN}", "Accept": "application/json"}

# Folders / paths
DATA_DIR = pathlib.Path("data")
RAW_DIR = DATA_DIR / "raw_json" / "hub_dump"
DB_DIR = DATA_DIR / "duckdb"
RAW_DIR.mkdir(parents=True, exist_ok=True)
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "hub_dump.duckdb"
TABLE = "items"
NDJSON = RAW_DIR / "page_000001.jsonl"


def write_ndjson(obj):
    """Write payload to NDJSON:
    - if list -> each element as a line
    - if dict with 'data' list -> each element as a line
    - else -> write the object as a single line
    """
    if isinstance(obj, list):
        records = obj
    elif isinstance(obj, dict) and isinstance(obj.get("data"), list):
        records = obj["data"]
    else:
        records = [obj]

    with open(NDJSON, "wb") as f:
        for rec in records:
            f.write(orjson.dumps(rec))
            f.write(b"\n")
    return len(records)


def main():
    print("Fetching …")
    r = requests.get(URL, headers=HEADERS, timeout=120)
    r.raise_for_status()

    try:
        payload = r.json()
    except ValueError:
        raise SystemExit("Response was not JSON. Check token/URL.")

    n = write_ndjson(payload)
    print(f"Wrote {n} record(s) -> {NDJSON}")

    # Load into DuckDB (overwrite table)
    con = duckdb.connect(str(DB_PATH))
    con.execute(f"""
        CREATE OR REPLACE TABLE {TABLE} AS
        SELECT * FROM read_json_auto('{(RAW_DIR/'*.jsonl').as_posix()}');
    """)
    cnt = con.execute(f"SELECT COUNT(*) FROM {TABLE}").fetchone()[0]
    print(f"Loaded {cnt} row(s) into {DB_PATH} (table {TABLE})")

    # Tiny preview
    preview = con.execute(f"SELECT * FROM {TABLE} LIMIT 5").fetchall()
    print("Preview (up to 5 rows):")
    for row in preview:
        print(row)
    con.close()


if __name__ == "__main__":
    main()
