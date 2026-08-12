import BillingDetails from "@/components/BillingDetails";
import { BillingDetailsHandle } from "@/components/BillingDetails/types";
import InputField from "@/components/customInputField";
import { showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { ChangeEvent, RefObject } from "react";
import { AdvanceDetailsItem } from "../types";

const PAYMENT_EXCEEDS_ADVANCE_MESSAGE = `You cannot take more amount than advance amount.`;

type PatientAdvanceAmountProps = {
  billingDetailsRef: RefObject<BillingDetailsHandle | null>;
  formResetKey: number;
  patientAdvanceAmount: number;
  onPatientAdvanceAmountChange: (amount: number) => void;
  advanceAmount: AdvanceDetailsItem | undefined;
  selectedAdvanceType: number;
  onAdvanceTypeChange: (type: number) => void;
};

const PatientAdvanceAmount = ({
  billingDetailsRef,
  formResetKey,
  patientAdvanceAmount,
  onPatientAdvanceAmountChange,
  advanceAmount,
  selectedAdvanceType,
  onAdvanceTypeChange,
}: PatientAdvanceAmountProps) => {
  const advanceAmountChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (selectedAdvanceType === 1 && advanceAmount?.TotalNetAmt! < Number(value)) {
      showWarning("you cannot refund more amount than net amount");
      return;
    }
    onPatientAdvanceAmountChange(value === "" ? 0 : Number(value));
  };

  // advance type select handler
  const advanceTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    onAdvanceTypeChange(value);

    if (
      value === 1 &&
      advanceAmount?.TotalNetAmt !== undefined &&
      patientAdvanceAmount > advanceAmount.TotalNetAmt
    ) {
      showWarning("you cannot refund more amount than net amount");
      onPatientAdvanceAmountChange(advanceAmount.TotalNetAmt);
    }
  };

  return (
    <div className="card">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Total Credit Amount">
              <input
                className="disabled-input-field"
                value={advanceAmount?.TotalCreditAmt ?? 0}
                readOnly
                disabled
              />
            </InputField>

            <InputField label="Total Debit Amount">
              <input
                className="disabled-input-field"
                placeholder="Enter Total Debit Amount"
                value={advanceAmount?.TotalDebitAmt ?? 0}
                readOnly
                disabled
              />
            </InputField>

            <InputField label="Total Refund Amount">
              <input
                className="disabled-input-field"
                placeholder="Enter Total Balance Amount"
                value={advanceAmount?.TotalRefunAmount ?? 0}
                readOnly
                disabled
              />
            </InputField>

            <InputField label="Total Net Amount">
              <input
                className="disabled-input-field"
                placeholder="Enter Total Advance Amount"
                value={advanceAmount?.TotalNetAmt ?? 0}
                readOnly
                disabled
              />
            </InputField>
            <InputField label="Advance Type">
              <select
                className="input-field"
                onChange={advanceTypeSelectHandler}
                value={selectedAdvanceType}
              >
                <option value={0}>Advance</option>
                <option value={1}>Refund</option>
              </select>
            </InputField>
            <InputField
              label={selectedAdvanceType === 0 ? "Advance Amount" : "Refund Amount"}
              required
            >
              <input
                className="input-field"
                placeholder={
                  selectedAdvanceType === 0 ? "Enter Advance Amount" : "Enter Refund Amount"
                }
                value={patientAdvanceAmount > 0 ? String(patientAdvanceAmount) : ""}
                onChange={advanceAmountChangeHandler}
                onInput={allowOnlyNumbers}
              />
            </InputField>
          </div>
        </div>

        <div className="w-full">
          <BillingDetails
            key={`patient-advance-billing-${formResetKey}`}
            ref={billingDetailsRef}
            hideBillingSection
            showPaymentMode
            maxPaymentAmount={patientAdvanceAmount}
            paymentAmountExceededMessage={PAYMENT_EXCEEDS_ADVANCE_MESSAGE}
            isRefundPaymentModes={selectedAdvanceType}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientAdvanceAmount;
