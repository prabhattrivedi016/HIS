import { ENDPOINTS } from "@/config/defaults";
import { useScrollLock } from "@/hooks/useScrollLock";
import { sequenceMappingDrawerSchema } from "@/validation/printSettingSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { SequenceDrawerProps } from "../types";

const SequenceDrawer = ({
  isOpen,
  data,
  onClose,
  handleRefresh,
  resetType,
  resetSequence,
}: SequenceDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(sequenceMappingDrawerSchema),
    defaultValues: {
      sequenceId: 0,
      name: "",
      typeId: 0,
      typeName: "",
      prefix: "",
      firstSeprator: "",
      fyFormatId: 0,
      fyFormat: "",
      secondSeprator: "",
      length: 6,
      preview: "",
    },
  });

  const prefix = watch("prefix");
  const firstSeprator = watch("firstSeprator");
  const length = watch("length");
  const year = watch("fyFormatId");

  const isEdit = Boolean(data?.sequenceId);
  const buttonTitle = isEdit ? "Update" : "Create";

  const [preview, setPreview] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useScrollLock(isOpen);

  /* ---------- fill form when editing ---------- */
  useEffect(() => {
    if (!data) return;

    reset({
      sequenceId: data.sequenceId ?? 0,
      name: data.name ?? "",
      typeId: data.typeId ?? 0,
      typeName: data.typeName ?? "",
      prefix: data.prefix ?? "",
      firstSeprator: data.firstSeprator ?? "",
      fyFormatId: data.fyFormatId ?? 0,
      fyFormat: data.fyFormat ?? "",
      secondSeprator: data.secondSeprator ?? "",
      length: data.length ?? 6,
      preview: data.preview ?? "",
    });
  }, [data, reset]);

  // preview generator
  const name = watch("name");
  const secondSeprator = watch("secondSeprator");

  useEffect(() => {
    if (!prefix || !length) {
      setPreview("");
      return;
    }

    const numericPart = String(1).padStart(Number(length), "0");

    // ✅ year formatting
    const yearValue = year === 1 ? "25-26" : year === 2 ? "2026" : "";

    // ✅ add "/" only if year exists
    const yearWithSeparator = yearValue ? `${yearValue}` : "";

    // ✅ build preview step by step
    const previewValue = [prefix, firstSeprator, yearWithSeparator, secondSeprator, numericPart]
      .filter(Boolean)
      .join("");

    setPreview(previewValue);
  }, [prefix, firstSeprator, secondSeprator, length, year]);

  /* ---------- submit ---------- */
  const onSubmit = async (formData: any) => {
    if (!formData?.typeId || !formData?.typeName) return;
    const payload = {
      ...formData,
      preview,
    };

    const resp = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_SEQUENCE_MASTER, payload);
    if (!resp) return;
    if (resp?.result) {
      await handleRefresh();
      setSuccessMessage(resp?.message ?? "Saved successfully");
      resetType?.();
      resetSequence?.();
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onClose();
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  /* ---------- cancel ---------- */
  const cancelHandler = () => {
    reset({
      sequenceId: 0,
      name: "",
      typeId: 0,
      typeName: "",
      prefix: "",
      firstSeprator: "",
      fyFormatId: 0,
      fyFormat: "",
      secondSeprator: "",
      length: 6,
      preview: "",
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-999">
      <div className="absolute inset-0">
        <div className="drawer-bg-fade opacity-100 visible" onClick={onClose} />

        <div className="drawer-layout drawer-bg translate-x-0">
          <div className="drawer-title-border">
            <h2 className="drawer-title">{buttonTitle} Sequence</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          {successMessage && <SuccessMessage text={successMessage} />}
          {error && <ErrorMessage text={error?.message} />}

          <div className="card m-1">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid-2">
                <InputField label="Name" required>
                  <input className="input-field" {...register("name")} />
                  {errors.name && <p className="input-field-error">{errors.name.message}</p>}
                </InputField>

                <InputField label="Preview">
                  <input value={preview} readOnly className="input-field" />
                </InputField>
              </div>
              <div className="lg:grid grid-cols-5 gap-2">
                <InputField label="Prefix">
                  <input className="input-field" {...register("prefix")} />
                </InputField>

                <InputField label="1st Separator">
                  <select className="input-field" {...register("firstSeprator")}>
                    <option value=""></option>
                    <option value="/">/</option>
                    <option value="-">-</option>
                  </select>
                </InputField>

                <InputField label="FY Format">
                  <select
                    className="input-field"
                    {...register("fyFormatId", { valueAsNumber: true })}
                  >
                    <option value={0}></option>
                    <option value={1}>25-26</option>
                    <option value={2}>2026</option>
                  </select>
                </InputField>

                <InputField label="2nd Separator">
                  <select className="input-field" {...register("secondSeprator")}>
                    <option value=""></option>
                    <option value="/">/</option>
                    <option value="-">-</option>
                  </select>
                </InputField>

                <InputField label="Length" required>
                  <select className="input-field" {...register("length", { valueAsNumber: true })}>
                    <option value="">Select</option>
                    <option value="6">000001</option>
                    <option value="7">0000001</option>
                    <option value="8">00000001</option>
                    <option value="9">000000001</option>
                  </select>
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
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(SequenceDrawer);
