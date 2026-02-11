import { useEffect, useRef, useState } from "react";
import { CardRightButtonPopupProps } from "../types";
import DoctorTimingModal from "./DoctorTimingModal";

const CardRightButtonPopup = ({ position, doctorId, onClose }: CardRightButtonPopupProps) => {
  console.log("doctorId", doctorId);
  console.log("position", position);

  const [isTimingOpen, setIsTimingOpen] = useState<boolean>(false);

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const MapTimingHandler = () => {
    setIsTimingOpen(true);
  };
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
      {isTimingOpen ? (
        <DoctorTimingModal
          isOpen={isTimingOpen}
          onClose={() => setIsTimingOpen(false)}
          doctorId={doctorId}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default CardRightButtonPopup;
