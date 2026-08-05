import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  LabMethodListIem,
  ObservationPopupProps,
  PickMasterOption,
  SelectItem,
} from "@/screens/investigationObservationMapping/types";
import { observationPopupSchema } from "@/validation/investigationObservationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import Select from "react-select";

const resetFormData = () => ({
  observationName: "",
  fieldTypeId: 0,
  observationId: 0,
  prefixName: "",
  suffixName: "",
  methodId: 0,
  showInDS: 1,
  roundUp: "",
  fieldType: "",
});

const ObservationPopup = ({ isOpen, onClose, data, onSuccess }: ObservationPopupProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const observationField = usePickMaster("ObservationFieldType");
  const observationTypeField = (observationField?.pickMasterValue ?? []) as PickMasterOption[];

  const [labMethodList, setLabMethodList] = useState<LabMethodListIem[]>([]);
  const [selectedLabMethod, setSelectedLabMethod] = useState<SelectItem | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");
  let closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    register,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(observationPopupSchema),
    defaultValues: {
      observationName: "",
      fieldTypeId: 0,
      observationId: 0,
      prefixName: "",
      suffixName: "",
      methodId: 0,
      showInDS: 0,
      roundUp: "",
      fieldType: "",
    },
  });

  const buttonTitle = data ? "Update" : "Create";

  //   lab method
  const getLabMethod = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LAB_METHOD_MASTER,
      {},
      { params: { isActive: Status?.ACTIVE } },
      { component: "ObservationPopup", silent: true }
    );
    setLabMethodList(resp?.data ?? []);
  };

  const labMethodSelectOptions = useMemo<SelectItem[]>(
    () =>
      labMethodList.map(item => ({
        value: item?.methodId,
        label: item?.method ?? "",
      })),
    [labMethodList]
  );

  useEffect(() => {
    getLabMethod();
  }, []);

  //lab method select handler
  const labMethodSelectHandler = (option: SelectItem | null) => {
    setSelectedLabMethod(option);
    setValue("methodId", option?.value ?? 0);
  };

  //edit handler
  useEffect(() => {
    if (!isOpen) return;

    if (!data) {
      reset(resetFormData());
      setSelectedLabMethod(null);
      return;
    }
    const fieldTypeLabel =
      observationTypeField.find(f => Number(f.key) === Number(data.fieldTypeId))?.value || "";

    reset({
      observationName: data.observationName ?? "",
      fieldTypeId: data.fieldTypeId ?? 0,
      fieldType: fieldTypeLabel,
      observationId: data.observationId ?? 0,
      prefixName: data.prefix ?? "",
      suffixName: data.suffix ?? "",
      methodId: data.methodId ?? 0,
      showInDS: data.showInDischargeSummary ?? 1,
      roundUp: data.roundUp ?? "",
    });

    const methodOption = labMethodSelectOptions.find(
      m => Number(m.value) === Number(data.methodId)
    );

    if (methodOption) {
      setSelectedLabMethod(methodOption);
      setValue("methodId", methodOption.value);
    }
  }, [data, isOpen, labMethodSelectOptions, observationTypeField]);

  //   submit handler
  const onSubmit = async (formData: any) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_OBSERVATION_MASTER,
      formData,
      {},
      { component: "ObservationPopup" }
    );
    if (!resp?.result) {
      setSuccessMessage("");
      return;
    }
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    setSelectedLabMethod(null);
    await onSuccess?.();
    closeTimer.current = setTimeout(() => {
      onClose();
      setSuccessMessage("");
    }, 1000);
    reset(resetFormData());
  };
  // clear timer
  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  // field change handler
  const fieldTypeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    const selected = observationTypeField.find(o => Number(o.key) === value);

    setValue("fieldTypeId", value, { shouldValidate: true });
    setValue("fieldType", selected?.value || "", { shouldValidate: true });
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      observationName: "",
      fieldTypeId: 0,
      observationId: 0,
      prefixName: "",
      suffixName: "",
      methodId: 0,
      showInDS: 1,
      roundUp: "",
      fieldType: "",
    });
    setSelectedLabMethod(null);
  };

  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay  ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-250 ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">{buttonTitle} Observation Mapping</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error?.message} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-3">
            <InputField label="Investigation Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter investigation name"
                {...register("observationName")}
              />
              {errors.observationName && (
                <p className="input-field-error">{errors.observationName.message}</p>
              )}
            </InputField>

            <InputField label="Prefix">
              <input
                className="input-field"
                placeholder="Enter prefix name"
                {...register("prefixName")}
              />
            </InputField>

            <InputField label="Suffix">
              <input
                className="input-field"
                placeholder="Enter suffix name"
                {...register("suffixName")}
              />
            </InputField>
            <InputField label="Method">
              <Select
                value={selectedLabMethod}
                options={labMethodSelectOptions}
                placeholder="Select method"
                isSearchable
                isClearable
                onChange={(option: any) => labMethodSelectHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Is Searchable">
              <select className="input-field" {...register("showInDS")}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
            </InputField>

            <InputField label="Round Off">
              <input className="input-field" {...register("roundUp")} />
            </InputField>

            <InputField label="Field Type">
              <select
                className="input-field"
                value={watch("fieldTypeId") || ""}
                onChange={fieldTypeChangeHandler}
              >
                <option value="">Select Field Type</option>
                {observationTypeField?.map(o => (
                  <option key={o?.key} value={o?.key}>
                    {o?.value}
                  </option>
                ))}
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
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default ObservationPopup;
