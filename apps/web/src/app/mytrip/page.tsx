// app/mytrip/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripTimeline } from "@/components/mytrip/trip-timeline";
import { toMapPoints } from "@/lib/mapper";
import Heading from "@/components/typography/heading";
import { Experience } from "@/types/experience.type";
import { Visit } from "@/types/visit.type";
import { setExperiences, useExpStore } from "@/stores/exp-store";
import { setVisits, useVisitStore } from "@/stores/visit-store";
import { XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding-store";

// ⬇️ Import the map without SSR to avoid "window is not defined"
const MyMap = dynamic(() => import("../../components/ui/Map"), { ssr: false });

const Page = (): React.JSX.Element => {
    const [tab, setTab] = useState<"timeline" | "map">("timeline");
    // const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const experiences = useExpStore((state) => state.experiences);
    const clear = useVisitStore((state) => state.clear);
    const { days, date, type } = useOnboardingStore();

    const visits = useVisitStore((state) => state.visits);

    const onReset = () => {
        clear();
        redirect("/");
    };
    // Convert experiences to visits whenever experiences change
    const experiencesToVisits = (exps: Experience[]): Visit[] => {
        return exps.map((exp, index) => {
            const start = new Date();
            start.setDate(start.getDate() + index);
            start.setHours(10, 0, 0, 0);
            const end = new Date(start);
            end.setHours(12, 0, 0, 0);
            return {
                experience: exp,
                start: start.getTime(),
                end: end.getTime(),
            };
        });
    };

    // Convert experiences to map points
    const experiencesToMapPoints = (exps: Experience[]) => {
        return toMapPoints(exps);
    };

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                setIsLoading(true);
                setError(null);
                console.log(days, date, type);

                const response = await fetch(
                    `http://localhost:1337/api/experience/filter?startDate=$Z&endDate=2025-03-09T20:31:27.243Z&categories=outdoor`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.status}`);
                }

                const data = await response.json();
                console.log("Fetched experiences:", data);

                // Assuming the API returns data in a `data` property
                const experiencesData = data.data || data;
                // setExperiences(experiencesData);
                setExperiences(experiencesData);

                // Convert the fetched experiences to visits
                const generatedVisits = experiencesToVisits(experiencesData);
                setVisits(generatedVisits);
            } catch (err) {
                console.error("Failed to fetch experiences:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch experiences"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchExperiences();
    }, []);

    const mapPoints =
        experiences.length > 0 ? experiencesToMapPoints(experiences) : [];

    if (isLoading) {
        return (
            <main className="flex flex-col p-4 min-h-screen">
                <Heading>Your Trip</Heading>

                <div className="flex flex-1 justify-center items-center">
                    <p>Loading your trip...</p>
                </div>
            </main>
        );
    }

    if (error && experiences.length === 0) {
        return (
            <main className="flex flex-col p-4 min-h-screen">
                <Heading>Your Trip</Heading>

                <div className="flex flex-1 justify-center items-center">
                    <p className="text-red-500">Error: {error}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-col p-4 min-h-screen">
            <div className="flex justify-between items-center">
                <Heading>Your Trip</Heading>
                <button onClick={() => onReset()}>
                    <XCircle strokeWidth={2} className="size-5" />
                </button>
            </div>

            <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as "timeline" | "map")}
                className="flex flex-col flex-1 w-full overflow-hidden"
            >
                <TabsList className="flex gap-2 mb-4 rounded-md w-full">
                    <TabsTrigger value="timeline" className="flex-1">
                        Timeline
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex-1">
                        Map
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="flex flex-1 min-h-0">
                    <TripTimeline visits={visits} />
                </TabsContent>

                <TabsContent value="map" className="flex flex-1 min-h-0">
                    {/* Mount only when visible; give it height and rounded corners */}
                    {tab === "map" && (
                        <div
                            className="flex-1 min-h-80"
                            style={{ borderRadius: 8, overflow: "hidden" }}
                        >
                            <MyMap points={mapPoints} zoom={13} />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </main>
    );
};

export default Page;
