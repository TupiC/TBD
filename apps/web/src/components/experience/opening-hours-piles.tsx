import React from "react";
import type { OpeningHours, OpeningHoursDay, Weekday } from  "@/types/experience.type";
import { dayFromDate, LABEL_DE, LABEL_EN, weekdayOrder } from  "@/types/experience.type";


// === Props ================================================================
export interface OpeningHoursPillsProps {
  openingHours: OpeningHours; // null => all closed/unknown
  /** highlight this date's weekday. Defaults to today. */
  currentDate?: Date;
  /** de | en labels */
  locale?: "de" | "en";
  /** When true, stretches the selected pill vertically. */
  tallSelected?: boolean;
}

// === Helpers ==============================================================
function getLabel(key: Weekday, locale: "de" | "en") {
  return locale === "en" ? LABEL_EN[key] : LABEL_DE[key];
}

function hhmmToLabel(n: number): string {
  // n is in HHMM, e.g. 700 => 07:00, 930 => 09:30, 1715 => 17:15
  const h = Math.floor(n / 100);
  const m = n % 100;
  return m === 0 ? `${h}` : `${h}:${m.toString().padStart(2, "0")}`;
}

// === Component ============================================================
export default function OpeningHoursPills({
  openingHours,
  currentDate = new Date(),
  locale = "de",
  tallSelected = true,
}: OpeningHoursPillsProps) {
  const selected = dayFromDate(currentDate);

  const pillBase =
    "flex flex-col items-center justify-center rounded-full w-16 h-16 bg-neutral-200 text-neutral-900 select-none";
  const pillSelectedOpen = `bg-[#8F2A24] text-white font-semibold${tallSelected ? "" : ""}`;
  const pillClosed = "text-neutral-500 line-through";
  const pillSelectedClosed = "ring-2 ring-[#8F2A24]"; // highlight current day even if closed

  const isAllClosed = openingHours === null;

  return (
    <div className="flex gap-3 w-full py-2">
      {weekdayOrder.map((day) => {
        const isSelected = day === selected;
        const oh: OpeningHoursDay | undefined = openingHours ? openingHours[day] : undefined;
        const isClosed = isAllClosed || !oh || (oh.from === 0 && oh.to === 0);

        const base = "flex flex-col items-center justify-center rounded-full h-16 w-full select-none";
        const normalBg = "bg-neutral-200 text-neutral-900";
        const selectedBg = "bg-[#A52522] text-white";
        const subduedText = "text-neutral-500"; 

        const cls = [
          base,
          isSelected ? selectedBg : normalBg,
          !isSelected && isClosed ? subduedText : "",
        ].join(" ");

        return (
          <div key={day} className={cls} aria-label={`${getLabel(day, locale)} ${isClosed ? "closed" : "open"}`}  style={isSelected ? { backgroundColor: "#A52522", color: "#fff" } : undefined}>
            <div className="text-sm font-bold tracking-wide leading-none">{getLabel(day, locale)}</div>
            {isClosed ? (
              <div className="text-base leading-none mt-1">×</div>
            ) : (
              <div className="text-sm leading-none mt-1">
                {hhmmToLabel(oh.from)}-{hhmmToLabel(oh.to)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// === Minimal demo =========================================================
export const Demo: React.FC = () => {
  const allClosed: OpeningHours = null; // renders all pills grey with ×

  const hours: OpeningHours = {
    mo: { from: 1000, to: 1700 },
    tu: { from: 1000, to: 1700 },
    we: { from: 1000, to: 1700 },
    th: { from: 1000, to: 1700 },
    fr: { from: 1000, to: 1700 },
    sa: { from: 0, to: 0 }, // closed day via 0/0
    su: { from: 1000, to: 1700 },
  };

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-lg font-semibold">All closed</h3>
      <OpeningHoursPills openingHours={allClosed} />

      <h3 className="text-lg font-semibold">Open 10–17 (Sat closed)</h3>
      <OpeningHoursPills openingHours={hours} />
    </div>
  );
};
