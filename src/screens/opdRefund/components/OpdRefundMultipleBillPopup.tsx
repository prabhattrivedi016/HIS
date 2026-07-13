import { OpdRefundMultipleBillTableHeader } from "@/constants/tableHeaders";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
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
  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-200 ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">Select Bill to Refund</h2>
          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>
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
                    multipleBillToRefund.map((item, idx) => (
                      <tr
                        key={idx}
                        onDoubleClick={() => handleDoubleClick(item)}
                        className="cursor-pointer active:scale-98 transition-all duration-300"
                      >
                        <td className="table-td">{item.UHID}</td>
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
      </div>
    </div>,
    document.body
  );
};

export default OpdRefundMultipleBillPopup;
