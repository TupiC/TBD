import Image from "next/image";
import Heading from "../typography/heading";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

const ContentPage = ({ next }: { next: () => void }): React.JSX.Element => {
  return (
    <div className={`h-full w-full flex flex-col`}>
      <div className="relative -translate-x-[10%] w-[120%] flex justify-center">
        <Image
          className="-translate-y-5"
          src="/images/hero.png"
          alt="View of salzburg with castle and churches"
          width={400}
          height={300}
          objectFit="contain"
        />
      </div>
      <div className="flex flex-col justify-between flex-1">
        <div className={`p-6 flex flex-col items-center gap-1`}>
          <Heading>Conteeeent?</Heading>
          <Heading type="h3">Personalize your trip now!</Heading>
        </div>
        <div className={`px-12 flex flex-col items-end flex-1`}>
          <Button variant={"round"} size={"round-lg"} onClick={() => next()}>
            <ArrowRight strokeWidth={3} className="size-7" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
