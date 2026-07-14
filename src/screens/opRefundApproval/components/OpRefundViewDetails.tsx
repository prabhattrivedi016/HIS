import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { OpDiscountApprovalLevelTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import React, { useEffect, useState } from "react";
import { OpRefundApprovalCancelItem } from "../types";

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

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

type OpRefundViewDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  item: { RefundId: number } | null;
};

const OpRefundViewDetails = ({ isOpen, onClose, item }: OpRefundViewDetailsProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [detail, setDetail] = useState<OpRefundApprovalCancelItem | null>(null);

  useEffect(() => {
    if (!isOpen || !item?.RefundId) return;

    let isActive = true;

    const getRefundDetails = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_OPD_REFUND_REQUEST_APPROVAL_DETAILS,
        {},
        { params: { refundId: Number(item.RefundId) } },
        { component: "OpRefundViewDetails" }
      );

      if (isActive) {
        setDetail((resp?.data?.[0] ?? resp?.data ?? null) as OpRefundApprovalCancelItem | null);
      }
    };

    void getRefundDetails();

    return () => {
      isActive = false;
    };
  }, [isOpen, item?.RefundId]);

  useEffect(() => {
    if (!isOpen) {
      setDetail(null);
    }
  }, [isOpen]);

  const patientDetails = [
    { label: "Token No", value: detail?.TokenNo },
    { label: "UHID", value: detail?.UHID },
    { label: "Patient Name", value: detail?.PatientName },
    { label: "Age/Gender", value: `${detail?.Age ?? ""} / ${detail?.Gender ?? ""}` },
    { label: "Status", value: detail?.Status },
  ];

  const refundDetails = [
    { label: "Total Bill Amount", value: detail?.TotalBillAmount },
    { label: "Bill Discount (%)", value: detail?.TotalDiscountPerOnBill },
    { label: "Total Discount Amount", value: detail?.TotalDiscountAmountOnBill },
    { label: "Total Refund Amount", value: detail?.TotalRefundAmount },
    { label: "Refund Approved Name", value: detail?.RefundApprovedName },
    { label: "Refund Reason", value: detail?.RefundReason },
    { label: "Remark", value: detail?.RefundRemark },
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

  const showApprovalTable = approvalLevels.length > 0 || Boolean(detail?.ApprovalLevel);

  return (
    <>
      <CentralPopup
        isOpen={isOpen}
        onClose={onClose}
        title="OP Refund Request Details"
        className=" lg:min-w-250  overflow-auto"
      >
        <div className="card w-full mb-1">
          <h3 className="card-header text-lg font-semibold italic">Patient Details</h3>
          <div className="form-grid-3 ">
            {patientDetails.map(patientDetail => (
              <div key={patientDetail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{patientDetail.label} :</span>
                <span className="truncate">{formatValue(patientDetail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card w-full mb-1">
          <h3 className="card-header text-lg font-semibold italic">Refund Details</h3>
          <div className="form-grid-3 ">
            {refundDetails.map(refundDetail => (
              <div key={refundDetail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{refundDetail.label} :</span>
                <span className="truncate">{formatValue(refundDetail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {showApprovalTable && (
          <div className="card w-full mb-1">
            <h3 className="card-header text-lg font-semibold italic">Approval Details</h3>
            <div className="form-grid-3  mb-1">
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Level :</span>
                <span className="truncate">{formatValue(detail?.ApprovalLevel)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">All Approval Required :</span>
                <span className="truncate">
                  {formatValue(detail?.IsAllApprovalRequired === 1 ? "Yes" : "No")}
                </span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Flow :</span>
                <span className="truncate">{formatValue(detail?.ApprovalFlow)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Approval Remarks :</span>
                <span className="truncate">{formatValue(detail?.ApprovalRemarks)}</span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">Refund Approved :</span>
                <span className="truncate">
                  {formatValue(detail?.IsRefundApproved === 1 ? "Yes" : "No")}
                </span>
              </div>
            </div>

            <div className="table-container">
              <div className="table-scroll-wrapper">
                <div className="table-size">
                  <table className="base-table w-full">
                    <thead className="table-head">
                      <tr>
                        {OpDiscountApprovalLevelTableHeader.map((header, index) => (
                          <th key={index} className="table-th">
                            {header}
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
      </CentralPopup>

      {!!loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default React.memo(OpRefundViewDetails);
