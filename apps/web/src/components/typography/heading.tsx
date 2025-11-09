const styles = {
  h1: `text-[32px] leading-10 font-merriweather-italic font-bold`,
  h2: `text-[24px] leading-8 font-merriweather`,
  h3: "font-roboto leading-6 text-[20px] text-sc-subheader",
};

const Heading = ({
  type = "h1",
  style,
  children,
}: {
  type?: "h1" | "h2" | "h3";
  style?: "h1" | "h2" | "h3";
  children: React.ReactNode;
}): React.JSX.Element => {
  const Tag = type;
  const customStyle = style === undefined ? type : style;
  return <Tag className={`${styles[customStyle]}`}>{children}</Tag>;
};
export default Heading;
