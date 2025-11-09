const styles = {
  h1: `text-[32px] font-merriweather-italic font-bold`,
  h2: `text-[24px] font-merriweather`,
  h3: "font-roboto text-[20px] text-sc-subheader",
};

const Heading = ({
  type = "h1",
  children,
}: {
  type?: "h1" | "h2" | "h3";
  children: React.ReactNode;
}): React.JSX.Element => {
  const Tag = type;
  return <Tag className={`leading-8 ${styles[type]}`}>{children}</Tag>;
};
export default Heading;
