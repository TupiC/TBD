import Image from "next/image";
import Heading from "../typography/heading";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

const RootPage = ({ next }: { next: () => void }): React.JSX.Element => {
  return (
    <div className={`h-full w-full flex flex-col relative`}>
      <div className="relative -translate-x-[10%] w-[120%] flex justify-center z-10">
        <Image
          className="-translate-y-5 object-contain"
          src="/images/hero.png"
          alt="View of salzburg with castle and churches"
          width={400}
          height={300}
          priority
          quality={100}
        />
      </div>
      <div className="flex flex-col justify-between flex-1 z-10">
        <div className={`p-6 flex flex-col items-center gap-1`}>
          <Heading>Ready for Salzburg?</Heading>
          <Heading type="h3">Personalize your trip now!</Heading>
        </div>
        <div className={`px-12 flex flex-col items-end flex-1`}>
          <Button variant={"round"} size={"round-lg"} onClick={() => next()}>
            <ArrowRight strokeWidth={3} className="size-7" />
          </Button>
        </div>
      </div>
      <Image
        className={`absolute bottom-6 left-6`}
        src={"/svgs/logo.svg"}
        width={100}
        height={40}
        alt="Salzburg travel logo"
        aria-hidden
      />
      <Image
        className="absolute bottom-0"
        src={"/svgs/blobs/blob-2.svg"}
        width={500}
        height={500}
        alt="Decorative color element"
        aria-hidden
      />
    </div>
  );
};

export default RootPage;
