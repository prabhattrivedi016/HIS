import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { OpdAppointmentConfirmationItem } from "../types";

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex gap-2">
    <span className="font-semibold name-header whitespace-nowrap">{label}:</span>
    <span className="truncate">{value}</span>
  </div>
);

const OpdAppointmentCancelPopup = ({
  isOpen,
  onClose,
  onSuccess,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  item: OpdAppointmentConfirmationItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const [cancelFormData, setCancelFormData] = useState({
    id: 0,
    cancelReason: "",
  });

  const [cancelError, setCancelError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen || !item) return;

    setCancelFormData({
      id: Number(item.AppId ?? 0),
      cancelReason: "",
    });

    setCancelError("");
    setSuccessMessage("");
    setErrorMessage("");
  }, [isOpen, item]);

  useScrollLock(isOpen);

  const cancelChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setCancelFormData(prev => ({
      ...prev,
      cancelReason: e.target.value,
    }));

    setCancelError("");
    setErrorMessage("");
  };

  const validateCancelForm = () => {
    if (!cancelFormData.cancelReason.trim()) {
      setCancelError("Cancel reason is required");
      return false;
    }

    setCancelError("");
    return true;
  };

  const cancelSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!validateCancelForm()) return;

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.CANCEL_DOCTOR_APPOINTMENT_PRE_BOOKING,
        {},
        {
          params: {
            id: Number(cancelFormData.id),
            cancelReason: cancelFormData.cancelReason.trim(),
          },
        },
        {
          component: "OpdAppointmentCancelPopup",
        }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed while cancelling appointment");
        return;
      }

      setSuccessMessage(resp?.message ?? "Appointment cancelled successfully");

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed while cancelling appointment");
    }
  };

  if (!isOpen) return null;

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Appointment"
      className="lg:min-w-[700px]"
    >
      <>
        {!!successMessage && <SuccessMessage text={successMessage} />}

        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        <div className=" grid grid-cols-1 md:grid-cols-2 gap-3 mb-1">
          <DetailRow label="Patient Name" value={formatValue(item?.PatientName)} />

          <DetailRow label="Token No" value={formatValue(item?.TokenNo)} />

          <DetailRow
            label="Age / Gender"
            value={item ? `${formatValue(item.Age)}/${formatValue(item.Gender)}` : "-"}
          />

          <DetailRow label="Doctor Name" value={formatValue(item?.DoctorName)} />

          <DetailRow label="Service Name" value={formatValue(item?.ServiceName)} />

          <DetailRow label="Appointment" value={formatValue(item?.AppDateTime)} />

          <DetailRow label="Amount" value={formatValue(item?.Amount)} />

          <DetailRow label="Status" value={formatValue(item?.STATUS)} />
        </div>

        <form onSubmit={cancelSubmitHandler}>
          <div className="form-grid-2">
            <InputField label="Cancel Reason" required>
              <input
                type="text"
                placeholder="Enter cancel reason"
                className="input-field "
                value={cancelFormData.cancelReason}
                onChange={cancelChangeHandler}
              />

              {!!cancelError && <p className="input-field-error">{cancelError}</p>}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <SubmitButton label="Cancel" type="submit" />
          </div>
        </form>

        {!!loading && <CustomLoader isLoading={loading} />}
      </>
    </CentralPopup>
  );
};

export default React.memo(OpdAppointmentCancelPopup);
