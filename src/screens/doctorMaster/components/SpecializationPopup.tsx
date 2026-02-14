import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { doctorSpecializationSchema } from "@/validation/doctorMasterPopup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SpecializationPopupProps } from "../types";

const SpecializationPopup = ({
  isOpen,
  onClose,
  specializationId,
  refreshSpec,
}: SpecializationPopupProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [successMessage, setSuccessMessage] = useState<string>("");

  const buttonTitle = specializationId ? "Update" : "Create";

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(doctorSpecializationSchema),
    defaultValues: {
      specializationId: 0,
      specialization: "",
      isActive: 1,
    },
  });

  useScrollLock(isOpen);

  const getSpecializationById = async (specializationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_SPECIALIZATION_LIST,
      {},
      { params: { specializationId, isActive: Status?.ACTIVE } },
      { component: "SpecializationPopup" }
    );
    const spec = resp?.data?.[0];
    if (!spec) return;

    reset({
      specializationId: spec?.specializationId || 0,
      specialization: spec?.specialization || "",
      isActive: spec?.isActive || 1,
    });
  };

  useEffect(() => {
    if (specializationId) {
      getSpecializationById(specializationId);
    }
  }, [specializationId]);

  const onSubmit = async (data: any) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_SPECIALIZATION,
      data,
      {},
      { component: "SpecializationPopup" }
    );
    await refreshSpec?.();
    if (resp?.result) {
      setSuccessMessage(resp?.message);
      setTimeout(() => {
        onClose?.();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`popup-bg-overlay ${isOpen ? "opacity-100 visible" : ""}`} />

      <div className={`central-popup ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">{`${buttonTitle} Specialization`}</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error?.message} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-1">
            <InputField label="Specialization" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter specialization "
                {...register("specialization")}
              />
              {errors.specialization && (
                <p className="input-field-error">{errors.specialization.message}</p>
              )}
            </InputField>

            <InputField label="Status" className="mt-3" required>
              <select className="input-field  " {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </>
  );
};

export default SpecializationPopup;
