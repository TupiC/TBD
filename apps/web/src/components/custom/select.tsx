"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { useId } from "react";

const CustomSelect = ({
  label,
  placeholder,
  items,
}: {
  label: string;
  placeholder: string;
  items: JSX.Element[];
}): JSX.Element => {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="px-1">
        {label}
      </Label>
      <Select>
        <SelectTrigger id={id} className="w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>{items.map((item) => item)}</SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
export default CustomSelect;
