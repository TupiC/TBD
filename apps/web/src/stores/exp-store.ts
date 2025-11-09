import { Experience } from "@/types/experience.type";
import { create } from "zustand";

type ExpState = {
    experiences: Experience[];
    setExperiences: (items: Experience[]) => void;
    addExperience: (item: Experience) => void;
    updateExperience: (id: string, patch: Partial<Experience>) => void;
    removeExperience: (id: string) => void;
    getExperienceById: (id: string) => Experience | undefined;
    clear: () => void;
};

export const useExpStore = create<ExpState>((set, get) => ({
    experiences: [],

    setExperiences: (items: Experience[]) => set({ experiences: items }),

    addExperience: (item: Experience) =>
        set((state) => ({ experiences: [...state.experiences, item] })),

    updateExperience: (id: string, patch: Partial<Experience>) =>
        set((state) => ({
            experiences: state.experiences.map((e) =>
                e.id === id ? { ...e, ...patch } : e
            ),
        })),

    removeExperience: (id: string) =>
        set((state) => ({
            experiences: state.experiences.filter((e) => e.id !== id),
        })),

    getExperienceById: (id: string) =>
        get().experiences.find((e) => e.id === id),

    clear: () => set({ experiences: [] }),
}));

export const setExperiences = (items: Experience[]) => {
    useExpStore.getState().setExperiences(items);
};
