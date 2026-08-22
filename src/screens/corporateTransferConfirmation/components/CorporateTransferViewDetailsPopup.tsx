import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import PopupCardDetails from "@/components/SingledrawerAndPopup/components/PopupCardDetails";
import { ENDPOINTS } from "@/config/defaults";
import { OpDiscountApprovalLevelTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import React, { useEffect, useState } from "react";
import { CorporateTransferConfirmationItem } from "../types";

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

const CorporateTransferViewDetailsPopup = ({
  isOpen,
  item,
  onClose,
}: {
  isOpen: boolean;
  item: CorporateTransferConfirmationItem | null;
  onClose: () => void;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [details, setDetails] = useState<any>(null);

  const getDetails = async () => {
    if (!item?.CorporateTransferId) return;
    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CORPORATE_TRANSFER_REQUEST_APPROVAL_DETAILS,
        {},
        { params: { corporateTransferId: item.CorporateTransferId } },
        { component: "CorporateTransferViewDetailsPopup" }
      );
      if (resp?.data?.[0]) {
        setDetails(resp.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen && item?.CorporateTransferId) {
      getDetails();
    }
  }, [isOpen, item]);

  if (!item) return null;

  const activeItem = details || item;

  const approvalLevelLimit = (() => {
    const rawLevel = activeItem?.ApprovalLevelId ?? activeItem?.ApprovalLevel;
    if (!rawLevel) return 4;
    if (typeof rawLevel === "number") return rawLevel;
    const match = String(rawLevel).match(/\d+/);
    return match ? Number(match[0]) : 4;
  })();

  const approvalLevels = [
    {
      level: "Level 1",
      levelNum: 1,
      approverNames: activeItem.Level1ApproverNames,
      approved: activeItem.IsLevel1Approve,
      approvedBy: activeItem.Level1ApprovedByName || activeItem.Level1ApproveId,
      approvedOn: activeItem.Level1ApproveOn,
    },
    {
      level: "Level 2",
      levelNum: 2,
      approverNames: activeItem.Level2ApproverNames,
      approved: activeItem.IsLevel2Approve,
      approvedBy: activeItem.Level2ApprovedByName || activeItem.Level2ApproveId,
      approvedOn: activeItem.Level2ApproveOn,
    },
    {
      level: "Level 3",
      levelNum: 3,
      approverNames: activeItem.Level3ApproverNames,
      approved: activeItem.IsLevel3Approve,
      approvedBy: activeItem.Level3ApprovedByName || activeItem.Level3ApproveId,
      approvedOn: activeItem.Level3ApproveOn,
    },
    {
      level: "Level 4",
      levelNum: 4,
      approverNames: activeItem.Level4ApproverNames,
      approved: activeItem.IsLevel4Approve,
      approvedBy: activeItem.Level4ApprovedByName || activeItem.Level4ApproveId,
      approvedOn: activeItem.Level4ApproveOn,
    },
  ].filter(lvl => lvl.levelNum <= approvalLevelLimit);

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Corporate Transfer Details"
      className="w-[50vw] lg:min-w-200"
    >
      <div className="p-1">
        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 mb-1">
          <PopupCardDetails label="Patient Name" value={item.PatientName || ""} />
          <PopupCardDetails label="Token No" value={item.TokenNo || ""} />
          <PopupCardDetails label="UHID" value={item.UHID || ""} />
          <PopupCardDetails label="Age / Gender" value={item.Age + " / " + item.Gender} />
          <PopupCardDetails label="Status" value={item.Status || ""} />
          <PopupCardDetails label="Remarks" value={item?.Remarks || ""} />
        </div>

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 mb-1">
          <PopupCardDetails label="Insurance" value={item.InsuranceCompanyName || ""} />
          <PopupCardDetails label="Corporate" value={item.CorporateName || ""} />
          <PopupCardDetails label="Card No" value={item.CardNo || "-"} />
          <PopupCardDetails label="Status" value={item.Status || ""} />
          <PopupCardDetails label="Change From Date" value={item.ChangeFromDate || ""} />
          <PopupCardDetails label="Change To Date" value={item.ChangeToDate || ""} />
          <PopupCardDetails label="Transfer Date" value={item.TransferDate || ""} />
          <PopupCardDetails label="Relation" value={item.Relation || ""} />
          <PopupCardDetails label="Relative Name" value={item.RelativeName || ""} />
          <PopupCardDetails label="Is Change Tariff" value={item.IsChangeTariff ? "Yes" : "No"} />
          <PopupCardDetails label="Authorization Number" value={item.AuthorizationNumber || ""} />
        </div>

        {/* Approval Levels Table */}
        <div className=" w-full">
          {/* <h3 className="card-header text-lg font-semibold italic mb-2">Approval Details</h3> */}
          <div className="table-container">
            <div className="table-scroll-wrapper">
              <div className="table-size">
                <table className="base-table w-full">
                  <thead className="table-head">
                    <tr>
                      {OpDiscountApprovalLevelTableHeader.map((h: string, index: number) => (
                        <th key={index} className="table-th">
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
                          className="table-empty text-center py-4 text-gray-500 text-sm"
                        >
                          No approval levels found
                        </td>
                      </tr>
                    )}
                    {approvalLevels.map(lvl => (
                      <tr key={lvl.level} className="table-row">
                        <td className="table-td">{lvl.level}</td>
                        <td className="table-td">
                          <ApproverNamesCell value={lvl.approverNames} />
                        </td>
                        <td
                          className={`table-td ${
                            lvl.approved === 1
                              ? "active-text"
                              : lvl.approved === 0
                                ? "inactive-text"
                                : "text-gray-400"
                          }`}
                        >
                          {lvl.approved === 1 ? "Yes" : lvl.approved === 0 ? "No" : "Pending"}
                        </td>
                        <td className="table-td">{lvl.approvedBy || "-"}</td>
                        <td className="table-td">{lvl.approvedOn || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {!!loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default React.memo(CorporateTransferViewDetailsPopup);
