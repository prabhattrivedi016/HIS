import TextEditor from "@/components/ckEditor";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useState } from "react";
import { createPortal } from "react-dom";
import { TabularTableDataItem } from "../types";

const ObservationCommentPopup = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: TabularTableDataItem | null;
}) => {
  const [editorValue, setEditorValue] = useState("");

  useScrollLock(isOpen);

  //   text change handler
  const textChange = (data: string) => {
    setEditorValue(data);
  };

  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] min-w-250 ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">Observation Comment</h2>
          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>
        <div>
          <h1 className="font-semibold mb-2 ">
            {"Observation Name"}: <span className="font-bold">{data?.InvestigationName}</span>
          </h1>
          {/* text editor */}
          <div className="relative z-9999">
            <TextEditor value={editorValue} onChange={textChange} />
          </div>
        </div>
        <div className="form-actions-responsive mt-5">
          <button type="submit" className="save-btn">
            Save
          </button>
          <button type="button" className="cancel-button " onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ObservationCommentPopup;
