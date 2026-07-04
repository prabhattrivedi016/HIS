import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OPDiscountItem } from "../types";

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
    flag: 4,
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
    setApproveFormData({
      bookingId: Number(item.BookingId ?? 0),
      flag: 4,
      approvedPer: "",
      approvalRemarks: "",
    });
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
    const value = e.target.value;

    if (value !== "" && Number(value) > 100) {
      showWarning("Discount must be less than or equal to 100%");
      return;
    }

    if (value !== "" && requestedDiscountPer > 0 && Number(value) > requestedDiscountPer) {
      showWarning(`Approved discount cannot exceed requested discount (${requestedDiscountPer}%)`);
      return;
    }

    setApproveFormData(prev => ({
      ...prev,
      approvedPer: value,
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
    const approvedPer = Number(approveFormData.approvedPer);

    if (!String(approveFormData.approvedPer ?? "").trim()) {
      setApproveError("Please enter approve percentage");
      return false;
    }

    if (!Number.isFinite(approvedPer) || approvedPer <= 0) {
      setApproveError("Please enter a valid approve percentage");
      return false;
    }

    if (approvedPer > 100) {
      setApproveError("Discount must be less than or equal to 100%");
      return false;
    }

    if (requestedDiscountPer > 0 && approvedPer > requestedDiscountPer) {
      setApproveError(
        `Approved discount cannot exceed requested discount (${requestedDiscountPer}%)`
      );
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
            <InputField label="Approve Percentage" required>
              <input
                type="text"
                placeholder="Enter approve percentage"
                onChange={approveChangeHandler}
                className="input-field"
                value={approveFormData.approvedPer}
                onInput={allowOnlyNumbers}
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
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${
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

        {renderComponent()}
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(ApproveCancelPopup);
