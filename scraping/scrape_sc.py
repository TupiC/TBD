#!/usr/bin/env python3
"""
All-site crawler for salzburg.info — Events & Attractions only
--------------------------------------------------------------
Crawls sitemap(s) and selected pages on salzburg.info, extracts only items that
are Events or Attractions (schema.org detection + URL heuristics), and exports
a lean, generic JSON.

FOCUS
- Include: schema.org Event, TouristAttraction, Place, LandmarksOrHistoricalBuilding,
  CivicStructure, LocalBusiness (when it clearly looks like a visitor attraction).
- Exclude: news, press, generic content unless it carries JSON-LD Event/Attraction.

USAGE
  python salzburg_crawler.py --root https://www.salzburg.info \
      --out salzburg_events_attractions.json \
      --delay 0.6 --max 10000

Options
  --root        Root site (default: https://www.salzburg.info)
  --out         Output JSON path
  --delay       Delay between requests (seconds) [default 0.6]
  --max         Max pages to fetch from sitemap (0 = no limit) [default 0]
  --fallback    Also try HTML heuristics for attraction pages without JSON-LD
  --include     Extra URL substring filters (comma-separated), applied in addition to defaults
  --exclude     URL substrings to skip (comma-separated)

OUTPUT SCHEMA (lean, generic)
{
  id: string,
  name: string|null,
  category: "event"|"attraction"|null,
  url: string,
  start_date: string|null,      # for events (ISO if found)
  end_date: string|null,        # for events
  summary: string|null,
  address: {street, postal_code, locality, region, country} | null,
  geo: {lat, lon} | null,
  opening_hours: [string]|null,
  price: {min,max,currency,included_in_card}|null,
  tags: [string],
  images: [string],
  source_url: string
}
"""

import argparse
import json
import re
import time
from xml.etree import ElementTree as ET
from urllib.parse import urlparse, urljoin

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

DEFAULT_ROOT = "https://www.salzburg.info"

HEADERS = {
    "user-agent": "Mozilla/5.0 (compatible; SalzburgAllSiteCrawler/1.0; +https://example.org)"
}

# Default URL hints we consider relevant (events & attractions)
DEFAULT_INCLUDE_PATTERNS = [
    "/veranstaltungen",  # events (German)
    "/events",  # events (English)
    "/sehenswertes",  # attractions
    "/salzburg/sightseeing",
    "/salzburg/erleben",
]

DEFAULT_EXCLUDE_PATTERNS = [
    "/presse",
    "/jobs",
    "/datenschutz",
    "/impressum",
    "/kontakt",
    "/-/",
    "/search",
    "/suche",
    "/newsletter",
    "/sitemap",
    "/tracking",
    "/cookies",
    "/english/service/press",
    ".pdf",
    ".jpg",
    ".png",
    ".jpeg",
    ".webp",
    ".svg",
]

PREFERRED_TYPES = {
    "Event",
    "TouristAttraction",
    "Place",
    "LocalBusiness",
    "CivicStructure",
    "LandmarksOrHistoricalBuilding",
}


def to_abs(u: str, base: str) -> str:
    try:
        return urljoin(base, u)
    except Exception:
        return u


def slug_from_url(u: str) -> str:
    try:
        path = urlparse(u).path
        parts = [p for p in path.split("/") if p]
        last = parts[-1] if parts else "item"
        slug = re.sub(r"[^a-z0-9]+", "-", last.lower()).strip("-")
        return slug or re.sub(r"[^a-z0-9]+", "-", path.lower()).strip("-")[:40]
    except Exception:
        return re.sub(r"[^a-z0-9]+", "-", u.lower())[:40]


def pick_category_from_type(types) -> str | None:
    if not types:
        return None
    tset = set([types] if isinstance(types, str) else list(types))
    if "Event" in tset:
        return "event"
    if tset & {
        "TouristAttraction",
        "Place",
        "LocalBusiness",
        "CivicStructure",
        "LandmarksOrHistoricalBuilding",
    }:
        return "attraction"
    return None


def parse_jsonld(soup: BeautifulSoup, base_url: str):
    nodes = []
    for tag in soup.select('script[type="application/ld+json"]'):
        txt = tag.string or tag.text or ""
        if not txt.strip():
            continue
        try:
            data = json.loads(txt)
        except Exception:
            continue
        if isinstance(data, list):
            nodes.extend(data)
        elif isinstance(data, dict):
            if "@graph" in data and isinstance(data["@graph"], list):
                nodes.extend(data["@graph"])
            else:
                nodes.append(data)
    # normalize images/urls
    for n in nodes:
        if isinstance(n, dict):
            url = n.get("url")
            if isinstance(url, str):
                n["url"] = to_abs(url, base_url)
            img = n.get("image")
            if isinstance(img, str):
                n["image"] = [to_abs(img, base_url)]
            elif isinstance(img, list):
                n["image"] = [to_abs(x, base_url) for x in img if isinstance(x, str)]
    return nodes


def val(v, *keys, default=None):
    """safe nested getter for common JSON-LD patterns"""
    obj = v
    for k in keys:
        if isinstance(obj, dict):
            obj = obj.get(k)
        else:
            return default
    return obj if obj is not None else default


ADDR_RE = re.compile(r"(.+?)\s*,\s*(\d{4,5})\s+([^,]+)(?:,\s*([^,]+))?")


def extract_attraction_from_jsonld(n: dict):
    addr = n.get("address") or n.get("schema:address")
    geo = n.get("geo")
    opening = n.get("openingHoursSpecification") or n.get("openingHours")
    return {
        "name": n.get("name"),
        "summary": n.get("description"),
        "url": n.get("url"),
        "images": n.get("image") if isinstance(n.get("image"), list) else [],
        "address": {
            "street": addr.get("streetAddress") if isinstance(addr, dict) else None,
            "postal_code": addr.get("postalCode") if isinstance(addr, dict) else None,
            "locality": addr.get("addressLocality") if isinstance(addr, dict) else None,
            "region": addr.get("addressRegion") if isinstance(addr, dict) else None,
            "country": addr.get("addressCountry") if isinstance(addr, dict) else None,
        }
        if isinstance(addr, dict)
        else None,
        "geo": {
            "lat": float(geo.get("latitude")),
            "lon": float(geo.get("longitude")),
        }
        if isinstance(geo, dict) and geo.get("latitude") and geo.get("longitude")
        else None,
        "opening_hours": (
            [
                f"{o.get('dayOfWeek','')} {o.get('opens','')}-{o.get('closes','')}".strip()
                for o in opening
            ]
            if isinstance(opening, list)
            else ([opening] if isinstance(opening, str) else None)
        ),
        "price": None,
        "tags": [],
    }


def extract_event_from_jsonld(n: dict):
    loc = val(n, "location", default=None)
    addr = val(loc, "address", default=None) if isinstance(loc, dict) else None
    geo = val(loc, "geo", default=None) if isinstance(loc, dict) else None
    return {
        "name": n.get("name"),
        "summary": n.get("description"),
        "url": n.get("url"),
        "start_date": n.get("startDate"),
        "end_date": n.get("endDate"),
        "images": n.get("image") if isinstance(n.get("image"), list) else [],
        "address": {
            "street": addr.get("streetAddress") if isinstance(addr, dict) else None,
            "postal_code": addr.get("postalCode") if isinstance(addr, dict) else None,
            "locality": addr.get("addressLocality") if isinstance(addr, dict) else None,
            "region": addr.get("addressRegion") if isinstance(addr, dict) else None,
            "country": addr.get("addressCountry") if isinstance(addr, dict) else None,
        }
        if isinstance(addr, dict)
        else None,
        "geo": {
            "lat": float(geo.get("latitude")),
            "lon": float(geo.get("longitude")),
        }
        if isinstance(geo, dict) and geo.get("latitude") and geo.get("longitude")
        else None,
        "opening_hours": None,
        "price": None,
        "tags": [],
    }


def extract_fallback_attraction(soup: BeautifulSoup, base_url: str):
    # Heuristic extraction when no JSON-LD present
    name = None
    for sel in ["h1", ".headline", ".title", "h2"]:
        t = soup.select_one(sel)
        if t and t.get_text(strip=True):
            name = t.get_text(strip=True)
            break
    summary = None
    m = soup.find("meta", attrs={"name": "description"})
    if m and m.get("content"):
        summary = m["content"].strip()
    if not summary:
        p = soup.find("p")
        summary = p.get_text(strip=True) if p else None

    addr_text = ""
    addr_sel = soup.select_one('[itemprop="address"], address, .address, .c-address')
    if addr_sel:
        addr_text = re.sub(r"\s+", " ", addr_sel.get_text(" ", strip=True))
    address = None
    if addr_text:
        x = ADDR_RE.search(addr_text)
        address = {
            "street": x.group(1) if x else addr_text,
            "postal_code": x.group(2) if x else None,
            "locality": x.group(3) if x else None,
            "region": x.group(4) if x else None,
            "country": None,
        }
    images = []
    og = soup.find("meta", property="og:image")
    if og and og.get("content"):
        images.append(to_abs(og["content"], base_url))

    return {
        "name": name,
        "summary": summary,
        "images": images,
        "address": address,
        "geo": None,
        "opening_hours": None,
        "price": None,
        "tags": [],
    }


def fetch(session: requests.Session, url: str, timeout=25) -> str | None:
    r = session.get(url, headers=HEADERS, timeout=timeout)
    if r.status_code >= 400:
        return None
    return r.text


def read_sitemaps(session: requests.Session, root: str) -> list[str]:
    # Try robots.txt for Sitemap entries
    robots_url = urljoin(root, "/robots.txt")
    urls = set()
    try:
        txt = fetch(session, robots_url)
        if txt:
            for line in txt.splitlines():
                if line.lower().startswith("sitemap:"):
                    sm = line.split(":", 1)[1].strip()
                    urls.add(sm)
    except Exception:
        pass
    if not urls:
        urls.add(urljoin(root, "/sitemap.xml"))

    # parse sitemap(s), following indexes
    def parse_sm(sm_url):
        xml = fetch(session, sm_url)
        if not xml:
            return []
        try:
            tree = ET.fromstring(xml.encode("utf-8") if isinstance(xml, str) else xml)
        except Exception:
            return []
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        locs = []
        if tree.tag.endswith("sitemapindex"):
            for el in tree.findall(".//sm:sitemap/sm:loc", ns):
                locs.append(el.text.strip())
        else:
            for el in tree.findall(".//sm:url/sm:loc", ns):
                locs.append(el.text.strip())
        return locs

    queue = list(urls)
    pages = []
    seen = set()
    while queue:
        sm = queue.pop(0)
        if sm in seen:
            continue
        seen.add(sm)
        locs = parse_sm(sm)
        for loc in locs:
            if loc.endswith(".xml"):
                queue.append(loc)
            else:
                pages.append(loc)
    return pages


def url_allowed(
    u: str, domain: str, include_filters: list[str], exclude_filters: list[str]
) -> bool:
    parsed = urlparse(u)
    if f"{parsed.scheme}://{parsed.netloc}" != domain:
        return False
    if any(ex in u for ex in exclude_filters):
        return False
    # At least one include filter should match
    if include_filters and not any(inc in u for inc in include_filters):
        return False
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=DEFAULT_ROOT)
    ap.add_argument("--out", default="salzburg_events_attractions.json")
    ap.add_argument("--delay", type=float, default=0.6)
    ap.add_argument(
        "--max", type=int, default=0, help="Max pages to fetch (0=no limit)"
    )
    ap.add_argument(
        "--fallback",
        action="store_true",
        help="Fallback to HTML heuristics for attractions with no JSON-LD",
    )
    ap.add_argument(
        "--include", default="", help="Extra include URL substrings, comma-separated"
    )
    ap.add_argument(
        "--exclude", default="", help="Extra exclude URL substrings, comma-separated"
    )
    args = ap.parse_args()

    session = requests.Session()
    session.headers.update(HEADERS)

    root = args.root.rstrip("/")
    domain = f"{urlparse(root).scheme}://{urlparse(root).netloc}"

    include_filters = DEFAULT_INCLUDE_PATTERNS + (
        [s.strip() for s in args.include.split(",") if s.strip()]
    )
    exclude_filters = DEFAULT_EXCLUDE_PATTERNS + (
        [s.strip() for s in args.exclude.split(",") if s.strip()]
    )

    print("Reading sitemaps...")
    candidates = read_sitemaps(session, root)
    print(f"  Sitemap URLs discovered: {len(candidates)}")

    # Filter candidates by include/exclude patterns and domain
    filtered = [
        u
        for u in candidates
        if url_allowed(u, domain, include_filters, exclude_filters)
    ]
    print(f"  After filtering: {len(filtered)} URLs")

    if args.max and len(filtered) > args.max:
        filtered = filtered[: args.max]
        print(f"  Applying max limit: {len(filtered)} URLs")

    out_records = []
    seen_urls = set()

    for url in tqdm(filtered, desc="Crawling"):
        if url in seen_urls:
            continue
        seen_urls.add(url)
        html = fetch(session, url)
        time.sleep(args.delay)
        if not html:
            continue
        soup = BeautifulSoup(html, "lxml")
        jsonld_nodes = parse_jsonld(soup, url)

        # Prefer nodes with types we care about
        picked = []
        for n in jsonld_nodes:
            t = n.get("@type")
            types = {t} if isinstance(t, str) else set(t or [])
            if types & PREFERRED_TYPES:
                picked.append(n)

        if (
            not picked
            and args.fallback
            and any("/sehenswertes" in url or "/sightseeing" in url for _ in [0])
        ):
            # try heuristic attraction extraction
            rec = extract_fallback_attraction(soup, url)
            if rec.get("name"):
                out_records.append(
                    {
                        "id": slug_from_url(url),
                        "name": rec["name"],
                        "category": "attraction",
                        "url": url,
                        "start_date": None,
                        "end_date": None,
                        "summary": rec["summary"],
                        "address": rec["address"],
                        "geo": rec["geo"],
                        "opening_hours": rec["opening_hours"],
                        "price": rec["price"],
                        "tags": rec["tags"],
                        "images": rec["images"],
                        "source_url": url,
                    }
                )
            continue

        for n in picked:
            cat = pick_category_from_type(n.get("@type"))
            if cat == "event":
                data = extract_event_from_jsonld(n)
            else:
                data = extract_attraction_from_jsonld(n)

            out_records.append(
                {
                    "id": slug_from_url(data.get("url") or url),
                    "name": data.get("name"),
                    "category": cat,
                    "url": data.get("url") or url,
                    "start_date": data.get("start_date") if cat == "event" else None,
                    "end_date": data.get("end_date") if cat == "event" else None,
                    "summary": data.get("summary"),
                    "address": data.get("address"),
                    "geo": data.get("geo"),
                    "opening_hours": data.get("opening_hours"),
                    "price": data.get("price"),
                    "tags": data.get("tags") or [],
                    "images": data.get("images") or [],
                    "source_url": url,
                }
            )

    # Deduplicate by URL/id
    by_key = {}

    def score(r):
        return (
            (1 if r.get("geo") else 0)
            + (1 if r.get("images") else 0)
            + (1 if r.get("summary") else 0)
            + (1 if r.get("start_date") else 0)
        )

    for r in out_records:
        k = r.get("id") or r.get("url")
        prev = by_key.get(k)
        if not prev or score(r) >= score(prev):
            by_key[k] = r

    final = list(by_key.values())
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(final, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(final)} records → {args.out}")


if __name__ == "__main__":
    main()
