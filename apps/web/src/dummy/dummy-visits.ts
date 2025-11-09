import { EXPS } from "@/dummy/dummy-experiences";
import type { Visit } from "@/types/visit.type";

const exp = (key: string) => {
  const e = EXPS.find(x => x.key === key);
  if (!e) throw new Error(`Experience not found: ${key}`);
  return e;
};

export const DEMO_VISITS: Visit[] = [
  {
    experience: exp("antheringer-au-az-281397"),
    start: new Date("2025-11-09T12:00:00").getTime(),
    end:   new Date("2025-11-09T13:30:00").getTime(),
  },
  {
    experience: exp("auto-musik-museum-manro-classic-az-16179"),
    start: new Date("2025-11-09T16:00:00").getTime(),
    end:   new Date("2025-11-09T18:00:00").getTime(),
  },
  {
    experience: exp("gollinger-wasserfall-az-1666569"),
    start: new Date("2025-11-10T09:00:00").getTime(),
    end:   new Date("2025-11-10T11:00:00").getTime(),
  },
];
