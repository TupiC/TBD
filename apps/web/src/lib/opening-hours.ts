export const DAY_KEYS = ["su", "mo", "tu", "we", "th", "fr", "sa"] as const;
export type DayKey = typeof DAY_KEYS[number];

export type DaySlot = { from: number; to: number }; // HHMM, e.g. 930 -> 09:30
export type OpeningHours = Record<DayKey, DaySlot> | null;

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const hhmmToMinutes = (hhmm: number): number => {
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  if (h < 0 || h > 23 || m < 0 || m > 59) return NaN;
  return h * 60 + m;
};

export const ymdOf = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

export const weekdayName = (ts: number): string => {
  const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"] as const;
  return WEEKDAYS[new Date(ts).getDay() as 0|1|2|3|4|5|6];
};

export const getOpeningWindowTs = (
  opening: OpeningHours,
  ts: number
): { openTs: number; closeTs: number } | "closed" | "always" | null => {
  if (opening === null) return "always";
  if (opening == null) return null;

  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const dayStart = d.getTime();

  const idx = new Date(ts).getDay() as 0|1|2|3|4|5|6;
  const key = DAY_KEYS[idx];
  const slot = opening[key];
  if (!slot) return null;

  if (slot.from === 0 && slot.to === 0) return "closed";

  const openMin = hhmmToMinutes(slot.from);
  const closeMin = hhmmToMinutes(slot.to);
  if (!Number.isFinite(openMin) || !Number.isFinite(closeMin)) return null;

  return { openTs: dayStart + openMin * 60_000, closeTs: dayStart + closeMin * 60_000 };
};

/**
 * Can we shift this visit by deltaMs fully within its day's opening window?
 * Reads opening hours from visit.opening_hours or visit.experience?.opening_hours.
 */
export const canShiftWithinOpening = (
  visit: { start: number; end: number; opening_hours?: OpeningHours; experience?: { opening_hours?: OpeningHours } },
  deltaMs: number
): { ok: boolean; msg?: string } => {
  const opening: OpeningHours =
    (visit as any).opening_hours ?? (visit as any).experience?.opening_hours ?? undefined;

  const win = getOpeningWindowTs(opening as any, visit.start);
  if (win === "always" || win === null) return { ok: true };
  if (win === "closed") {
    return { ok: false, msg: `Geschlossen am ${weekdayName(visit.start)} (${ymdOf(visit.start)}).` };
  }

  const { openTs, closeTs } = win;
  const newStart = visit.start + deltaMs;
  const newEnd = visit.end + deltaMs;

  if (newStart < openTs || newEnd > closeTs) {
    const oh = (ts: number) => {
      const d = new Date(ts);
      return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    };
    return {
      ok: false,
      msg: `Verschieben nicht möglich: Öffnungszeiten am ${weekdayName(visit.start)} (${ymdOf(visit.start)}) sind ${oh(openTs)}–${oh(closeTs)}.`,
    };
  }
  return { ok: true };
};
