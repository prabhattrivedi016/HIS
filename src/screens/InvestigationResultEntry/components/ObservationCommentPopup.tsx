import TextEditor from "@/components/ckEditor";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TabularTableDataItem } from "../types";

const ObservationCommentPopup = ({
  isOpen,
  onClose,
  data,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: TabularTableDataItem | null;
  onSave: (row: TabularTableDataItem | null, comment: string) => void;
}) => {
  const [editorValue, setEditorValue] = useState("");

  useScrollLock(isOpen);

  // bind existing comment when popup opens
  useEffect(() => {
    setEditorValue(data?.SampleRemark ?? "");
  }, [data]);

  // text change handler
  const textChange = (value: string) => {
    setEditorValue(value);
  };

  // save handler
  const saveHandler = () => {
    onSave(data, editorValue);
    onClose();
  };

  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-250 ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">Observation Comment</h2>

          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        <div>
          <h1 className="font-semibold mb-2">
            Observation Name :<span className="font-bold ml-2">{data?.ObservationName || "-"}</span>
          </h1>

          {/* text editor */}
          <div className="relative z-[9999]">
            <TextEditor value={editorValue} onChange={textChange} />
          </div>
        </div>

        <div className="form-actions-responsive mt-5">
          <button type="button" className="save-btn" onClick={saveHandler}>
            Save
          </button>

          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ObservationCommentPopup;
