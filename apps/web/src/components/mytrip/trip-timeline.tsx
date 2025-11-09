"use client";

import * as React from "react";
import type { Visit } from "@/types/visit.type";
import VisitCard from "./visit-card";
import {
    toYmdKey,
    formatDayLabel,
    formatTime,
    type YmdKey,
} from "@/lib/date-utils";
import { canShiftWithinOpening } from "@/lib/opening-hours";

type TripTimelineProps = { visits: Visit[] };

export const TripTimeline = ({
    visits,
}: TripTimelineProps): React.JSX.Element => {
    const [data, setData] = React.useState<Visit[]>(visits);
    React.useEffect(() => setData(visits), [visits]);

    const groups = React.useMemo(() => {
        const byDay = new Map<YmdKey, Visit[]>();
        data.slice()
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
    }, [data]);

    const LEFT_COL = "clamp(72px, 20vw, 96px)";
    const STEP_MS = 30 * 60 * 1000; // 30 minutes

    const shiftVisit = (visit: Visit, deltaMs: number) => {
        setData((prev: Visit[]) => {
            const nextData = prev.slice() as Visit[];

            const order: number[] = Array.from(
                { length: nextData.length },
                (_, i) => i
            ).sort((a, b) => nextData[a]!.start - nextData[b]!.start);

            const targetIdx = nextData.indexOf(visit);
            if (targetIdx === -1) return prev;

            const guard = canShiftWithinOpening(nextData[targetIdx]!, deltaMs);
            if (!guard.ok) {
                alert(guard.msg);
                return prev;
            }

            const pos = order.indexOf(targetIdx);
            const applyShift = (idx: number) => {
                const v = nextData[idx]!;
                nextData[idx] = {
                    ...v,
                    start: v.start + deltaMs,
                    end: v.end + deltaMs,
                } as Visit;
            };

            applyShift(targetIdx);

            if (deltaMs > 0) {
                let currentEnd = nextData[targetIdx]!.end;
                for (let p = pos + 1; p < order.length; p++) {
                    const idx = order[p]!;
                    const nxt = nextData[idx]!;
                    const g2 = canShiftWithinOpening(nxt, deltaMs);
                    if (!g2.ok) {
                        alert(g2.msg);
                        break;
                    }
                    if (nxt.start <= currentEnd) {
                        applyShift(idx);
                        currentEnd = nextData[idx]!.end;
                    } else {
                        break;
                    }
                }
            }

            return nextData;
        });
    };

    const incrementTime = (visit: Visit) => shiftVisit(visit, +STEP_MS);
    const decrementTime = (visit: Visit) => shiftVisit(visit, -STEP_MS);

    return (
        <div className="flex flex-col flex-1 w-full">
            <div className="relative flex-1 px-1 sm:px-3 overflow-y-auto">
                {/* Expose --left-col so every child uses the exact same value */}
                <div
                    className="relative space-y-10 mx-auto w-full max-w-[920px]"
                    style={{ ["--left-col" as any]: LEFT_COL }}
                >
                    {/* GLOBAL vertical rail */}
                    <div
                        className="top-0 bottom-0 absolute bg-white/70 w-0.5 pointer-events-none"
                        style={{ left: "calc(var(--left-col) / 2 - 1px)" }}
                    />

                    {groups.map(({ k, label, items }) => (
                        <section key={k} className="relative">
                            {/* Day chip aligned with card column */}
                            <div
                                className="flex items-center gap-1 pr-3"
                                style={{ marginLeft: "var(--left-col)" }}
                            >
                                <span className="flex-1 bg-sc-primary h-px" />
                                <span className="bg-white/95 shadow-sm px-4 py-1 rounded-xl font-semibold text-neutral-900 text-sm">
                                    {label}
                                </span>
                                <span className="flex-1 bg-sc-primary h-px" />
                            </div>

                            <div className="space-y-8 mt-4">
                                {items.map((v, i) => (
                                    <div
                                        key={`${k}-${i}`}
                                        className="items-stretch gap-1 sm:gap-6 grid"
                                        style={{
                                            gridTemplateColumns:
                                                "var(--left-col) 1fr",
                                        }}
                                    >
                                        <div className="relative">
                                            {/* one place to tweak sizes if you ever change button/bubble heights */}
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    ["--stack-offset" as any]:
                                                        "58px",
                                                }}
                                            >
                                                {/* time bubble — exactly centered on the row/card */}
                                                <div
                                                    className="absolute place-items-center grid bg-white shadow rounded-full w-14 h-14 font-semibold text-neutral-900 text-sm leading-none"
                                                    style={{
                                                        left: "calc(var(--left-col) / 2)",
                                                        top: "50%",
                                                        transform:
                                                            "translate(-50%, -50%)",
                                                    }}
                                                >
                                                    {formatTime(v.start)}
                                                </div>

                                                {/* minus above the bubble by the offset */}
                                                <button
                                                    type="button"
                                                    aria-label="Earlier"
                                                    className="absolute place-items-center grid bg-white shadow p-0 rounded-full size-9 aspect-square text-neutral-800 text-base leading-none appearance-none"
                                                    style={{
                                                        left: "calc(var(--left-col) / 2)",
                                                        top: "50%",
                                                        transform:
                                                            "translate(-50%, calc(-50% - var(--stack-offset)))",
                                                    }}
                                                    onClick={() =>
                                                        decrementTime(v)
                                                    }
                                                >
                                                    −
                                                </button>

                                                {/* plus below the bubble by the offset */}
                                                <button
                                                    type="button"
                                                    aria-label="Later"
                                                    className="absolute place-items-center grid bg-white shadow p-0 rounded-full size-9 aspect-square text-neutral-800 text-base leading-none appearance-none"
                                                    style={{
                                                        left: "calc(var(--left-col) / 2)",
                                                        top: "50%",
                                                        transform:
                                                            "translate(-50%, calc(-50% + var(--stack-offset)))",
                                                    }}
                                                    onClick={() =>
                                                        incrementTime(v)
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN: card keeps the constant gap */}
                                        <VisitCard visit={v} />
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
