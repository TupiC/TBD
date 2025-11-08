const styles = {
  h1: `text-[32px] font-merriweather-italic font-bold`,
  h3: "font-roboto font-medium text-[20px] text-sc-subheader",
};

const Heading = ({
  type = "h1",
  children,
}: {
  type?: "h1" | "h3";
  children: React.ReactNode;
}): React.JSX.Element => {
  const Tag = type;
  return <Tag className={styles[type]}>{children}</Tag>;
};
export default Heading;
