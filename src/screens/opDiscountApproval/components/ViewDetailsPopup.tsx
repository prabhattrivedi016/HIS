import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { OpDiscountApprovalLevelTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OPDiscountApprovalDetail } from "../types";

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

const ViewDetailsPopup = ({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: { BookingId: number; IsDiscountApprovalRequired?: number } | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [detail, setDetail] = useState<OPDiscountApprovalDetail | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || !item?.BookingId) return;

    let isActive = true;

    const getApprovalDetails = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_OPD_BOOKING_APPROVAL_DETAILS,
        {},
        { params: { bookingId: Number(item.BookingId) } },
        { component: "ViewDetailsPopup" }
      );

      if (isActive) {
        setDetail(resp?.data?.[0] ?? null);
      }
    };

    void getApprovalDetails();

    return () => {
      isActive = false;
    };
  }, [isOpen, item?.BookingId]);

  useEffect(() => {
    if (!isOpen) {
      setDetail(null);
    }
  }, [isOpen]);

  const patientDetails = [
    { label: "Token No", value: detail?.TokenNo },
    { label: "UHID", value: detail?.UHID },
    { label: "Patient Name", value: detail?.PatientName },
    { label: "Age/Gender", value: detail?.AgeGender },

    { label: "Corporate", value: detail?.CorporateName },
    { label: "Status", value: detail?.Status },
    // { label: "Approval Flow", value: detail?.ApprovalFlow },
  ];

  const billingDetails = [
    { label: "Total Bill Amount", value: detail?.TotalBillAmount },
    { label: "Bill Discount (%)", value: detail?.BillDiscountPercentage },
    { label: "Total Discount Amount", value: detail?.TotalDiscountAmountOnBill },
    { label: "Total Payable Amount", value: detail?.TotalPatientPayableAmount },

    // { label: "Approved Discount (%)", value: detail?.ApprovedPercentage },
    // { label: "Approval Level", value: detail?.ApprovalLevel },
    // { label: "Approval Remarks", value: detail?.ApprovalRemarks },
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

  const showApprovalTable =
    Number(detail?.IsDiscountApprovalRequired ?? item?.IsDiscountApprovalRequired) === 1;

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
          <h2 className="popup-helper-text truncate">Patient Booking Discount Details</h2>

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

        {/* billing / discount details table */}
        {/* <div className="table-container mb-1">
          <div className="table-scroll-wrapper">
            <div className="table-size">
              <table className="base-table w-full">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Description</th>
                    <th className="table-th">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {billingDetails.map(billingDetail => (
                    <tr key={billingDetail.label} className="table-row">
                      <td className="table-td">{billingDetail.label}</td>
                      <td className="table-td">{formatValue(billingDetail.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div> */}

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
        )}
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(ViewDetailsPopup);
