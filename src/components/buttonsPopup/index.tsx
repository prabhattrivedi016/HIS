import { useEffect, useRef } from "react";

const HideShowColumn = ({
  columnNames = [],
  position,
  anchorRef,
  onClose,
  columnVisibility,
  setColumnVisibility,
}) => {
  const popupRef = useRef(null);

  const handleToggle = col => {
    setColumnVisibility(prev => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

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
  }, [onClose, anchorRef]);

  return (
    <div
      ref={popupRef}
      className="btn-popup"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {columnNames.map((col, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={columnVisibility[col]}
            onChange={() => handleToggle(col)}
          />
          <label className="truncate">{col}</label>
        </div>
      ))}
    </div>
  );
};

export default HideShowColumn;
