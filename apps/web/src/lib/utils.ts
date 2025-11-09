import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Weekday,OpeningHours, weekdayOrder,OpenState } from '@/types/experience.type';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const minutesToHHMM = (m: number) => {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
};

export function nowInMinutes(d: Date) { return d.getHours() * 60 + d.getMinutes(); }

export const weekdayKey = (d: Date): Weekday => weekdayOrder[d.getDay()] ?? "su";

export function computeOpenState(hours: OpeningHours, now: Date): OpenState {
  if (!hours) return { state: "unknown" };
  const todayKey = weekdayKey(now);
  const today = hours[todayKey];
  const cur = nowInMinutes(now);
  if (today && typeof today.from === "number" && typeof today.to === "number") {
    if (cur >= today.from && cur < today.to) {
      return { state: "open", closesAt: today.to };
    }
  }
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const k = weekdayKey(d);
    const oh = hours[k];
    if (oh) return { state: "closed", nextOpens: { day: k, from: oh.from } };
  }
  return { state: "closed" };
}

export const imgFallback =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect width='100%' height='100%' fill='#111'/></svg>`
  );