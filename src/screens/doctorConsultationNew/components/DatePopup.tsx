import InputField from "@/components/customInputField";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useEffect, useState } from "react";

const DatePopup = ({ isOpen, onClose, onAdd }) => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setCurrentDate(now.toISOString().split("T")[0]);
      setCurrentTime(now.toTimeString().slice(0, 5));
    }
  }, [isOpen]);

  const handleAdd = () => {
    onAdd(`${currentDate} ${currentTime}`);
    onClose();
  };

  useScrollLock(isOpen);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">Select Date & Time for Vital</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        <div className="form-grid-1">
          <InputField label="Date" required>
            <input
              type="date"
              className="input-field"
              value={currentDate}
              min={currentDate}
              onChange={e => setCurrentDate(e.target.value)}
            />
          </InputField>

          <InputField label="Time" className="mt-3" required>
            <input
              type="time"
              className="input-field"
              value={currentTime}
              onChange={e => setCurrentTime(e.target.value)}
            />
          </InputField>
        </div>

        <div className="form-actions-responsive mt-5">
          <button type="button" className="save-btn" onClick={handleAdd}>
            Add Column
          </button>
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePopup;
