import BillingDetails, { BillingDetailsHandle } from "@/components/BillingDetails";
import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useContext, useRef, useState } from "react";
import { IpdPatientItem } from "../types";

interface BillSettlementProps {
  patient?: IpdPatientItem;
}

interface BillingDetailsPayload {
  type: "P" | "R";
  guardianName: string;
  amountValue: string;
  remarks: string;
}

const BillSettlement = ({ patient }: BillSettlementProps) => {
  const { loading, fetchApi } = useGlobalApi();

  console.log("patient", patient);

  const branchId = useContext(BranchContext)?.branchId ?? 1;
  const roleId = useContext(RoleContext)?.roleId ?? 2;

  const billingDetailsRef = useRef<BillingDetailsHandle>(null);

  const [billingDetailsPayload, setBillingDetailsPayload] = useState<BillingDetailsPayload>({
    type: "P",
    guardianName: "",
    amountValue: "",
    remarks: "",
  });

  //   get bill details

  const getBillSettlementDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_PATIENT_BILL_AMOUNTS,
      {},
      {
        params: {
          visitId: patient?.VisitId,
          patientId: patient?.PatientId,
        },
      },
      { component: "BillSettlement" }
    );

    return resp?.data?.[0] ?? {};
  };

  const { data: billSettlementData = {}, refetch: getBillDetails } = useQuery({
    queryKey: ["bill-settlement-details", patient?.PatientId, patient?.VisitId],
    queryFn: getBillSettlementDetails,

    // Both values are required
    enabled: !!patient?.PatientId && !!patient?.VisitId,
  });

  // input change handler
  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setBillingDetailsPayload(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  //   create payload
  const createPayload = () => {
    const billingPayload = billingDetailsRef.current?.getPayload();

    const payments = (billingPayload?.payments ?? []) as Array<Record<string, unknown>>;

    return {
      branchId: Number(branchId),
      roleId: Number(roleId),
      type: billingDetailsPayload.type,
      patientId: Number(patient?.PatientId) || 0,
      uhid: patient?.UHID || "",
      visitId: Number(patient?.VisitId) || 0,
      uniqueId: "",
      remarks: billingDetailsPayload?.remarks?.trim(),
      guardianName: billingDetailsPayload.guardianName.trim(),

      paymentDetails: payments.map(payment => ({
        paymentModeId: Number(payment?.paymentModeId) || 0,
        paymentModeTypeId: Number(payment?.paymentModeTypeId) || 0,
        amount: Number(payment?.amount) || 0,
        isCopaymentReceipt: Number(payment?.isCopaymentReceipt) || 0,
        isPatientAdvanceAmount: billingDetailsPayload?.type == "R" ? 1 : 0,
        bankId: Number(payment?.bankId) || 0,
        refNo: payment?.refNo || "",
        plutusTransactionReferenceID: payment?.plutusTransactionReferenceID || "",
        transactionLogId: payment?.transactionLogId || "",
      })),
    };
  };
  //   on save
  const submitHandler = async () => {
    const payload = createPayload();
    if (!payload?.type || Number(billingDetailsPayload?.amountValue) <= 0) {
      showWarning("Please select type and enter valid amount");
      return;
    }

    // Validate BillingDetails payment rows
    const isValid = await billingDetailsRef.current?.validateForm();

    if (!isValid) {
      return;
    }

    console.log("FINAL PAYLOAD:", payload);
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_IPD_PATIENT_ADVANCE,
      payload,
      {},
      { component: "BillSettlement" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Failed while updating patient advance");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    setBillingDetailsPayload({
      type: "P",
      guardianName: "",
      amountValue: "",
      remarks: "",
    });

    await getBillDetails?.();
    billingDetailsRef?.current?.reset();
  };

  return (
    <div className="w-full">
      <div className="card">
        <div className="p-3 ">
          <div className="form-grid-4">
            <InputField label="Bill No">
              <input
                className="disabled-input-field"
                readOnly
                value={billSettlementData?.BillNo ?? ""}
                disabled
              />
            </InputField>

            <InputField label="Bill Date">
              <input
                className="disabled-input-field"
                readOnly
                value={billSettlementData?.BillDate ?? ""}
                disabled
              />
            </InputField>

            <InputField label="Is File Closed">
              <select
                className="disabled-input-field"
                value={Number(patient?.IsFileClosed) ? 1 : 0}
                disabled
              >
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
            </InputField>

            <InputField label="Net Payable Amount">
              <input
                className="disabled-input-field"
                readOnly
                value={billSettlementData?.TotalPayableAmount ?? ""}
                disabled
              />
            </InputField>

            <InputField label="Total Paid Amount">
              <input
                className="disabled-input-field"
                readOnly
                value={billSettlementData?.PatientAdvanceAmt ?? ""}
                disabled
              />
            </InputField>

            <InputField label="Total Balance Amount">
              <input
                className="disabled-input-field"
                readOnly
                value={billSettlementData?.TotalBalanceAmount ?? ""}
                disabled
              />
            </InputField>

            <InputField label="GST Amount">
              <input
                className="disabled-input-field"
                readOnly
                value={billSettlementData?.GSTAmt ?? ""}
                disabled
              />
            </InputField>
          </div>
        </div>

        <div className="p-3">
          <div className="form-grid-2">
            <div>
              <div className="form-grid-2 ">
                <InputField label="Type" required>
                  <select
                    className="input-field"
                    name="type"
                    value={billingDetailsPayload.type}
                    onChange={inputChangeHandler}
                  >
                    <option value="P">IPD Advance</option>
                    <option value="R">Refund</option>
                  </select>
                </InputField>

                <InputField label="Amount" required>
                  <input
                    type="text"
                    name="amountValue"
                    className="input-field"
                    placeholder="Enter amount"
                    onInput={allowOnlyNumbers}
                    value={billingDetailsPayload.amountValue ?? 0}
                    onChange={inputChangeHandler}
                  />
                </InputField>

                <InputField label="Guardian Name">
                  <input
                    type="text"
                    name="guardianName"
                    className="input-field"
                    placeholder="Enter guardian name"
                    value={billingDetailsPayload.guardianName}
                    onChange={inputChangeHandler}
                  />
                </InputField>

                <InputField label="Remarks">
                  <input
                    type="text"
                    name="remarks"
                    className="input-field"
                    placeholder="Enter remarks"
                    value={billingDetailsPayload.remarks}
                    onChange={inputChangeHandler}
                  />
                </InputField>
              </div>
            </div>

            {/* payment methods */}

            <div>
              <BillingDetails
                ref={billingDetailsRef}
                hideBillingSection
                showPaymentMode
                maxPaymentAmount={Number(billingDetailsPayload.amountValue) || 0}
                isRefundPaymentModes={0}
                corporateId={Number(patient?.CorporateId) || 1}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-2">
        <button type="submit" className="save-btn w-30" disabled={loading} onClick={submitHandler}>
          Save
        </button>
      </div>
    </div>
  );
};

export default BillSettlement;
