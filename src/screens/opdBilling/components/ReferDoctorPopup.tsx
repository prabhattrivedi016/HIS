import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useScrollLock } from "@/hooks/useScrollLock";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  opdMasterReferDoctorFormItem,
  opdMasterReferDoctorSchema,
} from "@/validation/opdBillingSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { ReferDoctorPopupProps } from "../types";

const ReferDoctorPopup = ({ isOpen, onClose, data, refreshDoctor }: ReferDoctorPopupProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const title = usePickMaster("title");
  const titleList = title?.pickMasterValue ?? [];
  const autoDoctorTitle = useMemo(() => {
    const matched = titleList?.find(t => t?.value === "Dr.");
    return matched?.value ?? "Dr.";
  }, [titleList]);

  const buttonTitle = data ? "Update" : "Create";

  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(opdMasterReferDoctorSchema),
    defaultValues: {
      referDoctorId: 0,
      title: "Dr.",
      name: "",
      doctorContacNo: "",
      clinicName: "",
      address: "",
      proId: 0,
      active: 1,
    },
  });

  useEffect(() => {
    setValue("title", "Dr.", { shouldDirty: false, shouldValidate: true });
  }, [autoDoctorTitle, setValue]);

  useEffect(() => {
    if (!isOpen) return;

    if (data?.value) {
      void getReferDoctor(Number(data.value));
      return;
    }

    reset({
      referDoctorId: 0,
      title: autoDoctorTitle,
      name: "",
      doctorContacNo: "",
      clinicName: "",
      address: "",
      proId: 0,
      active: 1,
    });
  }, [data, isOpen, reset]);

  const getReferDoctor = async (referDoctorId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_REFER_DOCTOR_LIST,
      {},
      { params: { referDoctorId } },
      { component: "ReferDoctorOfOpdBilling" }
    );

    reset({
      referDoctorId: resp?.data?.[0]?.referDoctorId ?? 0,
      title: "Dr.",
      name: resp?.data?.[0]?.name ?? "",
      doctorContacNo: resp?.data?.[0]?.contactNo ?? "",
      clinicName: resp?.data?.[0]?.clinicName ?? "",
      address: resp?.data?.[0]?.address ?? "",
      proId: resp?.data?.[0]?.proId ?? 0,
      active: resp?.data?.[0]?.isActive ?? 1,
    });
  };

  //   submit handler
  const onSubmit = async (formData: opdMasterReferDoctorFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_REFER_DOCTOR,
      formData,
      {},
      { component: "ReferDoctorOfOpdBilling" }
    );
    if (!resp?.result) {
      return;
    }
    setSuccessMessage(resp?.message);
    setTimeout(() => {
      onClose();
      setSuccessMessage("");
    }, 1000);
    await refreshDoctor?.();
  };

  const cancelHandler = () => {
    reset({
      referDoctorId: 0,
      title: "Dr.",
      name: "",
      doctorContacNo: "",
      clinicName: "",
      address: "",
      proId: 0,
      active: 1,
    });
    onClose();
  };

  useScrollLock(isOpen);

  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-180 ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">{buttonTitle} Refer Doctor</h2>
          <button type="button" onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {error ? <ErrorMessage text={error?.message} /> : <></>}
        {successMessage ? <SuccessMessage text={successMessage} /> : <></>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-2">
            <div className="flex flex-row gap-1">
              <InputField label="Title" className="w-1/3" required>
                <select className="input-field" {...register("title")}>
                  <option value="">select</option>

                  {titleList.map(t => (
                    <option key={t?.value} value={t?.value}>
                      {t?.value}
                    </option>
                  ))}
                </select>
                {errors.title && <p className="input-field-error">{errors.title.message}</p>}
              </InputField>

              <InputField label="DoctorName" className="w-2/3" required>
                <input
                  type="text"
                  className="input-field"
                  {...register("name")}
                  placeholder="Enter doctor name"
                />
                {errors.name && <p className="input-field-error">{errors.name.message}</p>}
              </InputField>
            </div>

            <InputField label="Contact Number" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number"
                onInput={allowOnlyNumbers}
                maxLength={10}
                {...register("doctorContacNo")}
              />
              {errors.doctorContacNo && (
                <p className="input-field-error">{errors.doctorContacNo.message}</p>
              )}
            </InputField>

            <InputField label="Clinic Name">
              <input
                type="text"
                className="input-field"
                {...register("clinicName")}
                placeholder="Enter clinic name"
              />
            </InputField>

            <InputField label="Address">
              <input
                type="text"
                className="input-field"
                {...register("address")}
                placeholder="Enter address"
              />
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>,
    document.body
  );
};

export default ReferDoctorPopup;
