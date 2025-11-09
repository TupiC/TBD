"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, X } from "lucide-react";

import { Month, OpenState, categoryLabel, weekdayLabel } from "@/types/experience.type";
import { computeOpenState, imgFallback, minutesToHHMM } from "@/lib/utils";
import { Visit } from "@/types/visit.type";

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");


const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900";

const seasonText = (start: Month, end: Month) =>
  start === end ? `Season: ${start}` : `Season: ${start}–${end}`;

export interface VisitCardProps {
  visit: Visit;
  onOpen?: (visit: Visit) => void;
  onDismiss?: (key: string) => void;
  /** Wrapper element for semantics */
  as?: "div" | "article" | "section";
  className?: string;
  now?: Date;
  "aria-label"?: string;
  /** Optional density */
  size?: "default" | "compact";
}

export default function VisitCard({
  visit,
  onOpen,
  onDismiss,
  as = "div",
  className,
  now,
  size = "default",
  "aria-label": ariaLabel,
}: VisitCardProps) {
  const Wrapper: any = as;
  const place = visit.experience

  const current = now ?? new Date();
  const openState: OpenState = place.opening_hours
  ? computeOpenState(place.opening_hours, current)
  : { state: "unknown" as const };



  const label = ariaLabel ?? `${place.name} — ${categoryLabel[place.category]}`;

  const titleCls =
    size === "compact"
      ? "text-lg md:text-xl font-semibold leading-tight tracking-[-0.01em]"
      : "text-xl md:text-2xl font-semibold leading-tight tracking-[-0.01em]";

  const summaryCls =
    size === "compact" ? "mt-1 line-clamp-2 text-sm/6" : "mt-2 line-clamp-3 text-base/6";

  return (
    <Wrapper
      aria-label={label}
      className={cx(
        "relative w-full overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-black/5 dark:ring-white/10",
        "bg-neutral-950",
        "transition-shadow duration-200 hover:shadow-md",
        className
      )}
    >
      {/* HERO */}
      <div className="absolute inset-0">
        <Image
          src={place.hero_image || imgFallback}
          alt={place.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={false}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/30" />
      </div>

      {/* CONTENT */}
      <div className="relative p-4 md:p-6 text-white">
        <div className="rounded-xl backdrop-blur-[2px]">
          {/* Top row: title + dismiss */}
          <div className="flex items-start justify-between gap-3">
            <h3 className={titleCls}>{place.name}</h3>

            {onDismiss && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(place.key);
                }}
                className={cx(
                  "group grid size-9 place-items-center rounded-full bg-black/30 hover:bg-black/40",
                  "text-white/90",
                  focusRing
                )}
                aria-label="Dismiss card"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5 opacity-90 group-hover:opacity-100" aria-hidden />
              </button>
            )}
          </div>

          {/* Summary */}
          <p className={cx(summaryCls, "text-white/90")}>{place.summary}</p>

          {/* Meta row */}
          <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-2 md:gap-3">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
              {categoryLabel[place.category] ?? "Experience"}
            </span>

            <span
                className={cx(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                  openState.state === "open"
                    ? "bg-green-500/20 text-green-200"
                    : openState.state === "unknown"
                    ? "bg-zinc-500/25 text-zinc-200"
                    : "bg-red-500/25 text-red-200"
                )}
                aria-live="polite"
              >
                {openState.state === "open"
                  ? `Open · until ${minutesToHHMM(openState.closesAt)}`
                  : openState.state === "closed" && openState.nextOpens
                  ? `Closed · ${weekdayLabel[openState.nextOpens.day]} ${minutesToHHMM(openState.nextOpens.from)}`
                  : "Hours unknown"}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
              {seasonText(place.start_month, place.end_month)}
            </span>

            {place.free_access && (
              <span className="inline-flex items-center rounded-full bg-emerald-400/20 text-emerald-100 px-3 py-1 text-sm">
                Free access
              </span>
            )}
          </div>

          {/* Footer actions */}
          <div className="mt-4 md:mt-6 flex items-center justify-between gap-3">
            <div className="text-sm text-white/85 inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 opacity-90" aria-hidden />
              {place.address.locality}
            </div>

            <div className="flex items-center gap-2">
              {place.url && (
                <Link
                  href={`/experience/${place.key}`}     
                  className={cx(
                    "inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm",
                    "hover:bg-white/20 active:bg-white/25",
                    focusRing
                  )}
                  aria-label={`Open details for ${place.name}`}
                >
                  Details <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}

              {onOpen && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(visit);
                  }}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white",
                    "hover:bg-rose-500 active:bg-rose-600/90",
                    focusRing
                  )}
                  aria-label={`View details for ${place.name}`}
                  data-testid="visitcard-cta"
                >
                  View details <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
