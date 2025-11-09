// import React from "react";
// import Image from "next/image";
// import { MapPin, Globe, Accessibility, PawPrint, ExternalLink, Route as RouteIcon, Clock, Info } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   type Experience,
//   weekdayLabel,
//   weekdayOrder,
//   type Weekday,
//   type OpeningHours,
//   type OpenState,
//   categoryLabel,
// } from "@/types/experience.type";
// import { cn, minutesToHHMM, computeOpenState } from "@/lib/utils";

// // ————————————————————————————————————————————————————————————————
// // Helpers
// // ————————————————————————————————————————————————————————————————

// function formatHours(oh?: { from: number; to: number } | null) {
//   if (!oh || oh.from == null || oh.to == null) return "—";
//   return `${minutesToHHMM(oh.from)}–${minutesToHHMM(oh.to)}`;
// }

// function formatOpenState(state: OpenState): string {
//   switch (state.state) {
//     case "open":
//       return `Open • until ${minutesToHHMM(state.closesAt)}`;
//     case "closed":
//       return state.nextOpens
//         ? `Closed • opens ${weekdayLabel[state.nextOpens.day]} ${minutesToHHMM(
//             state.nextOpens.from
//           )}`
//         : "Closed";
//     default:
//       return "Hours unknown";
//   }
// }

// function mapsHref(lat: number, lon: number, label: string) {
//   const q = encodeURIComponent(`${lat},${lon} (${label})`);
//   return `https://www.google.com/maps/search/?api=1&query=${q}`;
// }

// // ————————————————————————————————————————————————————————————————
// // Component
// // ————————————————————————————————————————————————————————————————

// export type VisitCardProps = {
//   experience: Experience;
//   /** Highlight a weekday in the row. */
//   selectedDay?: Weekday;
//   onSelectDay?: (day: Weekday) => void;
//   onRemove?: () => void;
//   onOpenRoute?: () => void;
//   onOpenWebsite?: () => void;
//   className?: string;
// };

// export default function VisitCard({
//   experience,
//   selectedDay,
//   onSelectDay,
//   onRemove,
//   onOpenRoute,
//   onOpenWebsite,
//   className,
// }: VisitCardProps) {
//   const now = React.useMemo(() => new Date(), []);
//   const openState = computeOpenState(experience.opening_hours as OpeningHours, now);

//   return (
//     <Card className={cn("overflow-hidden border-0 shadow-sm", className)}>
//       {/* Header */}
//       <div className="p-5 pb-3">
//         <h2 className="text-3xl font-serif tracking-tight leading-none">{experience.name}</h2>
//         <div className="mt-3 flex flex-wrap items-center gap-2">
//           <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
//             {categoryLabel[experience.category]}
//           </Badge>

//           {/* Accessibility */}
//           <Badge
//             variant="outline"
//             className="rounded-full px-3 py-1 text-sm capitalize"
//             title="Accessibility"
//           >
//             <Accessibility className="mr-1 h-4 w-4" />
//             {experience.accessibility_state}
//           </Badge>

//           {experience.dogs_allowed && (
//             <Badge variant="outline" className="rounded-full px-3 py-1 text-sm" title="Dogs allowed">
//               <PawPrint className="mr-1 h-4 w-4" /> Dogs ok
//             </Badge>
//           )}

//           {experience.free_access && (
//             <Badge variant="outline" className="rounded-full px-3 py-1 text-sm" title="Free access">
//               Free
//             </Badge>
//           )}

//           <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
//             <Clock className="h-4 w-4" /> {formatOpenState(openState)}
//           </div>
//         </div>
//       </div>

//       {/* Hero */}
//       <div className="relative h-52 w-full bg-muted">
//         {/* Use next/image if available; fallback to img */}
//         {typeof Image === "function" ? (
//           <Image
//             src={experience.hero_image}
//             alt={experience.name}
//             fill
//             className="object-cover"
//             sizes="100vw"
//           />
//         ) : (
//           // @ts-expect-error – non-next environment fallback
//           <img src={experience.hero_image} alt={experience.name} className="h-full w-full object-cover" />
//         )}
//         <a
//           className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs shadow"
//           href={mapsHref(experience.geo.lat, experience.geo.lon, experience.name)}
//           target="_blank"
//           rel="noreferrer"
//         >
//           MAP
//         </a>
//       </div>

//       {/* Week row */}
//       <CardContent className="pt-4">
//         <div className="mb-2 flex gap-2 overflow-x-auto pb-2">
//           {weekdayOrder.map((wd) => {
//             const isActive = selectedDay ? selectedDay === wd : false;
//             const oh = (experience.opening_hours as OpeningHours)?.[wd];
//             return (
//               <button
//                 key={wd}
//                 onClick={() => onSelectDay?.(wd)}
//                 className={cn(
//                   "flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-2 text-center text-sm",
//                   isActive ? "bg-primary text-primary-foreground" : "bg-muted"
//                 )}
//                 aria-pressed={isActive}
//               >
//                 <div className="font-medium uppercase tracking-wide">
//                   {weekdayLabel[wd].slice(0, 2)}
//                 </div>
//                 <div className="text-xs opacity-80">{formatHours(oh)}</div>
//               </button>
//             );
//           })}
//         </div>

//         {/* Actions */}
//         <div className="mt-3 grid grid-cols-2 gap-3">
//           <Button
//             variant="outline"
//             className="justify-start gap-2"
//             onClick={
//               onOpenRoute ?? (() => window.open(mapsHref(experience.geo.lat, experience.geo.lon, experience.name), "_blank"))
//             }
//           >
//             <RouteIcon className="h-4 w-4" /> Route
//           </Button>
//           <Button
//             variant="outline"
//             className="justify-start gap-2"
//             onClick={
//               onOpenWebsite ?? (() => window.open(experience.url || experience.origin_url, "_blank"))
//             }
//           >
//             <Globe className="h-4 w-4" /> Website
//           </Button>
//         </div>

//         {/* Summary */}
//         {experience.summary && (
//           <div className="prose prose-sm mt-5 max-w-none text-muted-foreground">
//             <p>{experience.summary}</p>
//           </div>
//         )}

//         {/* Footer */}
//         <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
//           <div className="flex items-center gap-2 text-sm text-muted-foreground">
//             <MapPin className="h-4 w-4" />
//             <span>
//               {experience.address.street}, {experience.address.postal_code} {experience.address.locality}
//             </span>
//           </div>

//           {onRemove && (
//             <Button variant="secondary" className="rounded-full" onClick={onRemove}>
//               Remove from trip
//             </Button>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
