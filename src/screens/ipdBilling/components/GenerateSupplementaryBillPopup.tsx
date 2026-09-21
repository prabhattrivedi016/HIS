import BillingDetails, { BillingDetailsHandle } from "@/components/BillingDetails";
import { BillingValuesItem } from "@/components/BillingDetails/types";
import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { useContext, useMemo, useRef } from "react";
import { IpdPatientItem, IpdSummaryBillingTableList } from "../types";

const GenerateSupplementaryBillPopup = ({
  isOpen,
  onClose,
  dataList,
  patient,
}: {
  isOpen: boolean;
  onClose: () => void;
  dataList: IpdSummaryBillingTableList[];
  patient: IpdPatientItem;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const billingDetailsRef = useRef<BillingDetailsHandle>(null);
  const branchId = useContext(BranchContext)?.branchId ?? 1;
  const roleId = useContext(RoleContext)?.roleId ?? 0;

  // Compute bill summary from selected items — all read-only, no user edits
  const billingSummary = useMemo(() => {
    const grossBillAmount = dataList.reduce((sum, item) => sum + Number(item.GrossAmt ?? 0), 0);
    const totalDiscAmtOnBill = dataList.reduce((sum, item) => sum + Number(item.DiscAmt ?? 0), 0);
    const totalDiscPerOnBill =
      grossBillAmount > 0 ? (totalDiscAmtOnBill / grossBillAmount) * 100 : 0;
    const netAmount = Math.round(grossBillAmount - totalDiscAmtOnBill);

    return {
      grossBillAmount: Number(grossBillAmount.toFixed(2)),
      totalDiscAmtOnBill: Number(totalDiscAmtOnBill.toFixed(2)),
      totalDiscPerOnBill: Number(totalDiscPerOnBill.toFixed(2)),
      netAmount,
    };
  }, [dataList]);

  const billingValues: BillingValuesItem = {
    grossBillAmount: billingSummary.grossBillAmount,
    totalDiscPerOnBill: billingSummary.totalDiscPerOnBill,
    totalDiscAmtOnBill: billingSummary.totalDiscAmtOnBill,
    roundOff: 0,
    netAmount: billingSummary.netAmount,
    balanceAmount: 0,
    discApprovedById: 0,
    discApprovedName: "",
    discountReason: "",
    remarks: "",
  };

  const handleGenerateBill = async () => {
    // Skip BillingDetails.validateForm() — it validates the discount-approval
    // fields which are part of our own disabled section, not BillingDetails'.
    const billingPayload = billingDetailsRef.current?.getPayload?.();
    const payments = Array.isArray(billingPayload?.payments) ? billingPayload.payments : [];

    const roundOff =
      billingSummary.netAmount -
      (billingSummary.grossBillAmount - billingSummary.totalDiscAmtOnBill);

    const payload = {
      visitDetails: {
        patientId: Number(patient?.PatientId) || 0,
        branchId: Number(branchId) || 0,
        roleId: Number(roleId) || 0,
        visitId: Number(patient?.VisitId) || 0,
        grossBillAmount: billingSummary.grossBillAmount,
        totalDiscPerOnBill: billingSummary.totalDiscPerOnBill,
        totalDiscAmtOnBill: billingSummary.totalDiscAmtOnBill,
        roundOff: Number(roundOff.toFixed(2)),
        netAmount: billingSummary.netAmount,
        discApprovedById: 0,
        discountReason: "",
        remarks: "",
        uniqueId: "",
      },
      billingItems: dataList.map(item => ({
        serviceItemId: Number(item.ServiceItemId),
        ftId: Number(item.FTID),
        ftdId: Number(item.FTDId),
      })),
      paymentDetails:
        payments.length > 0
          ? payments.map((p: Record<string, unknown>) => ({
              paymentModeId: Number(p?.paymentModeId) || 0,
              paymentModeTypeId: Number(p?.paymentModeTypeId) || 0,
              amount: Number(p?.amount) || 0,
              isCopaymentReceipt: Number(p?.isCopaymentReceipt ?? 0),
              isPatientAdvanceAmount: Number(p?.isPatientAdvanceAmount ?? 0),
              bankId: Number(p?.bankId) || 0,
              refNo: String(p?.refNo ?? ""),
              plutusTransactionReferenceID: String(p?.plutusTransactionReferenceID ?? ""),
              transactionLogId: String(p?.transactionLogId ?? ""),
            }))
          : [
              {
                paymentModeId: 0,
                paymentModeTypeId: 0,
                amount: 0,
                isCopaymentReceipt: 0,
                isPatientAdvanceAmount: 0,
                bankId: 0,
                refNo: "",
                plutusTransactionReferenceID: "",
                transactionLogId: "",
              },
            ],
      isBillDiscount: billingSummary.totalDiscAmtOnBill > 0 ? 1 : 0,
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_SUPPLEMENTARY_BILL_FROM_MAIN_BILL,
      payload,
      {},
      { component: "GenerateSupplementaryBillPopup" }
    );

    if (!resp?.result) {
      showError(resp?.message ?? "Failed to generate supplementary bill.");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    onClose();
  };

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Supplementary Bill"
      className="lg:min-w-[calc(100vw-10%)]"
    >
      <div className="w-full flex flex-col gap-3">
        {/* Items Table */}
        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-w-300">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Category</th>
                    <th className="table-th">Sub Category</th>
                    <th className="table-th">Sub Sub Category</th>
                    <th className="table-th">Print Group</th>
                    <th className="table-th">Service Code</th>
                    <th className="table-th">Service Name</th>
                    <th className="table-th">Doctor</th>
                    <th className="table-th text-right">Rate</th>
                    <th className="table-th text-right">Qty</th>
                    <th className="table-th text-right">Gross Amt</th>
                    <th className="table-th text-right">Disc %</th>
                    <th className="table-th text-right">Disc Amt</th>
                    <th className="table-th text-right">Net Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.length === 0 && (
                    <tr>
                      <td colSpan={14} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}
                  {dataList.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.CategoryName || "-"}</td>
                      <td className="table-td">{item?.SubCategoryName || "-"}</td>
                      <td className="table-td">{item?.SubSubCategoryName || "-"}</td>
                      <td className="table-td">{item?.PrintGroupName || "-"}</td>
                      <td className="table-td">{item?.ServiceCode || "-"}</td>
                      <td className="table-td">{item?.ServiceName || "-"}</td>
                      <td className="table-td">{item?.DoctorName || "-"}</td>
                      <td className="table-td text-right">{item?.Rate ?? "-"}</td>
                      <td className="table-td text-right">{item?.Qty ?? "-"}</td>
                      <td className="table-td text-right">{item?.GrossAmt ?? "-"}</td>
                      <td className="table-td text-right">{item?.DiscPer ?? "-"}</td>
                      <td className="table-td text-right">{item?.DiscAmt ?? "-"}</td>
                      <td className="table-td text-right font-semibold">{item?.NetAmt ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>

                {/* Summary footer row */}
                {/* {dataList.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold text-gray-700">
                      <td
                        colSpan={10}
                        className="table-td text-right text-xs uppercase tracking-wide text-gray-500"
                      >
                        Totals
                      </td>
                      <td className="table-td text-right">
                        {billingSummary.grossBillAmount.toFixed(2)}
                      </td>
                      <td className="table-td text-right">
                        {billingSummary.totalDiscPerOnBill.toFixed(2)}%
                      </td>
                      <td className="table-td text-right">
                        {billingSummary.totalDiscAmtOnBill.toFixed(2)}
                      </td>
                      <td className="table-td text-right text-blue-600">
                        {billingSummary.netAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )} */}
              </table>
            </div>
          </div>
        </div>

        {/* Billing Details — all fields read-only / disabled */}
        <div className="card ">
          <div className="flex flex-col lg:flex-row gap-1 w-full">
            {/* Left: billing summary fields */}

            {/* Right: payment modes via BillingDetails */}
            <div className="w-full ">
              <BillingDetails
                ref={billingDetailsRef}
                billingValues={billingValues}
                showPaymentMode={true}
                hideBillingSection={false}
                maxPaymentAmount={billingSummary.netAmount}
                disableDiscountEditing={true}
                disableApprovalFields={true}
                paymentBilling={{
                  grossBillAmount: billingSummary.grossBillAmount,
                  totalDiscPerOnBill: billingSummary.totalDiscPerOnBill,
                  totalDiscAmtOnBill: billingSummary.totalDiscAmtOnBill,
                  netAmount: billingSummary.netAmount,
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-1">
          <button className="save-btn" onClick={handleGenerateBill} disabled={loading}>
            Generate Bill
          </button>
        </div>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default GenerateSupplementaryBillPopup;
