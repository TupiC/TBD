"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const DatePicker = ({
    label,
    state,
    setState,
}: {
    label: string;
    state: Date | undefined;
    setState: (val: Date | undefined) => void;
}) => {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        console.log("DatePicker state changed:", state);
    }, []);

    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="date" className="px-1">
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date"
                        className="justify-between w-48 font-normal"
                    >
                        {state
                            ? new Date(state).toLocaleDateString()
                            : "Select date"}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 w-auto overflow-hidden"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={state}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                            setState(date);
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default DatePicker;
