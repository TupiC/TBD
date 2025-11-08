type Month =
  | 1 | 2 | 3 | 4 | 5 | 6
  | 7 | 8 | 9 | 10 | 11 | 12;

type Weekday = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";

interface OpeningHoursDay {
  /** Minutes after midnight, e.g. 930 = 9:30 */
  from: number;
  /** Minutes after midnight, e.g. 1700 = 17:00 */
  to: number;
}

type OpeningHours = Record<Weekday, OpeningHoursDay>;

interface Address {
  street: string;
  postal_code: string;
  locality: string;
  region: string;
  country: string | null;
}

interface Geo {
  lat: number;
  lon: number;
}

type AccessibilityState = "full" | "partly" | "none";
type Category = "museum" | "trail" | "church" | "excursion" | "outdoor" | "square" | "trail";

export interface Place {
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
