"use client";
import CustomSelect from "@/components/custom/select";
import { AnimationIcon } from "@/components/icons/AnimationIcon";
import ContentPage from "@/components/onboarding/content";
import RootPage from "@/components/onboarding/root";
import Body from "@/components/typography/body";
import Heading from "@/components/typography/heading";
import DatePicker from "@/components/ui/date-picker";
import { SelectItem } from "@/components/ui/select";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const Page = (): React.JSX.Element => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [days, setDays] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);

  const next = () => {
    setCurrentStepIndex(currentStepIndex + 1);
  };
  const back = () => {
    setCurrentStepIndex(currentStepIndex - 1);
  };

  useEffect(() => {
    let timeout = null;

    if (submitted) {
      timeout = setTimeout(() => {
        redirect("/mytrip");
      }, 2000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [submitted]);

  const steps: JSX.Element[] = [
    <RootPage key="root" next={next} />,
    <ContentPage key="content1" back={back} next={next}>
      <div className={`flex flex-col gap-1`}>
        <Heading>Wir freuen uns auf dich!</Heading>
        <Heading type="h3">Erzähle uns, wann du in Salzburg sein wirst</Heading>
      </div>
      <div className="flex flex-col gap-4">
        <DatePicker label="Ankuftsdatum" state={date} setState={setDate} />
        <CustomSelect
          label="Anzahl Tage"
          placeholder="Datum"
          items={
            <>
              <SelectItem value="1">1 Tag</SelectItem>
              <SelectItem value="2">2 Tage</SelectItem>
              <SelectItem value="3">3 Tage</SelectItem>
              <SelectItem value="4">4 Tage</SelectItem>
              <SelectItem value="5">&gt; 5 Tage</SelectItem>
            </>
          }
          state={days ?? ""}
          setState={setDays}
        />
      </div>
    </ContentPage>,
    <ContentPage key="content2" back={back} next={() => setSubmitted(true)}>
      <div className={`flex flex-col gap-1`}>
        <Heading>Wie wird dein Urlaub aussehen?</Heading>
        <Heading type="h3">
          Jede Person ist unterschiedlich, was hast du vor in Salzburg?
        </Heading>
      </div>
      <div className="flex flex-col gap-4">
        <CustomSelect
          label="Urlaubsart"
          placeholder="Art"
          items={
            <>
              <SelectItem value="culture">Kulturell</SelectItem>
              <SelectItem value="food">Gastronomisch</SelectItem>
              <SelectItem value="sport">Sportlich</SelectItem>
              <SelectItem value="couple">Paarurlaub</SelectItem>
              <SelectItem value="family">Familie & Kids</SelectItem>
            </>
          }
          state={type ?? ""}
          setState={setType}
        />
      </div>
    </ContentPage>,
  ];
  const currentStep = steps[currentStepIndex];

  if (submitted) {
    return (
      <div>
        <main className={`${loading ? "invisible" : ""}`}>
          <div className="h-dvh w-screen flex flex-col gap-5 text-center justify-center items-center">
            <AnimationIcon
              duration={0.35}
              loop
              className="w-10 h-10"
              onComplete={() => {
                setLoading(false);
              }}
            />
            <Heading type="h1" style="h2">
              Deine Reise wird für dich personalisiert…
            </Heading>
          </div>
        </main>
      </div>
    );
  }

  if (currentStepIndex === 0) {
    return (
      <div className={`${loading ? "h-dvh w-screen overflow-hidden" : ""}`}>
        {loading && (
          <div className="h-full w-full flex justify-center items-center">
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
          <div className="h-dvh w-screen">{currentStep}</div>
          <div className="p-6 py-12 flex flex-col gap-4">
            <Heading type="h2">
              Neuer Konfigurator für Salzburg Card Erlebnisse
            </Heading>
            <Body>
              Verpasse keine Erlebnisse und entdecke die besten Angebote! Mit
              dem neuen Konfigurator kannst du deine Reise ganz nach deinen
              Wünschen gestalten.
            </Body>
            <Body>
              Sammle Inspiration, sichere dir exklusive Angebote und plane dein
              Abenteuer in Ruhe. Jeder Klick bringt dich deinem unvergesslichen
              Erlebnis näher.
            </Body>
          </div>
        </main>
      </div>
    );
  }

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
              Verpasse keine Erlebnisse und entdecke die besten Angebote! Mit
              dem neuen Konfigurator kannst du deine Reise ganz nach deinen
              Wünschen gestalten.
            </Body>
            <Body>
              Sammle Inspiration, sichere dir exklusive Angebote und plane dein
              Abenteuer in Ruhe. Jeder Klick bringt dich deinem unvergesslichen
              Erlebnis näher.
            </Body>
          </div>
        </main>
      </div>
    );
  }

  return <main className="w-screen h-dvh">{currentStep && currentStep}</main>;
};

export default Page;
