"use client";  
import VisitCard  from "@/components/mytrip/visit-card";
import { TimelineExp } from "@/types/map-point.type";

type MytripTimelineProps = {
  exps: TimelineExp[];
};

export const MytripTimeline = ({
  exps,
}: MytripTimelineProps): React.JSX.Element => {
  return (
    <div className="w-[100%] flex-1 flex flex-col">
      <div className="exps-timeline flex-1 gap-4 flex flex-col overflow-y-auto">
        {exps.map((exp) => (
           <VisitCard
              key={exp.key}
              place={exp}
              // onOpen={(p) => router.push(`/experience/${p.key}`)}   // or p.id if you route by id
              onDismiss={(k) => console.log("dismiss", k)}
              className="h-[300px]"
            />
        ))}
      </div>
    </div>
  );
};
