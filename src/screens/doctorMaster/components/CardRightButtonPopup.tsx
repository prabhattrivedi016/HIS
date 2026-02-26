import { useEffect, useRef, useState } from "react";
import { CardRightButtonPopupProps } from "../types";
import DoctorTimingModal from "./DoctorTimingModal";

const CardRightButtonPopup = ({ position, doctorId, onClose }: CardRightButtonPopupProps) => {
  const [isTimingOpen, setIsTimingOpen] = useState<boolean>(false);
  const [renderTimingModal, setRenderTimingModal] = useState<boolean>(false);

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const MapTimingHandler = () => {
    setRenderTimingModal(true);
    requestAnimationFrame(() => {
      setIsTimingOpen(true);
    });
  };

  const handleCloseTimingModal = () => {
    setIsTimingOpen(false);
  };

  useEffect(() => {
    if (isTimingOpen) return;

    const closeTimer = setTimeout(() => {
      setRenderTimingModal(false);
    }, 300);

    return () => clearTimeout(closeTimer);
  }, [isTimingOpen]);
  if (!position) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      className="btn-popup"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
    >
      <button className="data-download-popup-btn" onClick={MapTimingHandler}>
        Map Timing
      </button>
      {renderTimingModal && doctorId !== null ? (
        <DoctorTimingModal
          isOpen={isTimingOpen}
          onClose={handleCloseTimingModal}
          doctorId={doctorId}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default CardRightButtonPopup;
