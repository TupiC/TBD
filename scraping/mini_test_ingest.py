# pip install duckdb requests orjson
import os, pathlib, re, requests, orjson, duckdb

BASE_URL = "https://connector.hub.austria.info/data/"
TOKEN = os.environ.get("HUB_BEARER_TOKEN", "").strip()
if not TOKEN:
    raise SystemExit("Please set HUB_BEARER_TOKEN (no 'Bearer ' prefix needed).")

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",  # EXACT format
    "Accept": "application/json",
}

DATA_DIR = pathlib.Path("data").resolve()
RAW_DIR = DATA_DIR / "raw_json" / "hub_min"
DB_DIR = DATA_DIR / "duckdb"
for d in (RAW_DIR, DB_DIR):
    d.mkdir(parents=True, exist_ok=True)

DB_PATH = DB_DIR / "hub_min.duckdb"
TABLE = "items"


def qident(name: str) -> str:
    return (
        name
        if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name)
        else '"' + name.replace('"', '""') + '"'
    )


def write_jsonl(path: pathlib.Path, records):
    with open(path, "wb") as f:
        for rec in records:
            f.write(orjson.dumps(rec))
            f.write(b"\n")


def main():
    print("=== hub-min: fetching ===")
    r = requests.get(BASE_URL, headers=HEADERS, timeout=60)
    print(f"HTTP {r.status_code}")
    if r.status_code >= 400:
        print(r.text[:500])
        r.raise_for_status()

    try:
        payload = r.json()
    except ValueError:
        raise SystemExit("Response was not JSON (check token/URL).")

    # Accept single object or list
    records = payload if isinstance(payload, list) else [payload]

    out_file = RAW_DIR / "page_000001.jsonl"
    write_jsonl(out_file, records)
    print(f"wrote {len(records)} record(s) -> {out_file}")

    # Load into DuckDB
    con = duckdb.connect(str(DB_PATH))
    glob = (RAW_DIR / "*.jsonl").as_posix()
    con.execute(f"""
        CREATE OR REPLACE TABLE {qident(TABLE)} AS
        SELECT * FROM read_json_auto('{glob}');
    """)
    count = con.execute(f"SELECT COUNT(*) FROM {qident(TABLE)}").fetchone()[0]
    print(f"duckdb: loaded {count} row(s) into {DB_PATH} table {TABLE}")

    # --- Preview: parse JSON-encoded strings into real JSON and show a few useful columns ---
    # from_json() turns a JSON string into a JSON value DuckDB can work with.
    preview_sql = f"""
        SELECT
            id,
            title,
            city,
            country,
            json_array_length(from_json(addresses))            AS addresses_len,
            json_array_length(from_json(categories))           AS categories_len,
            json_array_length(from_json(features))             AS features_len,
            json_array_length(from_json(media_objects))        AS media_len
        FROM {qident(TABLE)}
        LIMIT 5
    """
    res = con.execute(preview_sql)
    cols = [d[0] for d in res.description]
    rows = res.fetchall()

    # Pretty print
    widths = (
        [max(len(str(c)), *(len(str(r[i])) for r in rows)) for i, c in enumerate(cols)]
        if rows
        else [len(c) for c in cols]
    )

    def fmt_row(r):
        return " | ".join(str(v).ljust(widths[i]) for i, v in enumerate(r))

    print("\npreview (parsed counts of JSON-in-string fields):")
    if rows:
        print(fmt_row(cols))
        print("-+-".join("-" * w for w in widths))
        for r in rows:
            print(fmt_row(r))
    else:
        print("(no rows)")

    # Example: fully expand one JSON field (addresses) into rows
    expand_sql = f"""
        SELECT
            i.id,
            a.value->>'rel'   AS rel,
            a.value->>'name'  AS name,
            a.value->>'email' AS email,
            a.value->>'phone' AS phone
        FROM {qident(TABLE)} i,
             json_each(from_json(i.addresses)) AS a
        LIMIT 10
    """
    print("\naddresses (expanded):")
    res2 = con.execute(expand_sql)
    cols2 = [d[0] for d in res2.description]
    rows2 = res2.fetchall()
    widths2 = (
        [
            max(len(str(c)), *(len(str(r[i])) for r in rows2))
            for i, c in enumerate(cols2)
        ]
        if rows2
        else [len(c) for c in cols2]
    )

    def fmt_row2(r):
        return " | ".join(str(v).ljust(widths2[i]) for i, v in enumerate(r))

    if rows2:
        print(fmt_row2(cols2))
        print("-+-".join("-" * w for w in widths2))
        for r in rows2:
            print(fmt_row2(r))
    else:
        print("(no rows)")

    con.close()
    print("\nhub-min: done.")


if __name__ == "__main__":
    main()
