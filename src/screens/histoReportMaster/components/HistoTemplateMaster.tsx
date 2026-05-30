import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import {
  HistoTemplateMasterFormItem,
  histoTemplateMasterSchema,
} from "@/validation/histoReportMasterSchema";

import CustomLoader from "@/components/customLoader";
import { HistoTemplateMasterTableHeader } from "@/constants/constants";
import { showSuccess, showWarning } from "@/utils/alert";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { HistoTemplateMasterItem } from "../types";

const HistoTemplateMaster = () => {
  const { loading, fetchApi } = useGlobalApi();

  const templateList = usePickMaster("HistoTemplateType")?.pickMasterValue ?? [];

  const [contentValue, setContentValue] = useState("");

  const [allHistoTemplateMaster, setAllHistoTemplateMaster] = useState<HistoTemplateMasterItem[]>(
    []
  );
  const [filteredHistoTemplateMaster, setFilteredHistoTemplateMaster] = useState<
    HistoTemplateMasterItem[]
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(histoTemplateMasterSchema),
    defaultValues: {
      id: 0,
      typeId: 0,
      type: "",
      name: "",
      contentValue: "",
      isActive: 1,
    },
  });
  const isEdit = Boolean(watch("id"));
  const buttonTitle = isEdit ? "Update" : "Create";

  const selectedTypeId = watch("typeId");

  // CKEditor Change Handler
  const textEditorChangeHandler = (data: string) => {
    setContentValue(data);

    setValue("contentValue", data, {
      shouldDirty: true,
      shouldTouch: true,
    });

    clearErrors("contentValue");
  };

  // Template Select Handler
  const templateSelectHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    if (!value) {
      setAllHistoTemplateMaster([]);

      setValue("typeId", 0);
      setValue("type", "");

      return;
    }

    const selected = templateList.find(item => Number(item.key) === value);

    setValue("type", selected?.value ?? "", {
      shouldDirty: true,
      shouldTouch: true,
    });

    setValue("typeId", value, {
      shouldDirty: true,
      shouldTouch: true,
    });

    clearErrors(["type", "typeId"]);

    await getAllHistoTemplateMaster(value);
  };

  // Submit Handler
  const onSubmit = async (data: HistoTemplateMasterFormItem) => {
    const payload = {
      ...data,
      contentValue,
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_HISTO_TEMPLATE_MASTER,
      payload,
      {},
      { component: "HistoTemplateMaster" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    reset({
      id: 0,
      typeId: 0,
      type: "",
      name: "",
      contentValue: "",
      isActive: 1,
    });
    setContentValue("");

    await getAllHistoTemplateMaster(data.typeId);
  };

  // Get Template Data
  const getAllHistoTemplateMaster = async (typeId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_HISTO_TEMPLATE_MASTER,
      {},
      {
        params: { typeId },
      },
      {
        component: "HistoTemplateMaster",
      }
    );
    setAllHistoTemplateMaster(resp?.data ?? []);
    setFilteredHistoTemplateMaster(resp?.data ?? []);
  };

  const resetHandler = () => {
    reset({
      id: 0,
      typeId: 0,
      type: "",
      name: "",
      contentValue: "",
      isActive: 1,
    });

    setContentValue("");

    setAllHistoTemplateMaster([]);
    setFilteredHistoTemplateMaster([]);
  };
  // edit handler
  const editHandler = (item: HistoTemplateMasterItem) => {
    if (!item) return;
    reset({
      id: item?.id ?? 0,
      typeId: item?.typeId ?? 0,
      type: item?.type ?? "",
      name: item?.name ?? "",
      isActive: item?.isActive,
    });
    setContentValue(item?.contentValue ?? "");
  };

  // filter template list
  const searchTemplateHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    // Implementation for filtering template list based on search value
    if (!value) {
      return;
    }
    const filteredList = allHistoTemplateMaster.filter(item =>
      item.name.toLowerCase().includes(value)
    );
    setFilteredHistoTemplateMaster(filteredList);
  };

  return (
    <div className="mt-1">
      {/* form data */}
      <div className="card mb-1">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            {/* Template Type */}
            <InputField label="Template Type" required>
              <select
                className="input-field"
                onChange={templateSelectHandler}
                value={selectedTypeId}
              >
                <option value="">Select Template Type</option>

                {templateList.map((item: PickMasterItem) => (
                  <option key={item.key} value={item.key}>
                    {item.value}
                  </option>
                ))}
              </select>

              {errors.type && <p className="input-field-error">{errors.type.message}</p>}
            </InputField>

            {/* Template Name */}
            <InputField label="Template Name" required>
              <input
                className="input-field"
                placeholder="Enter template name"
                {...register("name")}
              />

              {errors.name && <p className="input-field-error">{errors.name.message}</p>}
            </InputField>

            {/* Status */}
            <InputField label="Status" required>
              <select
                className="input-field"
                {...register("isActive", {
                  valueAsNumber: true,
                })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>

              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>

          {/* Editor */}
          <TextEditor value={contentValue} onChange={textEditorChangeHandler} />

          {errors.contentValue && (
            <p className="input-field-error mt-1">{errors.contentValue.message}</p>
          )}

          {/* Buttons */}
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn" disabled={loading}>
              {buttonTitle}
            </button>

            <button type="button" className="cancel-button" onClick={resetHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Histo Template List</h2>
        </div>

        <div className="table-container ">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-72 lg:max-h-72 ">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {HistoTemplateMasterTableHeader.map((h, index) => (
                      <th key={index} className="table-th align-top ">
                        {h === "Template Name" ? (
                          <div className="flex flex-row gap-2  ">
                            <h2>{h}</h2>
                            <input
                              type="text"
                              className="input-field lg:max-w-35 lg:max-h-7 "
                              placeholder="Search name..."
                              onChange={searchTemplateHandler}
                            />
                          </div>
                        ) : (
                          h
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredHistoTemplateMaster.length === 0 && (
                    <tr>
                      <td colSpan={HistoTemplateMasterTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredHistoTemplateMaster.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>

                      <td className="table-td">{item?.type || "-"}</td>

                      <td className="table-td">{item?.name || "-"}</td>
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
      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default HistoTemplateMaster;
