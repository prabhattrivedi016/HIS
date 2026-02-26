import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { proNamePopupSchema } from "@/validation/referDoctorMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { ProNamePopUpProps } from "../types";
type ReferDoctorFormItem = InferType<typeof proNamePopupSchema>;

const ProNamePopUp = ({ isOpen, onClose, proId, refreshProName }: ProNamePopUpProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const buttonTitle = useMemo(() => (proId ? "Update" : "Create"), [proId]);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(proNamePopupSchema),
    defaultValues: {
      proId: 0,
      proName: "",
      contactNo: "",
      isActive: 1,
    },
  });
  useScrollLock(isOpen);

  /*----------------------pro name for edit------------------ */
  const getProName = useCallback(
    async (proId: number | null | undefined) => {
      if (!proId) return;
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PRO_LIST,
        {},
        { params: { proId } },
        { component: "ProNamePopup" }
      );
      const proName = resp?.data?.[0];

      reset({
        proId: proName?.proId || 0,
        proName: proName?.name || "",
        contactNo: proName?.contactNo || "",
        isActive: proName?.isActive || 1,
      });
    },
    [reset]
  );

  useEffect(() => {
    getProName(proId);
  }, [proId]);

  /*-------------------submit handler-------------------- */
  const onsubmit = async (formData: ReferDoctorFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_PRO_MASTER,
      formData,
      {},
      { component: "ProNamePopup" }
    );
    if (!resp) return;
    if (resp?.result) {
      setSuccessMessage(resp?.message || "Saved successfully");
      await refreshProName?.();
      timerRef.current = setTimeout(() => {
        onClose?.();
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div className={`central-popup ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">{buttonTitle} Pro Name</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error?.message} />}

        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-1">
            <InputField label=" PRO Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter pro name"
                {...register("proName")}
              />
              {errors.proName && <p className="input-field-error">{errors.proName.message}</p>}
            </InputField>

            <InputField label="Contact No" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("contactNo")}
              />
              {errors.contactNo && <p className="input-field-error">{errors.contactNo.message}</p>}
            </InputField>

            <InputField label="Status" required>
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
    </div>,
    document.body
  );
};

export default memo(ProNamePopUp);
