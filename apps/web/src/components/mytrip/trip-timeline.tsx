"use client";

import * as React from "react";
import type { Visit } from "@/types/visit.type";
import VisitCard from "./visit-card";
import { toYmdKey, formatDayLabel, formatTime, type YmdKey } from "@/lib/date-utils";

type TripTimelineProps = { visits: Visit[] };

export const TripTimeline = ({ visits }: TripTimelineProps): React.JSX.Element => {
  const groups = React.useMemo(() => {
    const byDay = new Map<YmdKey, Visit[]>();
    visits
      .slice()
      .sort((a, b) => a.start - b.start)
      .forEach((v) => {
        const k = toYmdKey(v.start) as YmdKey;
        const list = byDay.get(k) ?? [];
        list.push(v);
        byDay.set(k, list);
      });

    return Array.from(byDay.entries()).map(([k, items]) => ({
      k,
      label: formatDayLabel(k),
      items,
    }));
  }, [visits]);

  // one source of truth
  const LEFT_COL = "clamp(72px, 1vw, 96px)";

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="relative flex-1 overflow-y-auto  px-1 sm:px-3">
        {/* Expose --left-col so every child uses the exact same value */}
        <div
          className="relative mx-auto w-full max-w-[920px] space-y-10"
          style={{ ["--left-col" as any]: LEFT_COL }}
        >
          {/* GLOBAL vertical rail */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-[2px] bg-white/70"
            style={{ left: "calc(var(--left-col) / 2 - 1px)" }}
          />

          {groups.map(({ k, label, items }) => (
            <section key={k} className="relative">
              {/* Day chip aligned with card column */}
              <div className="flex items-center gap-1 pr-3" style={{ marginLeft: "var(--left-col)" }}>
                <span className="h-px flex-1 bg-white/60" />
                <span className="rounded-xl bg-white/95 px-4 py-1 text-sm font-semibold text-neutral-900 shadow-sm">
                  {label}
                </span>
                <span className="h-px flex-1 bg-white/60" />
              </div>

              <div className="mt-4 space-y-8">
                {items.map((v, i) => (
                  <div
                    key={`${k}-${i}`}
                    className="grid items-stretch gap-1 sm:gap-6"
                    style={{ gridTemplateColumns: "var(--left-col) 1fr" }}
                  >

<div className="relative">
  {/* one place to tweak sizes if you ever change button/bubble heights */}
  <div
    className="absolute inset-0"
    style={{
      ["--stack-offset" as any]: "58px",
    }}
  >
                    {/* time bubble — exactly centered on the row/card */}
                    <div
                      className="absolute grid h-14 w-14 place-items-center rounded-full bg-white text-neutral-900 font-semibold shadow text-sm leading-none"
                      style={{
                        left: "calc(var(--left-col) / 2)",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {formatTime(v.start)}
                    </div>

                    {/* minus above the bubble by the offset */}
                    <button
                      type="button"
                      aria-label="Earlier"
                      className="absolute grid size-9 aspect-square place-items-center rounded-full bg-white text-neutral-800 shadow text-base leading-none appearance-none p-0"
                      style={{
                        left: "calc(var(--left-col) / 2)",
                        top: "50%",
                        transform: "translate(-50%, calc(-50% - var(--stack-offset)))",
                      }}
                    >
                      −
                    </button>

                    {/* plus below the bubble by the offset */}
                    <button
                      type="button"
                      aria-label="Later"
                      className="absolute grid size-9 aspect-square place-items-center rounded-full bg-white text-neutral-800 shadow text-base leading-none appearance-none p-0"
                      style={{
                        left: "calc(var(--left-col) / 2)",
                        top: "50%",
                        transform: "translate(-50%, calc(-50% + var(--stack-offset)))",
                      }}
                    >
                      +
                    </button>

                  </div>
                </div>


                    {/* RIGHT COLUMN: card keeps the constant gap */}
                    <div>
                      <VisitCard visit={v} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripTimeline;
