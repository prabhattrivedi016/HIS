import CentralPopup from "@/components/centralPopup";
import { OpdRefundMultipleBillTableHeader } from "@/constants/tableHeaders";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Dispatch, SetStateAction } from "react";
import { BillToRefundItem } from "../types";

const OpdRefundMultipleBillPopup = ({
  isOpen,
  onClose,
  multipleBillToRefund,
  setSelectedBillToRefund,
}: {
  isOpen: boolean;
  onClose: () => void;
  multipleBillToRefund: BillToRefundItem[];
  setSelectedBillToRefund: Dispatch<SetStateAction<BillToRefundItem | null>>;
}) => {
  const handleDoubleClick = (item: BillToRefundItem) => {
    if (!item) return;
    setSelectedBillToRefund(item);
    onClose();
  };

  useScrollLock(isOpen);
  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Select Bill to Refund"
      className="lg:min-w-220"
    >
      {/* table */}
      <div className="table-container">
        <div className="table-scroll-wrapper">
          <div className="table-size lg:min-h-40 w-full">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  {OpdRefundMultipleBillTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {multipleBillToRefund.length === 0 ? (
                  <tr>
                    <td colSpan={OpdRefundMultipleBillTableHeader.length} className="table-empty">
                      No records found
                    </td>
                  </tr>
                ) : (
                  multipleBillToRefund.map((item: BillToRefundItem, idx) => (
                    <tr
                      key={idx}
                      onDoubleClick={() => handleDoubleClick(item)}
                      className="cursor-pointer active:scale-98 transition-all duration-300"
                    >
                      <td className="table-td">{item.UHID}</td>
                      <td className="table-td">{item.PatientName}</td>
                      <td className="table-td">{item.BillNo}</td>
                      <td className="table-td">{item.BillDate}</td>
                      <td className="table-td">{item.TotalBillAmount}</td>
                      <td className="table-td">{item.TotalPaidAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CentralPopup>
  );
};

export default OpdRefundMultipleBillPopup;
