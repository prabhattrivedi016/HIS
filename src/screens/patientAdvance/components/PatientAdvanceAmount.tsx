import BillingDetails from "@/components/BillingDetails";
import { BillingDetailsHandle } from "@/components/BillingDetails/types";
import InputField from "@/components/customInputField";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { ChangeEvent, RefObject } from "react";
import { AdvanceDetailsItem } from "../types";

const PAYMENT_EXCEEDS_ADVANCE_MESSAGE = "You cannot take more amount than advance amount.";

type PatientAdvanceAmountProps = {
  billingDetailsRef: RefObject<BillingDetailsHandle | null>;
  formResetKey: number;
  patientAdvanceAmount: number;
  onPatientAdvanceAmountChange: (amount: number) => void;
  advanceAmount: AdvanceDetailsItem | undefined;
};

const PatientAdvanceAmount = ({
  billingDetailsRef,
  formResetKey,
  patientAdvanceAmount,
  onPatientAdvanceAmountChange,
  advanceAmount,
}: PatientAdvanceAmountProps) => {
  const advanceAmountChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    onPatientAdvanceAmountChange(value === "" ? 0 : Number(value));
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
            <InputField label="Advance Amount" required>
              <input
                className="input-field"
                placeholder="Enter Advance Amount"
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
          />
        </div>
      </div>
    </div>
  );
};

export default PatientAdvanceAmount;
