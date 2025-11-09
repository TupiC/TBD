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
    Clock,
} from "lucide-react";

import type { Experience, Weekday } from "@/types/experience.type";
import { categoryLabel } from "@/types/experience.type";
import GalleryWithMap from "@/components/ui/gallery-with-map";
import OpeningHoursPills from "@/components/experience/opening-hours-piles";
import { formatDuration } from "@/lib/date-utils";
import { Visit } from "@/types/visit.type";
import { useExpStore } from "@/stores/exp-store";
import { useVisitStore } from "@/stores/visit-store";

type Step = {
    key: string;
    nextBtnSize?: "large" | "small";
    component: React.ReactNode;
};

const accessibilityDe: Record<
    NonNullable<Experience["accessibility_state"]>,
    string
> = {
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
        `${e.address?.street || ""} ${e.address?.postal_code || ""} ${e.address?.locality || ""}`
    )}&destination_place_id=&travelmode=walking`;

const cx = (...c: Array<string | false | null | undefined>) =>
    c.filter(Boolean).join(" ");

const imgFallback =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect width='100%' height='100%' fill='#e5e7eb'/></svg>`
    );

// function HoursPill({
//   label,
//   day,
//   active = false,
//   disabled = false,
// }: {
//   label: string;
//   day?: OpeningHoursDay | null;
//   active?: boolean;
//   disabled?: boolean;
// }) {
//   const base = "px-4 py-3 rounded-2xl text-center min-w-[72px]";
//   if (disabled) {
//     return (
//       <div className={cx(base, "bg-neutral-200 text-neutral-400 line-through")}>{label}</div>
//     );
//   }

//   return (
//     <div
//       className={cx(
//         base,
//         active ? "bg-rose-700 text-white" : "bg-neutral-200 text-neutral-900"
//       )}
//     >
//       <div className="font-semibold text-xs tracking-wide">{label}</div>
//       <div className="text-sm">{day ? `${minutesToHHMM(day.from)}-${minutesToHHMM(day.to)}` : "—"}</div>
//     </div>
//   );
// }

/* -------------------------------- Root Step -------------------------------- */

function RootStep({ visit }: { visit: Visit }) {
    const place: Experience = visit.experience;
    const router = useRouter();
    const today = useMemo(() => {
        const n = new Date().getDay(); // 0..6 Sun..Sat
        const order: Weekday[] = ["mo", "tu", "we", "th", "fr", "sa", "su"];
        // map Sunday(0) to index 6, otherwise n-1
        return order[(n + 6) % 7];
    }, []);

    console.log(place);
    // derive 3 images (grid like mock)
    const [hero, i2, i3] = [
        place.hero_image || imgFallback,
        place.images?.[0] || place.hero_image || imgFallback,
        place.images?.[1] || place.hero_image || imgFallback,
    ];

    const oh = place.opening_hours;
    const durationLabel = formatDuration(
        (visit?.end ?? 0) - (visit?.start ?? 0)
    );

    return (
        <div className="bg-[#EFEFEF] min-h-screen">
            {/* Header strip with back + title */}
            <div className="mx-auto px-4 pt-4 pb-2 max-w-[640px]">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
                    aria-label="Zurück"
                >
                    <ArrowLeft className="w-5 h-5" />{" "}
                    <span>Trip Übersicht</span>
                </button>

                <h1 className="mt-2 font-serif text-neutral-900 text-4xl">
                    {" "}
                    {place.name}{" "}
                </h1>

                {/* Badges row */}
                <div className="flex flex-wrap gap-3 mt-3">
                    <span className="inline-flex items-center gap-2 bg-[#8B2C2A] px-4 py-2 rounded-full text-white">
                        <Landmark className="w-4 h-4" />
                        {categoryDe[place.category] ??
                            categoryLabel[place.category] ??
                            place.category}
                    </span>

                    {place.accessibility_state && (
                        <span className="inline-flex items-center gap-2 bg-[#8B2C2A] px-4 py-2 rounded-full text-white">
                            <Accessibility className="w-4 h-4" />
                            {accessibilityDe[place.accessibility_state] ??
                                place.accessibility_state}
                        </span>
                    )}
                    {/* Duration */}
                    <span className="inline-flex items-center gap-2 bg-[#8B2C2A] px-4 py-2 rounded-full text-white">
                        <Clock className="w-4 h-4" aria-hidden />
                        {durationLabel}
                    </span>
                </div>
            </div>

            {/* Image collage with MAP chip */}
            <div className="mx-auto px-4 max-w-[640px]">
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
            {place.opening_hours !== null && (
                <div className="mx-auto mt-4 px-4 max-w-[640px]">
                    <OpeningHoursPills openingHours={place.opening_hours} />
                </div>
            )}
            {/* CTA buttons */}
            <div className="gap-4 grid grid-cols-2 mx-auto mt-4 px-4 max-w-[640px]">
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
                    <Navigation className="w-5 h-5" />
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
                        <Globe className="w-5 h-5" />
                        Website
                    </Link>
                )}
            </div>

            {/* Long description */}
            <div className="mx-auto mt-6 px-4 max-w-[640px]">
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                    {place.summary}
                </p>
            </div>

            {/* Remove from trip */}
            <div className="mx-auto mt-6 px-4 pb-10 max-w-[640px]">
                <button
                    type="button"
                    onClick={() => alert("Vom Trip entfernt")}
                    className="bg-neutral-200 hover:bg-neutral-300 px-4 py-4 rounded-2xl w-full font-semibold text-neutral-900 text-lg text-center"
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
    const experiences = useExpStore((state) => state.experiences);
    const visits = useVisitStore((state) => state.visits);

    console.log("Exp in detail page:", experiences);

    const visit = visits.find((e) => e.experience.key === params.key) as
        | Visit
        | undefined;

    const steps: Step[] = [
        {
            key: "root",
            nextBtnSize: "large",
            component: visit ? (
                <RootStep visit={visit} />
            ) : (
                <main className="place-items-center grid w-screen h-screen">
                    <div className="text-center">
                        <p className="text-lg">Eintrag nicht gefunden.</p>
                        <Link
                            href="/mytrip"
                            className="inline-block mt-3 underline"
                        >
                            Zurück zur Übersicht
                        </Link>
                    </div>
                </main>
            ),
        },
    ];
    const currentStep = steps[currentStepIndex];

    return (
        <main className="w-screen h-screen">
            {currentStep && currentStep.component}
        </main>
    );
};

export default Page;
