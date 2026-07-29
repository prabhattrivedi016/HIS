import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";

interface LetterHeadImagePreviewProps {
  pathName: string;
}

const ImageDownload = ({ pathName }: { pathName: string }) => {
  const { loading, fetchApi } = useGlobalApi();

  const downloadHandler = async () => {
    if (!pathName) return;

    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_IMAGE_FILE,
        {},
        {
          params: { filePath: pathName },
          responseType: "blob",
        },
        { component: "ImageDownload" }
      );

      // depending on your API wrapper
      const blob = resp?.data || resp;

      if (!(blob instanceof Blob)) {
        console.error("Invalid blob response");
        return;
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = pathName.split("/").pop() || "file";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <>
      {/* download button */}
      <button type="button" onClick={downloadHandler}>
        {<i className="fa-solid fa-download  icon-color-button"></i>}
      </button>

      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default ImageDownload;
