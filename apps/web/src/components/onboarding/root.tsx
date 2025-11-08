import { PADDING } from "@/app/onboarding/constants";
import Image from "next/image";

const RootPage = (): React.JSX.Element => {
  return (
    <div className={`h-full w-full ${PADDING}`}>
      <div className="relative h-[40%] ">
        <Image
          src="/images/hero.png"
          alt="View of salzburg with castle and churches"
          fill
          objectFit="contain"
        />
      </div>
    </div>
  );
};

export default RootPage;
