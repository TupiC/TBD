import duckdb

con = duckdb.connect("data/duckdb/hub_dump.duckdb")
rows = con.execute("""
    SELECT COUNT(*)
    FROM items
    WHERE County = 'Salzburg'
""").fetchall()

for row in rows:
    print(row)  # prints the whole tuple

con.close()
