#!/usr/bin/env python3
"""
Enrich Salzburg POIs with:
- price_full_text         (string)
- opening_hours_full_text (string)
- accessibility_full_text (string)
- impressions             (list[str] absolute HTTP/HTTPS only)
- opening_all_year        (bool)            # top-level (kept for compatibility)
- accessibility_state     ("full"|"none"|"unknown")
- NEW fixed fields on every record:
    unrestricted_access   (bool)            # always True (as requested)
    dogs_allowed          (bool)            # always False (as requested)
    opening_hours         (object)          # default weekly schedule below
        mo/tu/we/th/fr/sa/su: {from:int, to:int}
        opened_on_holidays: bool
        opening_all_year:   bool            # derived from text, same as top-level
- NEW field:
    closed_days           (array of {day:int, month:int})

Run:
  pip install requests beautifulsoup4==4.12.2 lxml>=5.3.0 tqdm
  python enrich_sections.py --in scraped.json --out enriched.json --delay 0.7
"""

import argparse
import json
import re
import time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

UA = "Mozilla/5.0 (compatible; SalzburgSectionEnricher/1.4; +https://example.org)"

RE_ALL_YEAR = re.compile(r"ganzj(?:ä|ae)hrig", re.IGNORECASE)
RE_ACCESS_FULL = re.compile(r"barrierefrei(?:\s*-\s*)?zug(?:ä|ae)nglich", re.IGNORECASE)
RE_ACCESS_NONE = re.compile(r"nicht\s+barrierefrei", re.IGNORECASE)

DEFAULT_OPENING_HOURS = {
    "mo": {"from": 0, "to": 0},
    "tu": {"from": 1000, "to": 1700},
    "we": {"from": 1000, "to": 1700},
    "th": {"from": 1000, "to": 1700},
    "fr": {"from": 1000, "to": 1700},
    "sa": {"from": 1000, "to": 1700},
    "su": {"from": 0, "to": 0},
    "opened_on_holidays": False,
    "opening_all_year": False,
}

# ---- helpers ---------------------------------------------------------------


def fetch_html(url: str, timeout=25) -> str | None:
    try:
        r = requests.get(url, headers={"user-agent": UA}, timeout=timeout)
        if r.status_code >= 400:
            return None
        return r.text
    except Exception:
        return None


def _normalize_whitespace(text: str) -> str:
    text = text.replace("\r", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = "\n".join(ln.strip() for ln in text.split("\n"))
    return text.strip()


def _text_from_wysiwyg(container) -> str:
    if not container:
        return ""
    for br in container.find_all("br"):
        br.replace_with("\n")
    parts = []
    for el in container.find_all(["p", "li"]):
        t = el.get_text(" ", strip=True)
        if t:
            parts.append(t)
    if not parts:
        return _normalize_whitespace(container.get_text("\n", strip=True))
    return _normalize_whitespace("\n".join(parts))


# ---- extractors: price / opening / accessibility / images ------------------


def extract_prices(soup: BeautifulSoup, base_url: str) -> str:
    blocks = []
    for div in soup.select('div[id^="price-acc-detail"] .panel-body .wysiwyg'):
        blocks.append(_text_from_wysiwyg(div))
    if not blocks:
        for h in soup.find_all(["h2", "h3", "h4", "strong", "b"]):
            txt = (h.get_text(" ", strip=True) or "").lower()
            if any(
                w in txt
                for w in [
                    "preis",
                    "preise",
                    "eintritt",
                    "admission",
                    "ticket",
                    "tickets",
                    "kosten",
                ]
            ):
                sib = h.find_next_sibling()
                hops = 0
                while sib and hops < 4:
                    if "wysiwyg" in " ".join(sib.get("class", [])) or sib.name in [
                        "p",
                        "ul",
                        "ol",
                        "div",
                        "table",
                    ]:
                        blocks.append(
                            _normalize_whitespace(sib.get_text("\n", strip=True))
                        )
                    sib = sib.find_next_sibling()
                    hops += 1
    out, seen = [], set()
    for b in blocks:
        b = (b or "").strip()
        if b and b.lower() not in seen:
            seen.add(b.lower())
            out.append(b)
    return "\n\n".join(out[:3])


def extract_opening_hours_text(soup: BeautifulSoup) -> str:
    blocks = []
    for div in soup.select('div[id^="ot_acc-detail-0"] .panel-body .wysiwyg'):
        blocks.append(_text_from_wysiwyg(div))
    if not blocks:
        for h in soup.find_all(["h2", "h3", "h4", "strong", "b"]):
            txt = (h.get_text(" ", strip=True) or "").lower()
            if any(
                w in txt
                for w in [
                    "öffnungszeiten",
                    "oeffnungszeiten",
                    "opening hours",
                    "opening time",
                    "geöffnet",
                    "open",
                    "geschlossen",
                ]
            ):
                sib = h.find_next_sibling()
                hops = 0
                while sib and hops < 4:
                    if "wysiwyg" in " ".join(sib.get("class", [])) or sib.name in [
                        "p",
                        "ul",
                        "ol",
                        "div",
                        "table",
                    ]:
                        blocks.append(
                            _normalize_whitespace(sib.get_text("\n", strip=True))
                        )
                    sib = sib.find_next_sibling()
                    hops += 1
    out, seen = [], set()
    for b in blocks:
        b = (b or "").strip()
        if b and b.lower() not in seen:
            seen.add(b.lower())
            out.append(b)
    return "\n\n".join(out[:3])


def extract_accessibility(soup: BeautifulSoup) -> str:
    blocks = []
    for div in soup.select('div[id^="ot_acc-detail-1"] .panel-body .wysiwyg'):
        blocks.append(_text_from_wysiwyg(div))
    if not blocks:
        for h in soup.find_all(["h2", "h3", "h4", "strong", "b"]):
            txt = (h.get_text(" ", strip=True) or "").lower()
            if any(
                w in txt
                for w in [
                    "barriere",
                    "barrierefrei",
                    "accessibility",
                    "wheelchair",
                    "rollstuhl",
                ]
            ):
                sib = h.find_next_sibling()
                hops = 0
                while sib and hops < 4:
                    if "wysiwyg" in " ".join(sib.get("class", [])) or sib.name in [
                        "p",
                        "ul",
                        "ol",
                        "div",
                    ]:
                        blocks.append(
                            _normalize_whitespace(sib.get_text("\n", strip=True))
                        )
                    sib = sib.find_next_sibling()
                    hops += 1
    out, seen = [], set()
    for b in blocks:
        b = (b or "").strip()
        if b and b.lower() not in seen:
            seen.add(b.lower())
            out.append(b)
    return "\n\n".join(out[:2])


def extract_impressions(soup: BeautifulSoup, base_url: str) -> list[str]:
    """Collect only HTTP/HTTPS image URLs (drop data: etc.)."""
    urls: list[str] = []

    def add(u: str):
        if not u:
            return
        if not urlparse(u).scheme:
            u = urljoin(base_url, u)
        scheme = urlparse(u).scheme.lower()
        if scheme not in ("http", "https"):
            return
        if u not in urls:
            urls.append(u)

    header = None
    for h in soup.find_all(["h2", "h3"]):
        txt = (h.get_text(" ", strip=True) or "").lower()
        if "impressionen" in txt or "impressions" in txt:
            header = h
            break

    containers = []
    if header:
        sib = (
            header.parent
            if header.parent and header.parent.name != "[document]"
            else header
        )
        for _ in range(8):
            sib = sib.find_next_sibling()
            if not sib:
                break
            containers.append(sib)
    containers += soup.select(
        ".gallery, .gallery-main, .js-sliderThumbnav, .js-sliderThumbnav__main"
    )

    for cont in containers:
        for pic in cont.find_all("picture"):
            d = pic.get("data-default-src")
            add(d)
            for src in pic.find_all("source"):
                ss = src.get("srcset")
                if ss:
                    for part in ss.split(","):
                        add(part.strip().split(" ")[0])
            img = pic.find("img")
            if img and img.get("src"):
                add(img["src"])
        for img in cont.find_all("img"):
            if img.get("src"):
                add(img["src"])

    return urls


# ---- closed_days extraction ------------------------------------------------

MONTH_MAP = {
    # German
    "jänner": 1,
    "jaenner": 1,
    "januar": 1,
    "jan": 1,
    "februar": 2,
    "feb": 2,
    "märz": 3,
    "maerz": 3,
    "mrz": 3,
    "april": 4,
    "apr": 4,
    "mai": 5,
    "juni": 6,
    "jun": 6,
    "juli": 7,
    "jul": 7,
    "august": 8,
    "aug": 8,
    "september": 9,
    "sep": 9,
    "sept": 9,
    "oktober": 10,
    "okt": 10,
    "oct": 10,
    "november": 11,
    "nov": 11,
    "dezember": 12,
    "dez": 12,
    "dec": 12,
    # English
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12,
}

CLOSE_HINTS = re.compile(
    r"(geschlossen|schließt|schliesst|geschlossen\s*am|closed\s*on|closed|no\s*entry)",
    re.IGNORECASE,
)


def _extract_dates_numeric(blob: str):
    """Find numeric dates like 24.12., 1.1. or 24/12; returns (day, month) pairs."""
    results = []
    pat = re.compile(r"\b(\d{1,2})[\.\-\/](\d{1,2})(?:[\.\-\/](\d{2,4}))?\b")
    for m in pat.finditer(blob):
        day = int(m.group(1))
        month = int(m.group(2))
        if 1 <= day <= 31 and 1 <= month <= 12:
            results.append({"day": day, "month": month})
    # compact forms like "24./25.12."
    compact = re.findall(r"\b((?:\d{1,2}\.){2,})(\d{1,2})\.?\b", blob)
    for seq, month in compact:
        try:
            month = int(month)
            days = [int(x.strip(".") or "0") for x in seq.split(".") if x.strip()]
            for d in days:
                if 1 <= d <= 31 and 1 <= month <= 12:
                    results.append({"day": d, "month": month})
        except Exception:
            pass
    return results


def _extract_dates_named(blob: str):
    """Find dates like 24. Dezember, 1 January, 31 Okt."""
    results = []
    pat = re.compile(
        r"\b(\d{1,2})\.?\s*(j[äa]nner|jaenner|januar|jan|februar|feb|m[äa]rz|maerz|mrz|april|apr|mai|juni|jun|juli|jul|august|aug|september|sep|sept|oktober|okt|oct|november|nov|dezember|dez|dec|january|february|march|april|may|june|july|august|september|october|november|december)\b",
        re.IGNORECASE,
    )
    for m in pat.finditer(blob):
        day = int(m.group(1))
        mon_name = m.group(2).lower()
        mon_name = mon_name.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
        month = MONTH_MAP.get(mon_name)
        if month and 1 <= day <= 31:
            results.append({"day": day, "month": month})
    return results


def extract_closed_days_from_text(text: str):
    """
    Extract closed days only from lines/sentences that indicate closure (German/English).
    Returns list of unique {day:int, month:int}.
    """
    if not text:
        return []
    chunks = re.split(r"[\n\.;!]+", text)
    candidates = [c for c in chunks if CLOSE_HINTS.search(c)]
    pairs = []
    for c in candidates:
        pairs.extend(_extract_dates_numeric(c))
        pairs.extend(_extract_dates_named(c))
    # Dedupe
    seen = set()
    out = []
    for p in pairs:
        key = (p["day"], p["month"])
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out


# ---- state & fixed fields --------------------------------------------------


def classify_accessibility_state(access_text: str | None) -> str:
    blob = access_text or ""
    if RE_ACCESS_FULL.search(blob):
        return "full"
    if RE_ACCESS_NONE.search(blob):
        return "none"
    return "unknown"


def add_fixed_fields(enriched: dict, opening_all_year_flag: bool) -> None:
    """Add required fixed fields to every entry."""
    enriched["unrestricted_access"] = True
    enriched["dogs_allowed"] = False
    opening_hours = {
        "mo": dict(DEFAULT_OPENING_HOURS["mo"]),
        "tu": dict(DEFAULT_OPENING_HOURS["tu"]),
        "we": dict(DEFAULT_OPENING_HOURS["we"]),
        "th": dict(DEFAULT_OPENING_HOURS["th"]),
        "fr": dict(DEFAULT_OPENING_HOURS["fr"]),
        "sa": dict(DEFAULT_OPENING_HOURS["sa"]),
        "su": dict(DEFAULT_OPENING_HOURS["su"]),
        "opened_on_holidays": DEFAULT_OPENING_HOURS["opened_on_holidays"],
        "opening_all_year": bool(opening_all_year_flag),
    }
    enriched["opening_hours"] = opening_hours


# ---- main processing -------------------------------------------------------


def process_item(item: dict, delay: float):
    url = item.get("url")
    enriched = dict(item)

    detected_opening_all_year = False

    if url:
        html = fetch_html(url)
        if html:
            soup = BeautifulSoup(html, "lxml")
            price_text = extract_prices(soup, url)
            opening_text = extract_opening_hours_text(soup)
            accessibility_text = extract_accessibility(soup)
            imgs = extract_impressions(soup, url)

            if price_text:
                enriched["price_full_text"] = price_text
            if opening_text:
                enriched["opening_hours_full_text"] = opening_text
                # derive closed_days from opening text
                closed = extract_closed_days_from_text(opening_text)
                if closed:
                    enriched["closed_days"] = closed
            if accessibility_text:
                enriched["accessibility_full_text"] = accessibility_text
            if imgs:
                enriched["impressions"] = imgs

            detected_opening_all_year = bool(RE_ALL_YEAR.search(opening_text or ""))

    enriched["opening_all_year"] = detected_opening_all_year
    add_fixed_fields(enriched, detected_opening_all_year)
    enriched["accessibility_state"] = classify_accessibility_state(
        enriched.get("accessibility_full_text")
    )

    time.sleep(delay)
    return enriched


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--out", dest="out", required=True)
    ap.add_argument("--delay", type=float, default=0.7)
    args = ap.parse_args()

    with open(args.inp, "r", encoding="utf-8") as f:
        data = json.load(f)

    out = []
    for item in tqdm(data, desc="Enriching sections"):
        out.append(process_item(item, args.delay))

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(out)} records → {args.out}")


if __name__ == "__main__":
    main()
