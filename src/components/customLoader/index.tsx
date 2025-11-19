import { Spinner } from "../../../assets/svgIcons";

const CustomLoader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return <></>;

  return (
    <div
      className="
        fixed inset-0 
        bg-black/40 backdrop-blur-sm 
        flex items-center justify-center 
        z-50
      "
    >
      <Spinner height={100} width={100} />
    </div>
  );
};

export default CustomLoader;
