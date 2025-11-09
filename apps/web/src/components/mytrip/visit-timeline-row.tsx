"use client";
import * as React from "react";
import type { Visit } from "@/types/visit.type";
import { formatTime } from "@/lib/date-utils";
import VisitCard from "./visit-card";

/**
 * One timeline row:
 * - draws its own vertical rail segment (aligned with the global rail position)
 * - centers a single time bubble on that rail
 * - places the card to the right with a safe gutter
 */
type VisitTimelineRowProps = {
  visit: Visit;
  // If you want to hide the rail for the very first/last row, you can control it:
  showRail?: boolean; // default true
};

const RAIL_X = "left-8";          // 32px from container left
const GUTTER_ML = "ml-[120px]";    // 32 (rail) + 28 (bubble radius) + 32 spacing

export default function VisitTimelineRow({
  visit,
  showRail = true,
}: VisitTimelineRowProps): React.JSX.Element {
  return (
    <div className="relative">
      {showRail && (
        <div className={`pointer-events-none absolute ${RAIL_X} top-0 bottom-0 w-[2px] bg-white/70 z-0`} />

      )}

      {/* Time bubble centered on the rail */}
      <div
        className={`absolute ${RAIL_X} top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 grid h-14 w-14 place-items-center rounded-full bg-white text-neutral-900 font-semibold shadow text-sm leading-none`}
        aria-hidden
      >
        {formatTime(visit.start)}
      </div>
       <div className="w-[48px]"/>


      {/* Visit card shifted so it never touches the rail/bubble */}
      <div className={GUTTER_ML}>
        <VisitCard visit={visit} />
      </div>
    </div>
  );
}
