const Body = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  return <p className={`text-lg font-roboto`}>{children}</p>;
};
export default Body;
