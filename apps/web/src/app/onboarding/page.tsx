"use client";
import { AnimationIcon } from "@/components/icons/AnimationIcon";
import ContentPage from "@/components/onboarding/content";
import RootPage from "@/components/onboarding/root";
import Body from "@/components/typography/body";
import Heading from "@/components/typography/heading";
import { useVisitStore } from "@/stores/visit-store";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const Page = (): React.JSX.Element => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const visits = useVisitStore((state) => state.visits);

    const next = () => {
        setCurrentStepIndex(currentStepIndex + 1);
    };
    const back = () => {
        setCurrentStepIndex(currentStepIndex - 1);
    };

    const steps: JSX.Element[] = [
        <RootPage key="root" next={() => next()} />,
        <ContentPage key="content1" back={() => back()} next={() => next()} />,
    ];
    const currentStep = steps[currentStepIndex];

    useEffect(() => {
        if (visits.length > 0 && !loading) {
            redirect("/mytrip");
        }
    }, [visits, loading]);

    if (currentStepIndex === 0) {
        return (
            <div>
                {loading && (
                    <div className="flex justify-center items-center w-screen h-dvh">
                        <AnimationIcon
                            duration={0.35}
                            className="w-10 h-10"
                            onComplete={() => {
                                setLoading(false);
                            }}
                        />
                    </div>
                )}
                <main className={`${loading ? "invisible" : ""}`}>
                    <div className="w-screen h-dvh">{currentStep}</div>
                    <div className="flex flex-col gap-4 p-6 py-12">
                        <Heading type="h2">
                            Neuer Konfigurator für Salzburg Card Erlebnisse
                        </Heading>
                        <Body>
                            Verpasse keine Erlebnisse und entdecke die besten
                            Angebote! Mit dem neuen Konfigurator kannst du deine
                            Reise ganz nach deinen Wünschen gestalten.
                        </Body>
                        <Body>
                            Sammle Inspiration, sichere dir exklusive Angebote
                            und plane dein Abenteuer in Ruhe. Jeder Klick bringt
                            dich deinem unvergesslichen Erlebnis näher.
                        </Body>
                    </div>
                </main>
            </div>
        );
    }

    return <main className="w-screen h-dvh">{currentStep && currentStep}</main>;
};

export default Page;
