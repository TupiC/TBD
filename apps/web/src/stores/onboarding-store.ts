import { create } from "zustand";
import { persist } from "zustand/middleware";

type OnboardingState = {
    date: Date | undefined;
    days: string | undefined;
    type: string | undefined;
    setDate: (date: Date | undefined) => void;
    setDays: (days: string | undefined) => void;
    setType: (type: string | undefined) => void;
    setOnboardingData: (
        data: Partial<Pick<OnboardingState, "date" | "days" | "type">>
    ) => void;
    clear: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            date: undefined,
            days: undefined,
            type: undefined,

            setDate: (date: Date | undefined) => set({ date }),

            setDays: (days: string | undefined) => set({ days }),

            setType: (type: string | undefined) => set({ type }),

            setOnboardingData: (
                data: Partial<Pick<OnboardingState, "date" | "days" | "type">>
            ) => set((state) => ({ ...state, ...data })),

            clear: () =>
                set({
                    date: undefined,
                    days: undefined,
                    type: undefined,
                }),
        }),
        {
            name: "onboarding-storage",
        }
    )
);

// Convenience setters for direct usage
export const setOnboardingDate = (date: Date | undefined) => {
    useOnboardingStore.getState().setDate(date);
};

export const setOnboardingDays = (days: string | undefined) => {
    useOnboardingStore.getState().setDays(days);
};

export const setOnboardingType = (type: string | undefined) => {
    useOnboardingStore.getState().setType(type);
};

export const setOnboardingData = (
    data: Partial<Pick<OnboardingState, "date" | "days" | "type">>
) => {
    useOnboardingStore.getState().setOnboardingData(data);
};

export const clearOnboarding = () => {
    useOnboardingStore.getState().clear();
};
