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
import { CorporateTransferApprovalItem } from "../types";

const CorporateTransferApprovalConfirmCancelPopup = ({
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
  item: CorporateTransferApprovalItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [remarkOrReason, setRemarkOrReason] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen || !item) return;
    setRemarkOrReason("");
    setFieldError("");
    setSuccessMessage("");
    setErrorMessage("");
  }, [isOpen, item]);

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setRemarkOrReason(e.target.value);
    setFieldError("");
    setErrorMessage("");
  };

  const validateForm = () => {
    if (popupType === "cancel" && !remarkOrReason.trim()) {
      setFieldError("Cancel reason is required");
      return false;
    }
    if (popupType === "approve" && !remarkOrReason.trim()) {
      setFieldError("Approval remarks are required");
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
      if (popupType === "cancel") {
        const payload = {
          corporateTransferId: item?.CorporateTransferId,
          cancelReason: remarkOrReason.trim(),
        };

        const resp = await fetchApi(
          "PATCH",
          ENDPOINTS.CANCEL_CORPORATE_TRANSFER_REQUEST,
          payload,
          {},
          { component: "CorporateTransferApprovalConfirmCancelPopup" }
        );

        if (!resp?.result) {
          setErrorMessage(resp?.message ?? "Failed to cancel corporate transfer");
          return;
        }

        setSuccessMessage(resp?.message ?? "Corporate transfer cancelled successfully");
      } else {
        const payload = {
          corporateTransferId: item?.CorporateTransferId,
          flag: item?.FlagId ?? 0,
          approvalRemarks: remarkOrReason.trim(),
        };

        const resp = await fetchApi(
          "PATCH",
          ENDPOINTS.APPROVE_CORPORATE_TRANSFER_REQUEST,
          payload,
          {},
          { component: "CorporateTransferApprovalConfirmCancelPopup" }
        );

        if (!resp?.result) {
          setErrorMessage(resp?.message ?? "Failed to approve corporate transfer");
          return;
        }

        setSuccessMessage(resp?.message ?? "Corporate transfer approved successfully");
      }

      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage(`Failed to ${popupType} corporate transfer`);
    }
  };

  useScrollLock(isOpen);

  if (!item) return null;

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title={popupType === "approve" ? "Approve Corporate Transfer" : "Cancel Corporate Transfer"}
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
          <PopupCardDetails label="Transfer Date" value={(item as any)?.TransferDate || ""} />
          <PopupCardDetails label="Relation" value={item?.Relation || ""} />
          <PopupCardDetails label="Relative Name" value={item?.RelativeName || ""} />
          <PopupCardDetails label="Is Change Tariff" value={item?.IsChangeTariff ? "Yes" : "No"} />
          <PopupCardDetails
            label="Authorization Number"
            value={(item as any)?.AuthorizationNumber || ""}
          />
          <PopupCardDetails
            label="Remarks"
            value={(item as any)?.Remarks || ""}
            className="col-span-2"
          />
        </div>
        <form onSubmit={submitHandler}>
          <div className="form-grid-2 mt-1">
            {popupType === "cancel" ? (
              <InputField label="Cancel Reason" required>
                <input
                  type="text"
                  placeholder="Enter cancel reason"
                  className="input-field"
                  value={remarkOrReason}
                  onChange={changeHandler}
                />
                {!!fieldError && <p className="input-field-error">{fieldError}</p>}
              </InputField>
            ) : (
              <InputField label="Approval Remarks" required>
                <input
                  type="text"
                  placeholder="Enter approval remarks"
                  className="input-field"
                  value={remarkOrReason}
                  onChange={changeHandler}
                />
                {!!fieldError && <p className="input-field-error">{fieldError}</p>}
              </InputField>
            )}
          </div>
          <div className="form-actions-responsive mt-1">
            <SubmitButton label={popupType === "approve" ? "Approve" : "Cancel"} />
          </div>
        </form>

        {loading && <CustomLoader isLoading={loading} />}
      </>
    </CentralPopup>
  );
};

export default React.memo(CorporateTransferApprovalConfirmCancelPopup);
