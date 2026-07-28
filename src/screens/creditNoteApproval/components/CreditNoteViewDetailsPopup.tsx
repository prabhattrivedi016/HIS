import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import {
  OpDiscountApprovalLevelTableHeader,
  ViewCreditNotePopupServiceTableHeader,
} from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import React, { useEffect, useState } from "react";
import { ApprovalDetails, ServiceTableItem } from "../types";

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
  const { loading, fetchApi } = useGlobalApi();
  const [canShowPopup, setCanShowPopup] = useState(false);
  const [approvalDetails, setApprovalDetails] = useState<ApprovalDetails | null>(null);
  const [serviceItemDetails, setServiceItemDetails] = useState<ServiceTableItem[]>([]);

  useScrollLock(isOpen);

  const getApprovalDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CREDIT_NOTE_REQUEST_APPROVAL_DETAILS,
      {},
      { params: { creditNoteId: Number(creditNoteId ?? 0) } },
      { component: "CreditNoteViewDetailsPopup" }
    );
    setCanShowPopup(true);
    setApprovalDetails(resp?.data?.[0]);
  };

  const getServiceItemTable = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CREDIT_NOTE_REQUEST_DETAILS_BY_CREDIT_NOTE_ID,
      {},
      { params: { creditNoteId: Number(creditNoteId ?? 0) } },
      { component: "CreditNoteViewDetailsPopup" }
    );
    setServiceItemDetails(resp?.data ?? []);
  };

  useEffect(() => {
    if (creditNoteId && isOpen) {
      getApprovalDetails();
      getServiceItemTable();
    }
  }, [creditNoteId, isOpen]);

  const patientDetails = [
    { label: "Patient Name", value: approvalDetails?.PatientName },
    { label: "Token No", value: approvalDetails?.TokenNo },
    { label: "UHID", value: approvalDetails?.UHID },

    { label: "Visit Id", value: approvalDetails?.VisitId },
    {
      label: "Age/Gender",
      value: approvalDetails?.Age
        ? `${approvalDetails.Age} / ${approvalDetails?.Gender ?? ""}`
        : approvalDetails?.Gender,
    },
    { label: "Bill Id", value: approvalDetails?.BillId },
    { label: "Status", value: approvalDetails?.Status },
  ];

  const billingDetails = [
    { label: "Total Bill Amount", value: approvalDetails?.TotalBillAmount },
    { label: "Total Discount Amount on Bill", value: approvalDetails?.TotalDiscountAmountOnBill },
    { label: "Total Discount (%) on Bill", value: approvalDetails?.TotalDiscountPerOnBill },
    { label: "Total Paid Amount", value: approvalDetails?.TotalPaidAmount },
    { label: "Total Balance Amount", value: approvalDetails?.TotalBalanceAmount },
    { label: "Total Credit Note Amount", value: approvalDetails?.TotalCreditNoteAmount },

    { label: "Credit Note Approved Name", value: approvalDetails?.CreditNoteApprovedName },
    { label: "Credit Note Reason", value: approvalDetails?.CreditNoteReason },
    { label: "Credit Note Remark", value: approvalDetails?.CreditNoteRemark },
  ];

  const approvalLevels = [
    {
      level: "Level 1",
      approverNames: approvalDetails?.Level1ApproverNames,
      isApprove: approvalDetails?.IsLevel1Approve,
      approvedBy: approvalDetails?.Level1ApprovedByName,
      approvedOn: approvalDetails?.Level1ApproveOn,
    },
    {
      level: "Level 2",
      approverNames: approvalDetails?.Level2ApproverNames,
      isApprove: approvalDetails?.IsLevel2Approve,
      approvedBy: approvalDetails?.Level2ApprovedByName,
      approvedOn: approvalDetails?.Level2ApproveOn,
    },
    {
      level: "Level 3",
      approverNames: approvalDetails?.Level3ApproverNames,
      isApprove: approvalDetails?.IsLevel3Approve,
      approvedBy: approvalDetails?.Level3ApprovedByName,
      approvedOn: approvalDetails?.Level3ApproveOn,
    },
    {
      level: "Level 4",
      approverNames: approvalDetails?.Level4ApproverNames,
      isApprove: approvalDetails?.IsLevel4Approve,
      approvedBy: approvalDetails?.Level4ApprovedByName,
      approvedOn: approvalDetails?.Level4ApproveOn,
    },
  ].filter(level => splitApproverNames(level.approverNames).length > 0);

  const showApprovalTable = true;

  if (!isOpen || !canShowPopup) return null;

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Credit Note Details"
      className="lg:min-w-250"
    >
      <>
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
                <span className="truncate">{formatValue(approvalDetails?.ApprovalLevel)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">All Approval Reqired :</span>
                <span className="truncate">
                  {formatValue(approvalDetails?.IsAllApprovalRequired === 1 ? "Yes" : "No")}
                </span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Flow :</span>
                <span className="truncate">{formatValue(approvalDetails?.ApprovalFlow)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approved Discount (%) :</span>
                <span className="truncate">
                  {formatValue(approvalDetails?.ApprovedPercentage ?? 0)}
                </span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Remarks :</span>
                <span className="truncate">{formatValue(approvalDetails?.ApprovalRemarks)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Status :</span>
                <span className="truncate">
                  {formatValue(approvalDetails?.IsDiscountApproved === 1 ? "Yes" : "No")}
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
        {/* service table */}
        {showApprovalTable && (
          <div className="table-container">
            <div className="table-scroll-wrapper">
              <div className="table-size">
                <table className="base-table w-full">
                  <thead className="table-head">
                    <tr>
                      {ViewCreditNotePopupServiceTableHeader.map((h: string, index: number) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {serviceItemDetails.length === 0 && (
                      <tr>
                        <td
                          colSpan={ViewCreditNotePopupServiceTableHeader.length}
                          className="table-empty"
                        >
                          No data found
                        </td>
                      </tr>
                    )}

                    {serviceItemDetails.map((level, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">
                          <ApproverNamesCell value={level?.ServiceName} />
                        </td>
                        <td className="table-td">{formatValue(level?.Rate)}</td>
                        <td className="table-td">{formatValue(level?.Qty)}</td>
                        <td className="table-td">{formatValue(level?.DiscAmt)}</td>
                        <td className="table-td">{formatValue(level?.NetAmt)}</td>
                        <td className="table-td">{formatValue(level?.CreditNoteAmt)}</td>
                        <td className="table-td">{formatValue(level?.CreditNotePer) + " %"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!!loading && <CustomLoader isLoading={loading} />}
      </>
    </CentralPopup>
  );
};

export default React.memo(CreditNoteViewDetailsPopup);
