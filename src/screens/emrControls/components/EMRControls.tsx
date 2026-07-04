import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { HeaderMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { EmrControlFormData, emrControlSchema } from "@/validation/emrControlsSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { EmrControlField, EmrControlItem } from "../types";

type FieldDraft = {
  fieldId: number;
  fieldName: string;
  controlTypeId: number;
  optionInput: string;
  options: string[];
};

const emptyField = (): FieldDraft => ({
  fieldId: 0,
  fieldName: "",
  controlTypeId: 0,
  optionInput: "",
  options: [],
});

type EmrControlPayload = EmrControlFormData & {
  fields: EmrControlField[];
};

const EMRControls = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();

  const controlTypeList = usePickMaster("DoctorHeaderControlType")?.pickMasterValue ?? [];
  const usedForList = usePickMaster("DoctorHeaderUsedForPatientType")?.pickMasterValue ?? [];

  const controlTypeName = (id: number) =>
    controlTypeList.find((c: PickMasterItem) => Number(c.key) === id)?.value ?? "";

  const isDropdownControlType = (id: number) => controlTypeName(id).toLowerCase().includes("dropdown");

  const [fields, setFields] = useState<FieldDraft[]>([emptyField()]);

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(emrControlSchema),
    defaultValues: {
      headerId: 0,
      headerName: "",
      displayName: "",
      isPrint: 1,
      isShowInTempRoom: 0,
      usedForPatientType: 1,
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("headerId"));
  const buttonTitle = isEdit ? "Update" : "Create";

  const updateField = (index: number, patch: Partial<FieldDraft>) => {
    setFields(prev => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const addFieldRow = () => setFields(prev => [...prev, emptyField()]);

  const removeFieldRow = (index: number) => {
    setFields(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.length ? filtered : [emptyField()];
    });
  };

  const addFieldOption = (index: number) => {
    const val = fields[index]?.optionInput.trim();
    if (!val) return;
    setFields(prev =>
      prev.map((f, i) =>
        i === index && !f.options.includes(val)
          ? { ...f, options: [...f.options, val], optionInput: "" }
          : i === index
            ? { ...f, optionInput: "" }
            : f
      )
    );
  };

  const removeFieldOption = (index: number, optIdx: number) => {
    setFields(prev =>
      prev.map((f, i) => (i === index ? { ...f, options: f.options.filter((_, o) => o !== optIdx) } : f))
    );
  };

  const resetFields = () => setFields([emptyField()]);

  const createUpdateEmrControl = async (data: EmrControlPayload) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_HEADER,
      data,
      {},
      { component: "EMRControls" }
    );
    return resp;
  };

  const mutation = useMutation<any, Error, EmrControlPayload>({
    mutationKey: ["createUpdateEmrControl"],
    mutationFn: (data: EmrControlPayload) => createUpdateEmrControl(data),

    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Something went wrong");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      queryClient.invalidateQueries({ queryKey: ["getEmrControlList"] });

      reset({
        headerId: 0,
        headerName: "",
        displayName: "",
        isPrint: 1,
        isShowInTempRoom: 0,
        usedForPatientType: 1,
        isActive: 1,
      });
      resetFields();
    },

    onError: error => {
      showError(error?.message);
    },
  });

  const onsubmit = (data: EmrControlFormData) => {
    const hasInvalidField = fields.some(f => {
      if (!f.fieldName.trim() || !f.controlTypeId) return true;
      if (isDropdownControlType(f.controlTypeId) && f.options.length === 0) return true;
      return false;
    });

    if (hasInvalidField) {
      showWarning("Please complete every field — name, control type, and options for dropdowns");
      return;
    }

    const payload: EmrControlPayload = {
      ...data,
      fields: fields.map((f, idx) => ({
        fieldId: f.fieldId,
        fieldName: f.fieldName.trim(),
        controlTypeId: f.controlTypeId,
        controlType: controlTypeName(f.controlTypeId),
        options: f.options,
        sequenceNo: idx + 1,
      })),
    };

    mutation.mutate(payload);
  };

  const getEmrControlList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_DOCTOR_HEADER_MASTER,
      {},
      {},
      { component: "EMRControls" }
    );
    return resp?.data;
  };

  const { data = [] } = useQuery({
    queryKey: ["getEmrControlList"],
    queryFn: getEmrControlList,
  });

  const editHandler = (item: EmrControlItem) => {
    reset({
      headerId: item?.headerId ?? 0,
      headerName: item?.headerName ?? "",
      displayName: item?.displayName ?? "",
      isPrint: item?.isPrint ?? 1,
      isShowInTempRoom: item?.isShowInTempRoom ?? 0,
      usedForPatientType: item?.usedForPatientType ?? 0,
      isActive: item?.isActive ?? 1,
    });

    setFields(
      item?.fields?.length
        ? item.fields.map(f => ({
            fieldId: f.fieldId,
            fieldName: f.fieldName,
            controlTypeId: f.controlTypeId,
            optionInput: "",
            options: f.options ?? [],
          }))
        : [emptyField()]
    );
  };

  const cancelHandler = () => {
    reset({
      headerId: 0,
      headerName: "",
      displayName: "",
      isPrint: 1,
      isShowInTempRoom: 0,
      usedForPatientType: 1,
      isActive: 1,
    });
    resetFields();
  };

  return (
    <>
      <div className="card mt-1">
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Header" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter header"
                {...register("headerName")}
              />
              {errors.headerName && <p className="input-field-error">{errors.headerName.message}</p>}
            </InputField>

            <InputField label="Display Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter display name"
                {...register("displayName")}
              />
              {errors.displayName && <p className="input-field-error">{errors.displayName.message}</p>}
            </InputField>

            <InputField label="Show on Print" required>
              <select className="input-field" {...register("isPrint")}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
              {errors.isPrint && <p className="input-field-error">{errors.isPrint.message}</p>}
            </InputField>

            <InputField label="Show in Temperature Room">
              <select className="input-field" {...register("isShowInTempRoom")}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </InputField>

            <InputField label="Used for">
              <select className="input-field" {...register("usedForPatientType")}>
                {usedForList?.map((i: PickMasterItem) => (
                  <option key={i?.key} value={i?.key}>
                    {i?.value}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>
          </div>

          {/* ── Fields builder — each row is one sub-field of this header, its own name + control type ── */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Fields</h3>
              <button
                type="button"
                onClick={addFieldRow}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                <Plus size={14} /> Add Field
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {fields.map((field, index) => {
                const isDropdown = isDropdownControlType(field.controlTypeId);
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm hover:border-blue-200 transition-colors"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                      <InputField label="Field Name" required>
                        <input
                          type="text"
                          className="input-field !mb-0"
                          placeholder="e.g. Substance"
                          value={field.fieldName}
                          onChange={e => updateField(index, { fieldName: e.target.value })}
                        />
                      </InputField>

                      <InputField label="Control Type" required>
                        <select
                          className="input-field !mb-0"
                          value={field.controlTypeId}
                          onChange={e =>
                            updateField(index, {
                              controlTypeId: Number(e.target.value),
                              options: [],
                              optionInput: "",
                            })
                          }
                        >
                          <option value={0}>Select an Option</option>
                          {controlTypeList.map((c: PickMasterItem) => (
                            <option key={c?.key} value={c?.key}>
                              {c?.value}
                            </option>
                          ))}
                        </select>
                      </InputField>

                      <div className="flex items-end gap-2 h-full pb-0.5">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFieldRow(index)}
                            className="flex items-center justify-center w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 transition shrink-0 mb-[2px]"
                            title="Remove field"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {isDropdown && (
                      <div className="mt-3">
                        <InputField label="Dropdown Options" required>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="input-field !mb-0"
                              placeholder="Type an option and press Enter"
                              value={field.optionInput}
                              onChange={e => updateField(index, { optionInput: e.target.value })}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addFieldOption(index);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="save-btn shrink-0 !py-2"
                              onClick={() => addFieldOption(index)}
                            >
                              Add
                            </button>
                          </div>
                          {field.options.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.options.map((opt, optIdx) => (
                                <span
                                  key={optIdx}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-sm font-medium"
                                >
                                  {opt}
                                  <button
                                    type="button"
                                    onClick={() => removeFieldOption(index, optIdx)}
                                    className="text-blue-400 hover:text-red-500 leading-none"
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </InputField>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
        {!!loading && <CustomLoader isLoading={loading} />}
      </div>

      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title">EMR Controls List</h2>
        </div>

        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-72 lg:max-h-72">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {HeaderMasterTableHeader.map((h, index) => (
                      <th key={index} className="table-th align-top">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={HeaderMasterTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {data.map((item: EmrControlItem, idx: number) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.headerName || "-"}</td>
                      <td className="table-td">{item?.displayName || "-"}</td>
                      <td className="table-td">
                        {item?.fields?.length ? item.fields.map(f => f.fieldName).join(", ") : "-"}
                      </td>
                      <td
                        className={`table-td ${
                          Number(item?.isPrint) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isPrint) === 1 ? "Yes" : "No"}
                      </td>
                      <td
                        className={`table-td ${
                          Number(item?.isShowInTempRoom) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isShowInTempRoom) === 1 ? "Yes" : "No"}
                      </td>
                      <td className="table-td">{item?.usedForPatientTypeName || "-"}</td>
                      <td
                        className={`table-td ${
                          Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                      </td>
                      <td className="table-td" onClick={() => editHandler(item)}>
                        <i className="fa-solid fa-edit text-xl icon-color-button" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EMRControls;
