import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showWarning } from "@/utils/alert";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OPDiscountItem } from "../types";

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const ApproveCancelPopup = ({
  isOpen,
  onClose,
  onSuccess,
  popupType,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  popupType: string;
  item: OPDiscountItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [cancelFormData, setCancelFormData] = useState({
    bookingId: 0,
    cancelReason: "",
  });

  const [approveFormData, setApproveFormData] = useState({
    bookingId: 0,
    flag: 0,
    approvedPer: "",
    approvalRemarks: "",
  });

  const [cancelError, setCancelError] = useState("");
  const [approveError, setApproveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const requestedDiscountPer = Number(item?.TotalDiscountPerOnBill ?? 0);

  useEffect(() => {
    if (!isOpen || !item) return;

    setCancelFormData({
      bookingId: Number(item.BookingId ?? 0),
      cancelReason: "",
    });

    if (!item?.TotalApprovedDiscountPerOnBill) {
      setApproveFormData({
        bookingId: Number(item.BookingId ?? 0),
        flag: item?.FlagId ?? 0,
        approvedPer: String(item?.TotalDiscountPerOnBill ?? 0),
        approvalRemarks: item?.ApprovalRemarks ?? "",
      });
    } else {
      setApproveFormData({
        bookingId: Number(item.BookingId ?? 0),
        flag: item?.FlagId ?? 0,
        approvedPer: String(item?.TotalApprovedDiscountPerOnBill ?? 0),
        approvalRemarks: item?.ApprovalRemarks ?? "",
      });
    }
    setCancelError("");
    setApproveError("");
    setSuccessMessage("");
    setErrorMessage("");
  }, [isOpen, item]);

  const cancelChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setCancelFormData(prev => ({
      ...prev,
      cancelReason: e.target.value,
    }));
    setCancelError("");
    setErrorMessage("");
  };

  const approveChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let value = rawValue.replace(/[^0-9.]/g, "");
    const dotIndex = value.indexOf(".");
    if (dotIndex !== -1) {
      value = `${value.slice(0, dotIndex + 1)}${value.slice(dotIndex + 1).replace(/\./g, "")}`;
    }

    const numericValue = Number(value);
    const isValidNumber = value !== "" && value !== "." && Number.isFinite(numericValue);

    if (isValidNumber && requestedDiscountPer > 0 && numericValue > requestedDiscountPer) {
      showWarning(`Approved discount cannot exceed requested discount (${requestedDiscountPer}%)`);
      return;
    }

    setApproveFormData(prev => ({
      ...prev,
      approvedPer: String(value),
    }));
    setApproveError("");
    setErrorMessage("");
  };

  const approvalRemarksChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setApproveFormData(prev => ({
      ...prev,
      approvalRemarks: e.target.value,
    }));
  };

  const validateApproveForm = () => {
    if (!String(approveFormData.approvedPer ?? "").trim()) {
      setApproveError("Please enter approve percentage");
      return false;
    }

    if (
      !Number.isFinite(Number(approveFormData.approvedPer)) ||
      Number(approveFormData.approvedPer) <= 0
    ) {
      setApproveError("Please enter a valid approve percentage");
      return false;
    }

    setApproveError("");
    return true;
  };

  const validateCancelForm = () => {
    if (!String(cancelFormData.cancelReason ?? "").trim()) {
      setCancelError("Cancel reason is required");
      return false;
    }

    setCancelError("");
    return true;
  };

  const approveSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateApproveForm()) {
      return;
    }

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.APPROVE_OPD_BOOKING_DISCOUNT,
        {
          bookingId: Number(approveFormData.bookingId),
          flag: Number(approveFormData.flag),
          approvedPer: Number(approveFormData.approvedPer),
          approvalRemarks: String(approveFormData.approvalRemarks).trim(),
        },
        {},
        { component: "ApproveCancelPopup" }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed while approving discount");
        return;
      }

      setSuccessMessage(resp?.message ?? "Discount approved successfully");
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed while approving discount");
    }
  };

  const cancelSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateCancelForm()) {
      return;
    }

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.CANCEL_OPD_BOOKING,
        {
          bookingId: Number(cancelFormData.bookingId),
          cancelReason: String(cancelFormData.cancelReason).trim(),
        },
        {},
        { component: "ApproveCancelPopup" }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed while cancelling booking");
        return;
      }

      setSuccessMessage(resp?.message ?? "Booking cancelled successfully");
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed while cancelling booking");
    }
  };

  const renderComponent = () => {
    switch (popupType) {
      case "approve": {
        return (
          <form onSubmit={approveSubmitHandler}>
            <div className="form-grid-3 mt-1">
              <InputField label="Requested Discount Percentage">
                <input
                  type="text"
                  placeholder="Enter requested discount percentage"
                  onChange={approveChangeHandler}
                  className="disabled-input-field cursor-not-allowed max-w-60"
                  value={item?.TotalDiscountPerOnBill ?? 0}
                  disabled={true}
                />
              </InputField>
              <InputField label="Approve Percentage" required>
                <input
                  type="text"
                  placeholder="Enter approve percentage"
                  onChange={approveChangeHandler}
                  className="input-field"
                  value={approveFormData.approvedPer}
                />
                {!!approveError && <p className="input-field-error">{approveError}</p>}
              </InputField>

              <InputField label="Approval Remark">
                <input
                  type="text"
                  placeholder="Enter approval remark"
                  onChange={approvalRemarksChangeHandler}
                  className="input-field"
                  value={approveFormData.approvalRemarks}
                />
                {!!approveError && <p className="input-field-error">{approveError}</p>}
              </InputField>
            </div>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                Approve
              </button>
            </div>
          </form>
        );
      }
      case "cancel": {
        return (
          <form onSubmit={cancelSubmitHandler}>
            <div className="form-grid-2 mt-1">
              <InputField label="Cancel Reason" required>
                <input
                  type="text"
                  placeholder="Enter cancel reason"
                  className="input-field"
                  value={cancelFormData.cancelReason}
                  onChange={cancelChangeHandler}
                />
                {!!cancelError && <p className="input-field-error">{cancelError}</p>}
              </InputField>
            </div>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                Cancel
              </button>
            </div>
          </form>
        );
      }
      default:
        return null;
    }
  };

  useScrollLock(isOpen);

  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-200 ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">
            {popupType === "approve"
              ? "Approve Discount"
              : popupType === "cancel"
                ? "Cancel Discount"
                : ""}
          </h2>

          <button type="button" onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 mb-2">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Patient Name:</span>
            <span className="truncate">{formatValue(item?.PatientName)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Token No:</span>
            <span className="truncate">{formatValue(item?.TokenNo)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">UHID:</span>
            <span className="truncate">{formatValue(item?.UHID)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Age / Gender:</span>
            <span className="truncate">{formatValue(item?.Age + "/" + item?.Gender)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Discount Approved By:</span>
            <span className="truncate">{formatValue(item?.DiscountApprovedName)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Discount Reason:</span>
            <span className="truncate">{formatValue(item?.DiscountReason)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Remark:</span>
            <span className="truncate">{formatValue(item?.Remark)}</span>
          </div>
        </div>

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 -mt-1">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Corporate Name:</span>
            <span className="truncate">{formatValue(item?.CorporateName)}</span>
          </div>

          <div className="flex flex-row gap-1 ">
            <span className="name-header whitespace-nowrap">Total Bill Amount:</span>
            <span className="truncate">{formatValue(item?.TotalBillAmount)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Discount Amount:</span>
            <span className="truncate">{formatValue(item?.TotalDiscountAmountOnBill)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Patient Payable Amount:</span>
            <span className="truncate">{formatValue(item?.TotalPatientPayableAmount)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Discount Percentage:</span>
            <span className="truncate">{formatValue(item?.TotalDiscountPerOnBill)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Status:</span>
            <span className="truncate">{formatValue(item?.Status)}</span>
          </div>
        </div>

        {renderComponent()}
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(ApproveCancelPopup);
