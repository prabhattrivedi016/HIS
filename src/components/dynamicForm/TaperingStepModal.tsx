import { MEDICINE_DOSE_QUANTITIES, MEDICINE_DURATION_UNITS } from "@/config/medicineDoseOptions";
import { useState } from "react";
import { createPortal } from "react-dom";
import { MedicineDoseScheduleRow } from "./MedicineListControl";
import { OptionSchema } from "./types";

type StepValues = Omit<MedicineDoseScheduleRow, "id">;

export interface TaperingStepModalProps {
  medicineName: string;

  initialValues: StepValues;
  doseUnitOptions: OptionSchema[];
  frequencyOptions: OptionSchema[];
  routeOptions: OptionSchema[];
  instructionOptions: OptionSchema[];
  onSave: (values: StepValues) => void;
  onClose: () => void;
}

const TaperingStepModal = ({
  medicineName,
  initialValues,
  doseUnitOptions,
  frequencyOptions,
  routeOptions,
  instructionOptions,
  onSave,
  onClose,
}: TaperingStepModalProps) => {
  const [step, setStep] = useState<StepValues>(initialValues);

  const isValid = step.doseUnit.trim() !== "" && step.durationUnit.trim() !== "";

  const handleAdd = () => {
    if (!isValid) return;
    onSave(step);
    onClose();
  };

  const field = (
    key: keyof typeof step,
    label: string,
    options: OptionSchema[],
    required?: boolean
  ) => (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1 block">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        className="input-field !mb-0"
        value={step[key] ?? ""}
        onChange={e => setStep(prev => ({ ...prev, [key]: e.target.value }))}
      >
        <option value="">Select</option>
        {options.map(opt => (
          <option key={opt.key ?? String(opt.value)} value={opt.value as string}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-999">
      <div className="popup-bg-overlay" onClick={onClose} />
      <div className="central-popup w-[92vw] max-w-lg opacity-full">
        <div className="popup-header">
          <h2 className="popup-helper-text">Tapering</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        <p className="text-sm text-slate-700 mb-3">
          Medicine Name: <span className="font-semibold">{medicineName}</span>
        </p>

        <div className="grid grid-cols-2 gap-4">
          {field(
            "doseQty",
            "Dose",
            MEDICINE_DOSE_QUANTITIES.map(q => ({ label: q, value: q }))
          )}
          {field("doseUnit", "Unit", doseUnitOptions, true)}
          {field("frequency", "Frequency", frequencyOptions)}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
            <input
              type="number"
              className="input-field !mb-0"
              value={step.durationValue}
              onChange={e => setStep(prev => ({ ...prev, durationValue: e.target.value }))}
            />
          </div>
          {field(
            "durationUnit",
            "Duration Unit",
            MEDICINE_DURATION_UNITS.map(u => ({ label: u, value: u })),
            true
          )}
          {field("route", "Route", routeOptions)}
          {field("instruction", "Instruction", instructionOptions)}
        </div>

        <div className="flex justify-center mt-5">
          <button
            type="button"
            className={isValid ? "save-btn !w-auto !px-8" : "disabled-btn !w-auto !px-8"}
            disabled={!isValid}
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaperingStepModal;
