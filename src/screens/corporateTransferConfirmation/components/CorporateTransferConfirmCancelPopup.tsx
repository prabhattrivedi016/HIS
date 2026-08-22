import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import PopupCardDetails from "@/components/SingledrawerAndPopup/components/PopupCardDetails";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { CorporateTransferConfirmationItem } from "../types";

const CorporateTransferConfirmCancelPopup = ({
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
  item: CorporateTransferConfirmationItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [cancelReason, setCancelReason] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen || !item) return;
    setCancelReason("");
    setFieldError("");
    setSuccessMessage("");
    setErrorMessage("");
  }, [isOpen, item]);

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setCancelReason(e.target.value);
    setFieldError("");
    setErrorMessage("");
  };

  const validateForm = () => {
    if (popupType === "cancel" && !cancelReason.trim()) {
      setFieldError("Cancel reason is required");
      return false;
    }
    return true;
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        corporateTransferId: item?.CorporateTransferId,
        cancelReason: cancelReason.trim(),
      };

      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.CANCEL_CORPORATE_TRANSFER_REQUEST,
        payload,
        {},
        { component: "CorporateTransferConfirmCancelPopup" }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? `Failed to ${popupType} corporate transfer`);
        return;
      }

      setSuccessMessage(resp?.message ?? `Corporate transfer cancelled successfully`);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage(`Failed to cancel corporate transfer`);
    }
  };

  useScrollLock(isOpen);

  if (!item) return null;

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title={"Cancel Corporate Transfer"}
      className="w-[50vw] lg:min-w-200"
    >
      <>
        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 mb-1">
          <PopupCardDetails label="Patient Name" value={item?.PatientName || ""} />
          <PopupCardDetails label="Token No" value={item?.TokenNo || ""} />
          <PopupCardDetails label="UHID" value={item?.UHID || ""} />
          <PopupCardDetails label="Age / Gender" value={item?.Age + " / " + item?.Gender} />

          <PopupCardDetails label="Status" value={item?.Status || ""} />
        </div>

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 ">
          <PopupCardDetails label="Insurance" value={item?.InsuranceCompanyName || ""} />
          <PopupCardDetails label="Corporate" value={item?.CorporateName || ""} />
          <PopupCardDetails label="Card No" value={item?.CardNo || "-"} />
          <PopupCardDetails label="Status" value={item?.Status || ""} />
          <PopupCardDetails label="Change From Date" value={item?.ChangeFromDate || ""} />
          <PopupCardDetails label="Change To Date" value={item?.ChangeToDate || ""} />
          <PopupCardDetails label="Transfer Date" value={item?.TransferDate || ""} />
          <PopupCardDetails label="Relation" value={item?.Relation || ""} />
          <PopupCardDetails label="Relative Name" value={item?.RelativeName || ""} />
          <PopupCardDetails label="Is Change Tariff" value={item?.IsChangeTariff ? "Yes" : "No"} />
          <PopupCardDetails label="Authorization Number" value={item?.AuthorizationNumber || ""} />

          <PopupCardDetails label="Remarks" value={item?.Remarks || ""} className="col-span-2" />
        </div>
        <form onSubmit={submitHandler}>
          <div className="form-grid-2 mt-1">
            {popupType === "cancel" ? (
              <InputField label="Cancel Reason" required>
                <input
                  type="text"
                  placeholder="Enter cancel reason"
                  className="input-field"
                  value={cancelReason}
                  onChange={changeHandler}
                />
                {!!fieldError && <p className="input-field-error">{fieldError}</p>}
              </InputField>
            ) : (
              <InputField label="Approval Remarks">
                <input
                  type="text"
                  placeholder="Enter approval remarks (optional)"
                  className="input-field"
                  value={cancelReason}
                  onChange={changeHandler}
                />
                {!!fieldError && <p className="input-field-error">{fieldError}</p>}
              </InputField>
            )}
          </div>
          <div className="form-actions-responsive mt-1">
            <SubmitButton label="Cancel" />
          </div>
        </form>

        {loading && <CustomLoader isLoading={loading} />}
      </>
    </CentralPopup>
  );
};

export default React.memo(CorporateTransferConfirmCancelPopup);
