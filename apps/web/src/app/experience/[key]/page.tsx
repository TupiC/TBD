"use client";
import * as React from "react";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
  Accessibility,
  Globe,
  Navigation,
} from "lucide-react";

import { EXPS } from "@/dummy/dummy-data";
import type { Experience, Weekday, OpeningHoursDay } from "@/types/experience.type";
import { categoryLabel } from "@/types/experience.type";
import { minutesToHHMM } from "@/lib/utils";
import GalleryWithMap from "@/components/ui/gallery-with-map";
import OpeningHoursPills from "@/components/experience/opening-hours-piles";

type Step = { key: string; nextBtnSize?: "large" | "small"; component: React.ReactNode };

const deWeekday: Record<Weekday, string> = {
  mo: "MO", tu: "DI", we: "MI", th: "DO", fr: "FR", sa: "SA", su: "SO",
};
const accessibilityDe: Record<NonNullable<Experience["accessibility_state"]>, string> = {
  full: "barrierefrei",
  partly: "teilweise",
  none: "nicht barrierefrei",
};
const categoryDe: Record<string, string> = {
  museum: "Museums",
  trail: "Wanderweg",
  church: "Kirche",
  excursion: "Ausflug",
  outdoor: "Outdoor",
  square: "Platz",
};

// --- helpers
const buildRouteUrl = (e: Experience) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${e.address.street || ""} ${e.address.postal_code || ""} ${e.address.locality || ""}`
  )}&destination_place_id=&travelmode=walking`;

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const cardRing = "ring-1 ring-black/5 dark:ring-white/10";

const imgFallback =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect width='100%' height='100%' fill='#e5e7eb'/></svg>`
  );

function HoursPill({
  label,
  day,
  active = false,
  disabled = false,
}: {
  label: string;
  day?: OpeningHoursDay | null;
  active?: boolean;
  disabled?: boolean;
}) {
  const base = "px-4 py-3 rounded-2xl text-center min-w-[72px]";
  if (disabled) {
    return (
      <div className={cx(base, "bg-neutral-200 text-neutral-400 line-through")}>{label}</div>
    );
  }
  return (
    <div
      className={cx(
        base,
        active ? "bg-rose-700 text-white" : "bg-neutral-200 text-neutral-900"
      )}
    >
      <div className="text-xs font-semibold tracking-wide">{label}</div>
      <div className="text-sm">{day ? `${minutesToHHMM(day.from)}-${minutesToHHMM(day.to)}` : "—"}</div>
    </div>
  );
}

/* -------------------------------- Root Step -------------------------------- */

function RootStep({ place }: { place: Experience }) {
  const router = useRouter();
  const today = useMemo(() => {
    const n = new Date().getDay(); // 0..6 Sun..Sat
    const order: Weekday[] = ["mo", "tu", "we", "th", "fr", "sa", "su"];
    // map Sunday(0) to index 6, otherwise n-1
    return order[(n + 6) % 7];
  }, []);

  // derive 3 images (grid like mock)
  const [hero, i2, i3] = [
    place.hero_image || imgFallback,
    place.images?.[0] || place.hero_image || imgFallback,
    place.images?.[1] || place.hero_image || imgFallback,
  ];

  const oh = place.opening_hours;

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* Header strip with back + title */}
      <div className="mx-auto max-w-[640px] px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
          aria-label="Zurück"
        >
          <ArrowLeft className="h-5 w-5" /> <span>Trip Übersicht</span>
        </button>

        <h1 className="mt-2 font-serif text-4xl text-neutral-900"> {place.name} </h1>

        {/* Badges row */}
        <div className="mt-3 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#8B2C2A] text-white px-4 py-2">
            <Landmark className="h-4 w-4" />
            {categoryDe[place.category] ?? categoryLabel[place.category] ?? place.category}
          </span>

          {place.accessibility_state && (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#8B2C2A] text-white px-4 py-2">
              <Accessibility className="h-4 w-4" />
              {accessibilityDe[place.accessibility_state] ?? place.accessibility_state}
            </span>
          )}
        </div>
      </div>

      {/* Image collage with MAP chip */}
      <div className="mx-auto max-w-[640px] px-4">
        <GalleryWithMap
          className="w-full"             
          experience={place}
          height={320}
          images={[place.hero_image, ...(place.images ?? [])]}
          onMapClick={() => console.log("open map / modal")}
          mapLabel="MAP"
        />
      </div>

      {/* Weekday pills */}
      <div className="mx-auto max-w-[640px] px-4 mt-4">
        <OpeningHoursPills openingHours={place.opening_hours} />
      </div>     
       {/* CTA buttons */}
      <div className="mx-auto max-w-[640px] px-4 mt-4 grid grid-cols-2 gap-4">
        <Link
          href={buildRouteUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(
            "flex items-center justify-center gap-2 rounded-2xl bg-neutral-200 px-4 py-4 text-lg font-semibold text-neutral-900",
            "hover:bg-neutral-300"
          )}
          aria-label="Route öffnen"
        >
          <Navigation className="h-5 w-5" />
          ROUTE
        </Link>

        {place.url && (
          <Link
            href={place.origin_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cx(
              "flex items-center justify-center gap-2 rounded-2xl bg-neutral-200 px-4 py-4 text-lg font-semibold text-neutral-900",
              "hover:bg-neutral-300"
            )}
            aria-label="Website öffnen"
          >
            <Globe className="h-5 w-5" />
            Website
          </Link>
        )}
      </div>

      {/* Long description */}
      <div className="mx-auto max-w-[640px] px-4 mt-6">
        <p className="leading-relaxed text-neutral-700 whitespace-pre-line">
          {place.summary}
        </p>
      </div>

      {/* Remove from trip */}
      <div className="mx-auto max-w-[640px] px-4 mt-6 pb-10">
        <button
          type="button"
          onClick={() => alert("Vom Trip entfernt")}
          className="w-full rounded-2xl bg-neutral-200 px-4 py-4 text-center text-lg font-semibold text-neutral-900 hover:bg-neutral-300"
        >
          Vom Trip entfernen
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Page wrapper ------------------------------- */

const Page = (): React.JSX.Element => {
  const params = useParams<{ key: string }>();
  const [currentStepIndex] = useState(0);

  const place = EXPS.find((e) => e.key === params.key) as Experience | undefined;

  const steps: Step[] = [
    {
      key: "root",
      nextBtnSize: "large",
      component: place ? (
        <RootStep place={place} />
      ) : (
        <main className="h-screen w-screen grid place-items-center">
          <div className="text-center">
            <p className="text-lg">Eintrag nicht gefunden.</p>
            <Link href="/mytrip" className="mt-3 inline-block underline">
              Zurück zur Übersicht
            </Link>
          </div>
        </main>
      ),
    },
  ];
  const currentStep = steps[currentStepIndex];

  return <main className="h-screen w-screen">{currentStep && currentStep.component}</main>;
};

export default Page;
