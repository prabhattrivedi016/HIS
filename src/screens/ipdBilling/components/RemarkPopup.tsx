import CentralPopup from "@/components/centralPopup";
import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { useEffect, useState, type ReactNode } from "react";
import { ServiceTableItem } from "../types";

type RemarkPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  serviceData?: ServiceTableItem | null;
  onSave: (remarks: string) => void;
};
const RemarkPopup = ({
  isOpen,
  onClose,
  children,
  serviceData,
  onSave,
}: RemarkPopupProps) => {
  const serviceWiseRemarksList = usePickMaster("ServiceWiseRemarks")?.pickMasterValue ?? [];

  const [editorValue, setEditorValue] = useState("");

  // bind existing comment when popup opens
  useEffect(() => {
    setEditorValue(serviceData?.remarks || "");
  }, [serviceData]);

  // text change handler
  const textChange = (value: string) => {
    setEditorValue(value);
  };

  //   remark change handler
  const remarkChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditorValue(e.target.value);
  };

  //   on save button handler
  const onSaveButtonHandler = () => {
    onSave(editorValue);
  };
  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Add Service Remark"
      className="min-w-[92vw] lg:min-w-200"
    >
      <div>
        <div className="flex flex-row gap-2 justify-between">
          <h1 className="font-semibold mb-2">
            Observation Name :
            <span className="font-bold ml-2">{serviceData?.serviceName || "-"}</span>
          </h1>
          <InputField>
            <select className="input-field min-w-50" onChange={remarkChangeHandler}>
              <option>--Select Remark--</option>
              {serviceWiseRemarksList?.map((s: PickMasterItem) => {
                return (
                  <option key={s?.key} value={s?.value}>
                    {s?.key}
                  </option>
                );
              })}
            </select>
          </InputField>
        </div>

        {/* text editor */}
        <div className="relative z-[9999]">
          <TextEditor value={editorValue} onChange={textChange} />
        </div>
      </div>

      <div className="form-actions-responsive mt-2">
        <button type="button" className="save-btn" onClick={onSaveButtonHandler}>
          Save
        </button>

        <button type="button" className="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </CentralPopup>
  );
};

export default RemarkPopup;
