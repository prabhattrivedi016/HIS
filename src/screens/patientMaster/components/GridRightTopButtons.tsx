import useGlobalApi from "@/hooks/useGlobalApi";
import { useEffect, useRef, useState } from "react";

const GridRightTopButtons = ({ position, onClose, data }) => {
  console.log("data", data);

  const { loading, fetchApi } = useGlobalApi();

  useEffect(() => {
    const handleClickOutside = e => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  const [isActive, setIsActive] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const popupRef = useRef(null);

  return (
    <div
      ref={popupRef}
      className="absolute z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[220px]"
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      style={{
        top: position.top - 10,
        left: position.left - 210,
      }}
    >
      <div className="flex flex-col gap-1">
        {[
          "Save",
          "Save & Billing",
          "Save & IVF Registration",
          "Save & Admission",
          "Save & Emergency Admission",
          "Save & Dialysis Admission",
          "Save & Daycare Admission",
          "Save & Opd Consultation",
        ].map((item, index) => (
          <button
            key={index}
            className="text-left px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GridRightTopButtons;
