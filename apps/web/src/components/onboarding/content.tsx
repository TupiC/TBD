import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ContentPage = ({
  back,
  next,
  children,
}: {
  children?: JSX.Element[] | JSX.Element;
  back: () => void;
  next: () => void;
}): JSX.Element => {
  return (
    <div className={`h-full w-full flex flex-col`}>
      <div className="p-3 px-5">
        <Button variant={"link"} size={"icon"} onClick={() => back()}>
          <ArrowLeft strokeWidth={2} className="size-6" />
        </Button>
      </div>
      <div className="p-6 flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-6">{children}</div>
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
