import { ExperienceCard } from "./ExperienceCard";
import { MapPoint } from "./Map";

export type TimelineExp = MapPoint & {
  startDate: string;
  endDate: string;
};

type MytripTimelineProps = {
  exps: TimelineExp[];
};

export const MytripTimeline = ({
  exps,
}: MytripTimelineProps): React.JSX.Element => {
  return (
    <div className="w-[100%] flex-1 flex flex-col">
      <div className="exps-timeline flex-1 gap-4 p-4 flex flex-col overflow-y-auto">
        {exps.map((exp) => (
          <ExperienceCard key={exp.id} exp={exp} />
        ))}
      </div>
    </div>
  );
};
