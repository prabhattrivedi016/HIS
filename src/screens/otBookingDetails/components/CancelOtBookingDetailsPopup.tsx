import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { formatBookingDate } from "@/utils/dateConvertHandler";
import React, { ChangeEvent, useEffect, useState } from "react";
import { OtBookingDetailsItem } from "../types";

export const CancelOtBookingDetailsPopup = ({
  isOpen,
  onClose,
  onSuccess,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  item: OtBookingDetailsItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const [cancelFormData, setCancelFormData] = useState({
    otBookingId: 0,
    cancelReason: "",
  });

  const [cancelError, setCancelError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen || !item) return;

    const otBookingId = Number(item?.OTBookingId ?? 0);

    setCancelFormData({
      otBookingId,
      cancelReason: "",
    });

    setCancelError("");
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

  const validateCancelForm = () => {
    if (!String(cancelFormData.cancelReason ?? "").trim()) {
      setCancelError("Cancel reason is required");
      return false;
    }

    setCancelError("");
    return true;
  };

  const isCancelled = Number(item?.IsCancel) === 1;
  const isCancelDisabled = isCancelled;

  const cancelSubmitHandler = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (isCancelDisabled) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateCancelForm()) {
      return;
    }

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.CANCEL_OT_BOOKING,
        {
          otBookingId: Number(cancelFormData?.otBookingId),
          cancelReason: String(cancelFormData.cancelReason).trim(),
        },
        {},
        { component: "CancelOtBookingDetailsPopup" }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed while cancelling ot booking");
        return;
      }

      setSuccessMessage(resp?.message ?? "Ot booking cancelled successfully");
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed while cancelling ot booking");
    }
  };

  useScrollLock(isOpen);

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title={"Cancel OT Booking"}
      className="min-w-180"
    >
      <>
        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 mb-2">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Patient Name:</span>
            <span className="truncate">{item?.PatientName || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Booking No:</span>
            <span className="truncate">{item?.OTBookingNo || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">UHID:</span>
            <span className="truncate">{item?.UHID || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Age / Gender:</span>
            <span className="truncate">
              {item ? `${item?.Age ?? "-"} / ${item?.Gender ?? "-"}` : "-"}
            </span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Contact Number:</span>
            <span className="truncate">{item?.ContactNumber || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">OT Type:</span>
            <span className="truncate">{item?.OTType || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Booking Date:</span>
            <span className="truncate">{formatBookingDate(item?.OTBookingDate)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">From Time:</span>
            <span className="truncate">{item?.OTBookingFromTime || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">To Time:</span>
            <span className="truncate">{item?.OTBookingToTime || "-"}</span>
          </div>
        </div>

        <form onSubmit={cancelSubmitHandler}>
          <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
            <InputField label="Cancel Reason" required>
              <input
                type="text"
                placeholder="Enter cancel reason"
                className="input-field w-full"
                value={cancelFormData.cancelReason}
                onChange={cancelChangeHandler}
                disabled={isCancelDisabled || loading}
              />
              {!!cancelError && <p className="input-field-error">{cancelError}</p>}
            </InputField>

            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="save-btn disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCancelDisabled || loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* loading */}
        {loading && <CustomLoader isLoading={loading} />}
      </>
    </CentralPopup>
  );
};

export default React.memo(CancelOtBookingDetailsPopup);
