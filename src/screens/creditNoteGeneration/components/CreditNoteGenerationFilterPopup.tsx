import CentralPopup from "@/components/centralPopup";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export type CreditNoteApprovalFilterValues = {
  branchId: number;
  fromDate: string;
  toDate: string;
};

type BranchOption = {
  branchId: number;
  branchName: string;
};

const CreditNoteGenerationFilterPopup = ({
  isOpen,
  onClose,
  onApply,
  initialValues,
  branchList = [],
  modalTitle = "Filter Credit Note Approval",
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (values: CreditNoteApprovalFilterValues) => void;
  initialValues: CreditNoteApprovalFilterValues;
  branchList?: BranchOption[];
  modalTitle?: string;
}) => {
  const [filterValues, setFilterValues] = useState<CreditNoteApprovalFilterValues>(initialValues);

  useEffect(() => {
    if (isOpen) {
      setFilterValues(initialValues);
    }
  }, [isOpen, initialValues]);

  const branchChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterValues(prev => ({
      ...prev,
      branchId: Number(e.target.value),
    }));
  };

  const fromDateChangeHandler = (value: string) => {
    setFilterValues(prev => ({ ...prev, fromDate: value }));
  };

  const toDateChangeHandler = (value: string) => {
    setFilterValues(prev => ({ ...prev, toDate: value }));
  };

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!filterValues.branchId) return;

    onApply(filterValues);
  };

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      className="w-[92vw] max-w-2xl! max-h-[calc(100vh-20px)] overflow-auto"
    >
      <form onSubmit={submitHandler}>
        <div className="form-grid-3">
          <InputField label="Branch" required>
            <select
              className="input-field"
              value={filterValues.branchId}
              onChange={branchChangeHandler}
              name="branchId"
            >
              <option value={0}>--Select--</option>
              {branchList.map(branch => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="From Date">
            <CustomDateInput value={filterValues.fromDate} onChange={fromDateChangeHandler} />
          </InputField>

          <InputField label="To Date">
            <CustomDateInput value={filterValues.toDate} onChange={toDateChangeHandler} />
          </InputField>
        </div>

        <div className="form-actions-responsive mt-5 flex gap-3">
          <button type="submit" className="save-btn">
            Search
          </button>
        </div>
      </form>
    </CentralPopup>
  );
};

export default CreditNoteGenerationFilterPopup;
