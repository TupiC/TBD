import json
import duckdb
from pathlib import Path

DB = "data/duckdb/hub_dump.duckdb"
OUT_DIR = Path("data/exports")
OUT_DIR.mkdir(parents=True, exist_ok=True)
JSON_PATH = OUT_DIR / "salzburg_items.json"  # array JSON
NDJSON_PATH = OUT_DIR / "salzburg_items.jsonl"  # newline-delimited JSON

con = duckdb.connect(DB)
res = con.execute("""
    SELECT *
    FROM items
    WHERE County = 'Salzburg'
""")

# Build list of dicts
cols = [d[0] for d in res.description]
rows = res.fetchall()
records = [dict(zip(cols, row)) for row in rows]

# Write array JSON (pretty)
with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=2, default=str)

# Write NDJSON
with open(NDJSON_PATH, "w", encoding="utf-8") as f:
    for rec in records:
        f.write(json.dumps(rec, ensure_ascii=False, default=str))
        f.write("\n")

# Also print to stdout (first few)
print(json.dumps(records[:3], ensure_ascii=False, indent=2, default=str))

con.close()
print(f"Wrote {len(records)} records -> {JSON_PATH} (array) and {NDJSON_PATH} (ndjson)")
