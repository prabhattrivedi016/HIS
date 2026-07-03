import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { useScrollLock } from "@/hooks/useScrollLock";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type OpDiscountFilterValues = {
  branchId: number;
  fromDate: string;
  toDate: string;
};

type BranchOption = {
  branchId: number;
  branchName: string;
};

const OpDiscountFilterModal = ({
  isOpen,
  onClose,
  onApply,
  initialValues,
  branchList = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (values: OpDiscountFilterValues) => void;
  initialValues: OpDiscountFilterValues;
  branchList?: BranchOption[];
}) => {
  const [filterValues, setFilterValues] = useState<OpDiscountFilterValues>(initialValues);

  useScrollLock(isOpen);

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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-999">
      <div className="popup-bg-overlay opacity-100" onClick={onClose} />

      <div className="central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-200 max-w-2xl opacity-full">
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">Filter OP Discount Approval</h2>
          <button type="button" onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        <form onSubmit={submitHandler} className="p-4">
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
      </div>
    </div>,
    document.body
  );
};

export default OpDiscountFilterModal;
