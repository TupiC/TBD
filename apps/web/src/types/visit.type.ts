import type { Experience } from "@/types/experience.type";

export type Visit = {
    experience: Experience;
    start: number; // ms since epoch
    end: number; // ms since epoch
};

export function expOnly(visits: Visit[]): Experience[] {
    return visits.map((v) => v.experience);
}

const roundToNext15 = (d = new Date()) => {
    const copy = new Date(d);
    const minutes = copy.getMinutes();
    const rounded = Math.ceil(minutes / 15) * 15;
    copy.setMinutes(rounded === 60 ? 0 : rounded, 0, 0);
    if (rounded === 60) copy.setHours(copy.getHours() + 1);
    return copy;
};

// export function makeDummyVisits(count = 3): Visit[] {
//     const base = roundToNext15(new Date()).getTime();
//     const DURATION = 75 * 60 * 1000; // 75 minutes
//     const GAP = 2 * 60 * 60 * 1000; // 2 hours

//     return EXPS.slice(0, count).map((experience, i) => {
//         const start = base + i * GAP;
//         const end = start + DURATION;
//         return { experience, start, end };
//     });
// }

// export const VISITS: Visit[] = makeDummyVisits(3);
