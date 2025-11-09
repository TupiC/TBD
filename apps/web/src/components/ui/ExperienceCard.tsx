import { TimelineExp } from "./MytripTimeline";

type ExperienceCardProps = {
  exp: TimelineExp;
};

export const ExperienceCard = ({
  exp,
}: ExperienceCardProps): React.JSX.Element => {
  return (
    <div className="exp-timeline-card-item w-[100%] h-[142px] bg-white rounded-[8px] p-4">
      <h3 className="font-bold text-lg truncate">{exp.title}</h3>
      <p
        className="text-sm text-gray-600 mt-1 overflow-hidden text-ellipsis"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        {exp.description}
      </p>
    </div>
  );
};
