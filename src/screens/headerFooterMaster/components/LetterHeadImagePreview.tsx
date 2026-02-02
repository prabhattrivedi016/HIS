import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";

interface LetterHeadImagePreviewProps {
  pathName: string;
}

const LetterHeadImagePreview = ({ pathName }: LetterHeadImagePreviewProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [image, setImage] = useState<string>("");

  /*-----------------------image preview handler----------------- */
  const getImage = async (filePath: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_FILE_AS_BASE_64,
      {},
      {
        params: {
          filePath: filePath,
        },
      }
    );

    setImage(resp?.data?.base64Data ?? "");
  };

  useEffect(() => {
    if (pathName) {
      getImage(pathName);
    }
  }, [pathName]);

  /*----------------------------------download image handler------------------- */
  const downloadImageHandler = async (pathName: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IMAGE_FILE,
      {},
      {
        params: { filePath: pathName },
        responseType: "blob",
      }
    );

    const blob = resp;
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = pathName.split("/").pop() || "image.png";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {image && (
        <div className="flex flex-col items-center mb-2 -ml-15">
          <img src={image} alt="header-image" className="h-20 w-20 object-contain" />

          <button
            type="button"
            className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-white
                     border border-blue-500 hover:bg-blue-600
                     active:scale-95 transition"
            onClick={() => downloadImageHandler(pathName)}
          >
            <Download size={14} />
          </button>
        </div>
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default LetterHeadImagePreview;
