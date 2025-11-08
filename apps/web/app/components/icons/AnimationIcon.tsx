"use client";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useEffect, useRef } from "react";
gsap.registerPlugin(MorphSVGPlugin);

export const AnimationIcon = ({
  className,
  loop = false,
  duration = 0.5,
  ease = "power2.inOut",
  returnToStart = false,
}: {
  className?: string;
  loop?: boolean;
  duration?: number;
  ease?: string;
  returnToStart?: boolean;
}): React.JSX.Element => {
  const playShapeRef = useRef<SVGPathElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!playShapeRef.current) return;

    const iconSequence = [
      "#music-path",
      "#uni-path",
      "#food-path",
      "#tree-path",
      "#bike-path",
      "#house-path",
      "#love-path",
      //   "#festung-path",
    ];

    const tl = gsap.timeline({
      repeat: loop ? -1 : 0,
      repeatDelay: 0.3,
    });

    iconSequence.forEach((targetGroup) => {
      tl.to(playShapeRef.current, {
        duration: duration,
        morphSVG: targetGroup,
        ease: ease,
      });
    });

    if (returnToStart) {
      tl.to(playShapeRef.current, {
        duration: duration,
        morphSVG: playShapeRef.current,
        ease: ease,
      });
    }

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [duration, ease, loop, returnToStart]);

  return (
    <div className={className}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <path
          ref={playShapeRef}
          id="play-path"
          d="M6.90588 4.53677C6.50592 4.29975 6 4.58803 6 5.05294V18.947C6 19.4119 6.50592 19.7002 6.90588 19.4632L18.629 12.5162C19.0211 12.2838 19.0211 11.7162 18.629 11.4838L6.90588 4.53677Z"
          fill="none"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          id="music-path"
          d="M20 14V3L9 5V16 M17 19H18C19.1046 19 20 18.1046 20 17V14H17C15.8954 14 15 14.8954 15 16V17C15 18.1046 15.8954 19 17 19Z M6 21H7C8.10457 21 9 20.1046 9 19V16H6C4.89543 16 4 16.8954 4 18V19C4 20.1046 4.89543 21 6 21Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="invisible"
        />

        <path
          id="uni-path"
          d="M2.57331 8.46332L11.2317 4.13414C11.4006 4.04969 11.5994 4.04969 11.7683 4.13414L20.4267 8.46332C20.8689 8.68444 20.8689 9.31552 20.4267 9.53664L11.7683 13.8658C11.5994 13.9503 11.4006 13.9503 11.2317 13.8658L2.57331 9.53664C2.13108 9.31552 2.13108 8.68444 2.57331 8.46332Z M22.5 13V9.5L20.5 8.5 M4.5 10.5V15.9121C4.5 16.6843 4.94459 17.3876 5.6422 17.7188L10.6422 20.0928C11.185 20.3505 11.815 20.3505 12.3578 20.0928L17.3578 17.7188C18.0554 17.3876 18.5 16.6843 18.5 15.9121V10.5"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="invisible"
        />

        <path
          id="food-path"
          d="M6 20H9M9 20H12M9 20V15 M17 20V12C17 12 19.5 11 19.5 9C19.5 7.24264 19.5 4.5 19.5 4.5 M17 8.5V4.5 M4.49999 11C5.49991 13.1281 8.99999 15 8.99999 15C8.99999 15 12.5001 13.1281 13.5 11C14.5795 8.70257 13.5 4.5 13.5 4.5H4.49999C4.49999 4.5 3.42047 8.70257 4.49999 11Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="invisible"
        />

        <path
          id="tree-path"
          d="M12 22V12M12 12V8M12 12L15 9 M12.4243 18.5757L18.593 12.4071C20.9331 10.0669 20.6927 6.20527 18.0804 4.17346C14.5041 1.39188 9.49616 1.39189 5.91984 4.17347C3.3075 6.20529 3.06707 10.067 5.40723 12.4071L11.5758 18.5757C11.8101 18.81 12.19 18.81 12.4243 18.5757Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="invisible"
        />

        <path
          id="bike-path"
          d="M14 7C15.1046 7 16 6.10457 16 5C16 3.89543 15.1046 3 14 3C12.8954 3 12 3.89543 12 5C12 6.10457 12.8954 7 14 7Z M18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18C15 19.6569 16.3431 21 18 21Z M6 21C7.65685 21 9 19.6569 9 18C9 16.3431 7.65685 15 6 15C4.34315 15 3 16.3431 3 18C3 19.6569 4.34315 21 6 21Z M11.5 17.9999L13 13.9999L8.11768 11.9999L11.1179 8.5L14.1179 11H17.6179"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="invisible"
        />

        <path
          id="house-path"
          d="M9 21H7C4.79086 21 3 19.2091 3 17V10.7076C3 9.30884 3.73061 8.01172 4.92679 7.28676L9.92679 4.25646C11.2011 3.48418 12.7989 3.48418 14.0732 4.25646L19.0732 7.28676C20.2694 8.01172 21 9.30884 21 10.7076V17C21 19.2091 19.2091 21 17 21H15M9 21V17C9 15.3431 10.3431 14 12 14C13.6569 14 15 15.3431 15 17V21M9 21H15"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="invisible"
        />

        <path
          id="love-path"
          d="M16 6.27975C16 6.88118 15.7625 7.45883 15.3383 7.88611C14.3619 8.87007 13.415 9.89605 12.4021 10.8443C12.17 11.0585 11.8017 11.0507 11.5795 10.8268L8.6615 7.88611C7.7795 6.99725 7.7795 5.56225 8.6615 4.67339C9.55218 3.77579 11.0032 3.77579 11.8938 4.67339L11.9999 4.78027L12.1059 4.67345C12.533 4.24286 13.1146 4 13.7221 4C14.3297 4 14.9113 4.24284 15.3383 4.67339C15.7625 5.10073 16 5.67835 16 6.27975Z M18 20L21.8243 16.1757C21.9368 16.0632 22 15.9106 22 15.7515V10.5C22 9.67157 21.3284 9 20.5 9C19.6716 9 19 9.67157 19 10.5V15 M18 16L18.8581 15.1419C18.949 15.051 19 14.9278 19 14.7994C19 14.6159 18.8963 14.4482 18.7322 14.3661L18.2893 14.1447C17.5194 13.7597 16.5894 13.9106 15.9807 14.5193L15.0858 15.4142C14.7107 15.7893 14.5 16.298 14.5 16.8284V20 M6 20L2.17574 16.1757C2.06321 16.0632 2 15.9106 2 15.7515V10.5C2 9.67157 2.67157 9 3.5 9C4.32843 9 5 9.67157 5 10.5V15 M6 16L5.14187 15.1419C5.05103 15.051 5 14.9278 5 14.7994C5 14.6159 5.10366 14.4482 5.26776 14.3661L5.71067 14.1447C6.48064 13.7597 7.41059 13.9106 8.01931 14.5193L8.91421 15.4142C9.28929 15.7893 9.5 16.298 9.5 16.8284V20"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="invisible"
        />
      </svg>
    </div>
  );
};
