"use client";
import ContentPage from "@/components/onboarding/content";
import RootPage from "@/components/onboarding/root";
import { useState } from "react";

const Page = (): React.JSX.Element => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const next = () => {
    setCurrentStepIndex(currentStepIndex + 1);
  };

  const steps: JSX.Element[] = [
    <RootPage key="root" next={() => next()} />,
    <ContentPage key="content1" next={() => next()} />,
  ];
  const currentStep = steps[currentStepIndex];

  return <main className="h-dvh w-screen">{currentStep && currentStep}</main>;
};

export default Page;
