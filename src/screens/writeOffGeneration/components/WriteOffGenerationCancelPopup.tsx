import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { WriteOffGenerationDetails, WriteOffGenerationItem } from "../types";

const WriteOffGenerationCancelPopup = ({
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
  item: WriteOffGenerationItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [writeOffDetails, setWriteOffDetails] = useState<WriteOffGenerationDetails | null>(null);

  // get details by Id
  const getWriteOffDetailsById = async (writeOffId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_WRITE_OFF_REQUEST_DETAILS_BY_WRITE_OFF_ID,
      {},
      { params: { writeOffId } },
      { component: "WriteOffGenerationCancelPopup" }
    );
    setWriteOffDetails(resp?.data?.[0]);
  };

  useEffect(() => {
    if (item && item.WriteOffId) {
      getWriteOffDetailsById(item.WriteOffId);
    }
  }, [item]);

  const [cancelFormData, setCancelFormData] = useState({
    writeOffId: 0,
    cancelReason: "",
  });

  const [cancelError, setCancelError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen || !item) return;

    const recordId = Number(item.WriteOffId ?? 0);

    setCancelFormData({
      writeOffId: recordId,
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

  const isCancelled = Number(item?.IsCancel) === 1 || Number(writeOffDetails?.IsCancel) === 1;

  const isCancelDisabled = isCancelled;

  const cancelSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCancelDisabled) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateCancelForm()) {
      return;
    }

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.CANCEL_WRITE_OFF_REQUEST,
        {
          writeOffId: Number(cancelFormData.writeOffId),
          cancelReason: String(cancelFormData.cancelReason).trim(),
        },
        {},
        { component: "WriteOffGenerationCancelPopup" }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed while cancelling write off");
        return;
      }

      setSuccessMessage(resp?.message ?? "Write off cancelled successfully");
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed while cancelling write off");
    }
  };

  const renderComponent = () => {
    switch (popupType) {
      case "cancel": {
        return (
          <form onSubmit={cancelSubmitHandler}>
            <div className="form-grid-1 mt-1">
              <InputField label="Cancel Reason" required>
                <input
                  type="text"
                  placeholder="Enter cancel reason"
                  className="input-field"
                  value={cancelFormData.cancelReason}
                  onChange={cancelChangeHandler}
                  disabled={isCancelDisabled}
                />
                {!!cancelError && <p className="input-field-error">{cancelError}</p>}
              </InputField>
            </div>
            <div className="form-actions-responsive mt-5">
              <button
                type="submit"
                className="save-btn disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCancelDisabled}
              >
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

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title={popupType === "cancel" ? "Cancel Write Off" : ""}
      className="w-[95vw] lg:min-w-100"
    >
      <>
        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 mb-2">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Patient Name:</span>
            <span className="truncate">{item?.PatientName}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Token No:</span>
            <span className="truncate">{item?.TokenNo}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">UHID:</span>
            <span className="truncate">{item?.UHID}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Age / Gender:</span>
            <span className="truncate">{item?.Age + "/" + item?.Gender}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Write Off Approved Name:</span>
            <span className="truncate">{writeOffDetails?.WriteOffApprovedName}</span>
          </div>{" "}
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Write Off Reason:</span>
            <span className="truncate">{writeOffDetails?.WriteOffReason}</span>
          </div>{" "}
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Write Off Remark:</span>
            <span className="truncate">{writeOffDetails?.WriteOffRemark}</span>
          </div>
        </div>

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 -mt-1">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">ServiceName:</span>
            <span className="truncate">{writeOffDetails?.ServiceName}</span>
          </div>

          <div className="flex flex-row gap-1 ">
            <span className="name-header whitespace-nowrap">Total Bill Amount:</span>
            <span className="truncate">{writeOffDetails?.TotalBillAmount}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Discount Amount:</span>
            <span className="truncate">{writeOffDetails?.TotalDiscountAmountOnBill}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Paid Amount:</span>
            <span className="truncate">{writeOffDetails?.TotalPaidAmount}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Balance Amount</span>
            <span className="truncate">{writeOffDetails?.TotalBalanceAmount}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Write Off Amount</span>
            <span className="truncate">{writeOffDetails?.TotalWriteOffAmount}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Status:</span>
            <span className="truncate">{item?.Status}</span>
          </div>
        </div>

        {renderComponent()}

        {/* loading */}
        {loading && <CustomLoader isLoading={loading} />}
      </>
    </CentralPopup>
  );
};

export default React.memo(WriteOffGenerationCancelPopup);
