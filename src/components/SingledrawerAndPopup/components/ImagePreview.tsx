import { useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";

const ImagePreview = ({ pathName }: { pathName: string }) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [image, setImage] = useState<string>("");

  // image preview
  const getImage = async (filePath: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_FILE_AS_BASE_64,
      {},
      {
        params: {
          filePath: filePath,
        },
      },
      { component: "ImagePreview" }
    );

    setImage(resp?.data?.base64Data ?? "");
  };

  useEffect(() => {
    if (pathName) {
      getImage(pathName);
    }
  }, [pathName]);

  return (
    <>
      {image && (
        <div className="flex flex-col items-center mb-2 -ml-15">
          <img src={image} alt="header-image" className="h-20 w-20 object-contain" />
        </div>
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default ImagePreview;
