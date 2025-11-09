// Reusable date helpers for the timeline / visits

export type YmdKey = `${number}-${number}-${number}`;

/** Build a YYYY-MM-DD key (local date) from a Date or timestamp. */
export function toYmdKey(input: Date | number): YmdKey {
  const d = typeof input === "number" ? new Date(input) : input;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}` as YmdKey;
}

/** Parse a YYYY-MM-DD key safely. */
export function parseYmdKey(key: YmdKey): { y: number; m: number; d: number } {
  const [ys, ms, ds] = key.split("-") as [string, string, string];
  const y = parseInt(ys, 10);
  const m = parseInt(ms, 10);
  const d = parseInt(ds, 10);
  return { y, m, d };
}

/** Format a YYYY-MM-DD key as a readable day label. */
export function formatDayLabel(key: YmdKey, locale = "de-AT"): string {
  const { y, m, d } = parseYmdKey(key);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Format a timestamp as HH:mm (or pass a different locale/options if needed). */
export function formatTime(ts: number, locale = "de-AT"): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
    new Date(ts)
  );
}
export const formatDuration = (ms: number): string => {
  const mins = Math.max(0, Math.round(ms / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  };