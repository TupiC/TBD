"use client";
import * as React from "react";
import type { Visit } from "@/types/visit.type";
import VisitCardTimeline from "@/components/mytrip/visit-timeline-row";

type VisitRowProps = { visit: Visit };

const fmtTime = (ts: number) =>
  new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit" })
    .format(new Date(ts));

export default function VisitRow({ visit }: VisitRowProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-4 items-start">
      <div className="relative">
        <div className="absolute left-[35px] -top-3 bottom-0 w-[2px] bg-white/70" />
        <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-white text-neutral-900 font-semibold shadow">
          {fmtTime(visit.start)}
        </div>
      </div>
      <VisitCardTimeline visit={visit} />
    </div>
  );
}
