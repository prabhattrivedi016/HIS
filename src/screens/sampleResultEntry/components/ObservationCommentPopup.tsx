import CentralPopup from "@/components/centralPopup";
import TextEditor from "@/components/ckEditor";
import { useEffect, useState } from "react";
import { SubInvetigationItem } from "../types";

interface ObservationCommentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  data: SubInvetigationItem | null;
  rowWiseCommentChangeHandler?: (comment: string, row: SubInvetigationItem) => void;
  onSave?: (comment: string, row: SubInvetigationItem) => void;
}

const ObservationCommentPopup = ({
  isOpen,
  onClose,
  data,
  rowWiseCommentChangeHandler,
  onSave,
}: ObservationCommentPopupProps) => {
  const [editorValue, setEditorValue] = useState(data?.SampleRemark ?? "");

  console.log("datadatadatadatadatadatadata", data);

  // bind existing comment when popup opens / autofills data in text editor when it has some sample remarks
  useEffect(() => {
    if (isOpen) {
      setEditorValue(data?.SampleRemark ?? "");
    }
  }, [isOpen, data]);

  // text change handler
  const textChange = (value: string) => {
    setEditorValue(value);
  };

  // save handler
  const saveHandler = () => {
    if (data) {
      rowWiseCommentChangeHandler?.(editorValue, data);
      onSave?.(editorValue, data);
    }
    onClose();
  };

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Observation Comment"
      className="lg:min-w-230"
    >
      <>
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
      </>
    </CentralPopup>
  );
};

export default ObservationCommentPopup;
