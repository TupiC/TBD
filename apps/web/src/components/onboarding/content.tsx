import Image from "next/image";
import Heading from "../typography/heading";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ContentPage = ({
  back,
  next,
}: {
  back: () => void;
  next: () => void;
}): React.JSX.Element => {
  return (
    <div className={`h-full w-full flex flex-col`}>
      <div className="p-3 px-5">
        <Button variant={"link"} size={"icon"} onClick={() => back()}>
          <ArrowLeft strokeWidth={2} className="size-6" />
        </Button>
      </div>
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <div className={`flex flex-col gap-1`}>
            <Heading>We hope to see you soon!</Heading>
            <Heading type="h3">Tell us when you will be in Salzburg</Heading>
          </div>
          <div></div>
        </div>
        <div className={`flex justify-end`}>
          <Button variant={"round"} size={"round-sm"} onClick={() => next()}>
            <ArrowRight strokeWidth={2} className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
