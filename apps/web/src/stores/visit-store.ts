import { Visit } from "@/types/visit.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type VisitState = {
    visits: Visit[];
    setVisits: (items: Visit[]) => void;
    addVisit: (item: Visit) => void;
    updateVisit: (id: string, patch: Partial<Visit>) => void;
    removeVisit: (id: string) => void;
    getVisitById: (id: string) => Visit | undefined;
    clear: () => void;
};

export const useVisitStore = create<VisitState>()(
    persist(
        (set, get) => ({
            visits: [],

            setVisits: (items: Visit[]) => set({ visits: items }),

            addVisit: (item: Visit) =>
                set((state) => ({ visits: [...state.visits, item] })),

            updateVisit: (id: string, patch: Partial<Visit>) =>
                set((state) => ({
                    visits: state.visits.map((v) =>
                        v.experience.id === id ? { ...v, ...patch } : v
                    ),
                })),

            removeVisit: (id: string) =>
                set((state) => ({
                    visits: state.visits.filter((v) => v.experience.id !== id),
                })),

            getVisitById: (id: string) =>
                get().visits.find((v) => v.experience.id === id),

            clear: () => set({ visits: [] }),
        }),
        {
            name: "visit-storage",
        }
    )
);

export const setVisits = (items: Visit[]) => {
    useVisitStore.getState().setVisits(items);
};
