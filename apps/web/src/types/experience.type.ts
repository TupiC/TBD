import { MapPoint } from "./map-point.type";

export type Month =
  | 1 | 2 | 3 | 4 | 5 | 6
  | 7 | 8 | 9 | 10 | 11 | 12;

export type Weekday = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";

export const LABEL_DE: Record<Weekday, string> = {
  mo: "MO",
  tu: "DI",
  we: "MI",
  th: "DO",
  fr: "FR",
  sa: "SA",
  su: "SO",
};
export const LABEL_EN: Record<Weekday, string> = {
  mo: "MO",
  tu: "TU",
  we: "WE",
  th: "TH",
  fr: "FR",
  sa: "SA",
  su: "SU",
};
export const toMapPoint = (exp: Experience, idx: number): MapPoint => ({
  id: exp.key ?? idx,
  lat: exp.geo.lat,
  lng: exp.geo.lon,
  title: exp.name,
  thumbnailUrl: exp.hero_image,
  description: exp.summary,
  category: exp.category,
  url: exp.url,
});
export const toMapPoints = (exps: Experience[]) => exps.map(toMapPoint);
export function dayFromDate(d: Date): Weekday {
  const MAP = ["su", "mo", "tu", "we", "th", "fr", "sa"] as const;
  type Idx = 0 | 1 | 2 | 3 | 4 | 5 | 6;
  return MAP[d.getDay() as Idx];
}

export interface OpeningHoursDay {
  /** Minutes after midnight, e.g. 930 = 9:30 */
  from: number;
  /** Minutes after midnight, e.g. 1700 = 17:00 */
  to: number;
}

export type OpeningHours = Record<Weekday, OpeningHoursDay> | null;

export interface Address {
  street: string;
  postal_code: string;
  locality: string;
  region: string;
  country: string | null;
}

export interface Geo {
  lat: number;
  lon: number;
}

export const weekdayOrder: Weekday[] = ["mo","tu","we","th","fr","sa","su"]; 

export const categoryLabel: Record<Category, string> = {
  museum: "Museum",
  trail: "Trail",
  church: "Church",
  excursion: "Excursion",
  outdoor: "Outdoor",
  square: "Square",
};

export type OpenState =
  | { state: "open"; closesAt: number }
  | { state: "closed"; nextOpens?: { day: Weekday; from: number } }
  | { state: "unknown" };

export const weekdayLabel: Record<Weekday, string> = {
  mo: "Mon", tu: "Tue", we: "Wed", th: "Thu", fr: "Fri", sa: "Sat", su: "Sun",
};

export type AccessibilityState = "full" | "partly" | "none";
export type Category = "museum" | "trail" | "church" | "excursion" | "outdoor" | "square" | "trail";

export interface Experience {
  key: string;
  origin_url: string;
  category: Category; 
  url: string;
  source_url: string;
  source_list: string;
  name: string;
  summary: string;
  hero_image: string;
  address: Address;
  geo: Geo;
  start_month: Month;
  end_month: Month;
  opening_hours: OpeningHours;
  adults_only: boolean;
  free_access: boolean;
  images: string[];
  dogs_allowed: boolean;
  accessibility_state: AccessibilityState;
}
