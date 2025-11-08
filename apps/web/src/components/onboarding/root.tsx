import { PADDING } from "@/app/onboarding/constants";
import Image from "next/image";
import Heading from "../typography/heading";

const RootPage = (): React.JSX.Element => {
  return (
    <div className={`h-full w-full`}>
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
      <div>
        <Heading>Ready for Salzburg?</Heading>
      </div>
    </div>
  );
};

export default RootPage;
