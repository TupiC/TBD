import { Experience } from "@/types/experience.type";
import { MapPoint, TimelineExp } from "@/types/map-point.type";

export const toMapPoint = (exp: Experience, idx: number): MapPoint => {
    console.log("Mapping experience to map point:", exp.geo);
    return {
        id: exp.key ?? idx,
        lat: exp.geo.lat,
        lng: exp.geo.lon,
        title: exp.name,
        thumbnailUrl: exp.hero_image,
        description: exp.summary,
        category: exp.category,
        url: exp.url,
    };
};

// export const toTimelineExp = (exp: Experience, idx: number): TimelineExp => ({
//     ...exp,
//     ...toMapPoint(exp, idx),
//     startDate: `2025-11-${String(idx + 1).padStart(2, "0")}`,
//     endDate: `2025-11-${String(idx + 2).padStart(2, "0")}`,
// });

export const toMapPoints = (exps: Experience[]) => exps.map(toMapPoint);
// export const toTimelineExps = (exps: Experience[]) => exps.map(toTimelineExp);
