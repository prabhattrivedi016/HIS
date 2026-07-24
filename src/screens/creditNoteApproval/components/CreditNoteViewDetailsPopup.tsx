import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { OpDiscountApprovalLevelTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type CreditNoteDetailType = {
  TokenNo?: string;
  UHID?: string;
  PatientName?: string;
  Age?: string;
  Gender?: string;
  CorporateName?: string;
  Status?: string;
  TotalBillAmount?: number;
  BillDiscountPercentage?: number;
  TotalDiscountAmountOnBill?: number;
  TotalPatientPayableAmount?: number;
  DiscountApprovedName?: string;
  DiscountReason?: string;
  Remark?: string;
  ApprovalLevel?: string | number;
  IsAllApprovalRequired?: number;
  ApprovalFlow?: string;
  ApprovedPercentage?: number;
  ApprovalRemarks?: string;
  IsDiscountApproved?: number;
  IsDiscountApprovalRequired?: number;
  Level1ApproverNames?: string;
  IsLevel1Approve?: number | string;
  Level1ApprovedByName?: string;
  Level1ApproveOn?: string;
  Level2ApproverNames?: string;
  IsLevel2Approve?: number | string;
  Level2ApprovedByName?: string;
  Level2ApproveOn?: string;
  Level3ApproverNames?: string;
  IsLevel3Approve?: number | string;
  Level3ApprovedByName?: string;
  Level3ApproveOn?: string;
  Level4ApproverNames?: string;
  IsLevel4Approve?: number | string;
  Level4ApprovedByName?: string;
  Level4ApproveOn?: string;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

// Approver names arrive as a comma-separated string; render each on its own line.
const splitApproverNames = (value: string | null | undefined) =>
  String(value ?? "")
    .split(",")
    .map(name => name.trim())
    .filter(Boolean);

const ApproverNamesCell = ({ value }: { value: string | null | undefined }) => {
  const names = splitApproverNames(value);

  if (names.length === 0) return <>-</>;

  return (
    <div className="flex flex-col gap-0.5">
      {names.map((name, index) => (
        <span key={`${name}-${index}`}>{name}</span>
      ))}
    </div>
  );
};

const CreditNoteViewDetailsPopup = ({
  isOpen,
  onClose,
  creditNoteId,
}: {
  isOpen: boolean;
  onClose: () => void;
  creditNoteId: number;
}) => {
  console.log("creditNoteId from view details popup", creditNoteId);
  const { loading, fetchApi } = useGlobalApi();
  const [detail, setDetail] = useState<CreditNoteDetailType | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    const recordId = Number(creditNoteId ?? 0);
    if (!isOpen || !recordId) return;

    let isActive = true;

    const getApprovalDetails = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CREDIT_NOTE_REQUEST_DETAILS_BY_CREDIT_NOTE_ID,
        {},
        { params: { creditNoteId: recordId } },
        { component: "CreditNoteViewDetailsPopup" }
      );

      console.log("resp", resp?.data);

      if (isActive) {
        setDetail(resp?.data?.[0] ?? null);
      }
    };

    void getApprovalDetails();

    return () => {
      isActive = false;
    };
  }, [isOpen, creditNoteId]);

  useEffect(() => {
    if (!isOpen) {
      setDetail(null);
    }
  }, [isOpen]);

  const patientDetails = [
    { label: "Token No", value: detail?.TokenNo },
    { label: "UHID", value: detail?.UHID },
    { label: "Patient Name", value: detail?.PatientName },
    {
      label: "Age/Gender",
      value: detail?.Age ? `${detail.Age} / ${detail?.Gender ?? ""}` : detail?.Gender,
    },
    { label: "Corporate", value: detail?.CorporateName },
    { label: "Status", value: detail?.Status },
  ];

  const billingDetails = [
    { label: "Total Bill Amount", value: detail?.TotalBillAmount },
    { label: "Bill Discount (%)", value: detail?.BillDiscountPercentage },
    { label: "Total Discount Amount", value: detail?.TotalDiscountAmountOnBill },
    { label: "Total Payable Amount", value: detail?.TotalPatientPayableAmount },
    { label: "Discount Approved Name", value: detail?.DiscountApprovedName },
    { label: "Discount Reason", value: detail?.DiscountReason },
    { label: "Remark", value: detail?.Remark },
  ];

  const approvalLevels = [
    {
      level: "Level 1",
      approverNames: detail?.Level1ApproverNames,
      isApprove: detail?.IsLevel1Approve,
      approvedBy: detail?.Level1ApprovedByName,
      approvedOn: detail?.Level1ApproveOn,
    },
    {
      level: "Level 2",
      approverNames: detail?.Level2ApproverNames,
      isApprove: detail?.IsLevel2Approve,
      approvedBy: detail?.Level2ApprovedByName,
      approvedOn: detail?.Level2ApproveOn,
    },
    {
      level: "Level 3",
      approverNames: detail?.Level3ApproverNames,
      isApprove: detail?.IsLevel3Approve,
      approvedBy: detail?.Level3ApprovedByName,
      approvedOn: detail?.Level3ApproveOn,
    },
    {
      level: "Level 4",
      approverNames: detail?.Level4ApproverNames,
      isApprove: detail?.IsLevel4Approve,
      approvedBy: detail?.Level4ApprovedByName,
      approvedOn: detail?.Level4ApproveOn,
    },
  ].filter(level => splitApproverNames(level.approverNames).length > 0);

  const showApprovalTable = true;

  if (!isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-260 ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">Patient Booking Details</h2>

          <button type="button" onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        {/* patient details */}
        <div className="card w-full mb-1">
          <h3 className="card-header text-lg font-semibold italic">Patient Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {patientDetails.map(patientDetail => (
              <div key={patientDetail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{patientDetail.label} :</span>
                <span className="truncate">{formatValue(patientDetail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card w-full mb-1">
          <h3 className="card-header text-lg font-semibold italic">Billing Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {billingDetails.map(billingDetail => (
              <div key={billingDetail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{billingDetail.label} :</span>
                <span className="truncate">{formatValue(billingDetail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* approval levels table */}
        {showApprovalTable && (
          <div className="card w-full mb-1">
            <h3 className="card-header text-lg font-semibold italic">Approval Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mb-1">
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Level :</span>
                <span className="truncate">{formatValue(detail?.ApprovalLevel)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">All Approval Reqired :</span>
                <span className="truncate">
                  {formatValue(detail?.IsAllApprovalRequired === 1 ? "Yes" : "No")}
                </span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Flow :</span>
                <span className="truncate">{formatValue(detail?.ApprovalFlow)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approved Discount (%) :</span>
                <span className="truncate">{formatValue(detail?.ApprovedPercentage ?? 0)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Remarks :</span>
                <span className="truncate">{formatValue(detail?.ApprovalRemarks)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Status :</span>
                <span className="truncate">
                  {formatValue(detail?.IsDiscountApproved === 1 ? "Yes" : "No")}
                </span>
              </div>
            </div>
            <div className="table-container">
              <div className="table-scroll-wrapper">
                <div className="table-size">
                  <table className="base-table w-full">
                    <thead className="table-head">
                      <tr>
                        {OpDiscountApprovalLevelTableHeader.map((h: string, index: number) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {approvalLevels.length === 0 && (
                        <tr>
                          <td
                            colSpan={OpDiscountApprovalLevelTableHeader.length}
                            className="table-empty"
                          >
                            No data found
                          </td>
                        </tr>
                      )}

                      {approvalLevels.map(level => (
                        <tr key={level.level} className="table-row">
                          <td className="table-td">{level.level}</td>
                          <td className="table-td">
                            <ApproverNamesCell value={level.approverNames} />
                          </td>
                          <td
                            className={`table-td ${
                              Number(level.isApprove) === 1 ? "active-text" : "inactive-text"
                            }`}
                          >
                            {Number(level.isApprove) === 1 ? "Yes" : "No"}
                          </td>
                          <td className="table-td">{formatValue(level.approvedBy)}</td>
                          <td className="table-td">{formatValue(level.approvedOn)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(CreditNoteViewDetailsPopup);
