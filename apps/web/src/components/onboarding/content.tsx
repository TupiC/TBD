import Image from "next/image";
import Heading from "../typography/heading";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import DatePicker from "../ui/date-picker";
import CustomSelect from "../custom/select";
import { SelectItem } from "../ui/select";

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
        <div className="flex flex-col gap-6">
          <div className={`flex flex-col gap-1`}>
            <Heading>Wir freuen uns auf dich!</Heading>
            <Heading type="h3">
              Erzähle uns, wann du in Salzburg sein wirst
            </Heading>
          </div>
          <div className="flex flex-col gap-4">
            <DatePicker label="Ankuftsdatum" />
            <CustomSelect
              label="Anzahl Tage"
              placeholder="Datum"
              items={[
                <SelectItem key="1" value="1">
                  1 Tag
                </SelectItem>,
                <SelectItem key="2" value="2">
                  2 Tage
                </SelectItem>,
                <SelectItem key="3" value="3">
                  3 Tage
                </SelectItem>,
                <SelectItem key="4" value="4">
                  4 Tage
                </SelectItem>,
                <SelectItem key="5" value="5">
                  &gt; 5 Tage
                </SelectItem>,
              ]}
            />
          </div>
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
