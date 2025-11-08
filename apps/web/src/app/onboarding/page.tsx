"use client";
import RootPage from "@/components/onboarding/root";
import { useState } from "react";

type Step = {
  key: string;
  nextBtnSize: "small" | "large";
  component: React.JSX.Element;
};

const Page = (): React.JSX.Element => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const steps: Step[] = [
    {
      key: "root",
      nextBtnSize: "large",
      component: <RootPage />,
    },
  ];
  const currentStep = steps[currentStepIndex];

  return (
    <main className="h-screen w-screen">
      {currentStep && currentStep.component}
    </main>
  );
};

export default Page;
