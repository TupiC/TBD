import Image from "next/image";

const VisitCard = (): React.JSX.Element => {
  return (
    <div >
      <div className="relative h-[40%] ">
        <Image
          src="/images/hero.png"
          alt="View of salzburg with castle and churches"
          fill
          objectFit="contain"
        />
      </div>
    </div>
  );
};

export default VisitCard;
