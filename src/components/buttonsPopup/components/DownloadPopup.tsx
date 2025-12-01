import { useEffect, useRef } from "react";

const DownloadPopup = ({ anchorRef, position, onClose, onDownloadPdf, onDownloadExcel }) => {
  const popupRef = useRef(null);

  // Close when clicking outside popup
  useEffect(() => {
    const handleOutside = e => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [anchorRef, onClose]);

  return (
    <div
      ref={popupRef}
      className="btn-popup"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <h2 className="downlaod-text">Download As</h2>

      {/* PDF */}
      <button className="data-downlaod-popup-btn" onClick={onDownloadPdf}>
        📄 PDF
      </button>

      {/* Excel */}
      <button className="data-downlaod-popup-btn" onClick={onDownloadExcel}>
        📊 Excel
      </button>
    </div>
  );
};

export default DownloadPopup;
