import { TimelineExp } from "./MytripTimeline";

type ExperienceCardProps = {
  exp: TimelineExp;
};

export const ExperienceCard = ({
  exp,
}: ExperienceCardProps): React.JSX.Element => {
  return (
    <div
      className="exp-timeline-card-item w-[100%] h-[142px] bg-white rounded-[8px] p-4"
      style={{
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        backgroundImage: `url(${exp.thumbnailUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="w-[100%] h-[100%] rounded-[8px]"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "8px",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          fontSize: "18px",
        }}
      >
        <span>{exp.startDate}</span>
        <h3
          className="font-bold text-lg truncate"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            fontSize: "24px",
          }}
        >
          {exp.title}
        </h3>
        <span>{exp.startDate}</span>

        <button
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            backgroundColor: "#ffffffff",
            color: "#000000ff",
            border: "none",
            width: "32px",
            height: "24px",
            borderRadius: "16px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {"->"}
        </button>
      </div>
    </div>
  );
};
