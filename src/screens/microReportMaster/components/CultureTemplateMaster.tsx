import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { HistoTemplateMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import {
  CultureTemplateFormItem,
  cultureTemplateSchema,
} from "@/validation/microReportMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CultureItem } from "../types";

const CultureTemplateMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();

  const templateType = usePickMaster("MicroTemplateType")?.pickMasterValue ?? [];

  const [textvalue, setTextValue] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);

  const [searchValue, setSearchValue] = useState("");

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(cultureTemplateSchema),
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

  // template type select handler
  const templateTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) return;
    setSelectedTypeId(value);
    if (value === 1) {
      setValue("type", "Culture");
    } else if (value === 2) {
      setValue("type", "Notes");
    }
  };

  // text change handler
  const textChangeHandler = (data: string) => {
    setTextValue(data);
    setValue("contentValue", data, {
      shouldValidate: true,
    });
  };

  const createUpdateCultureTemplate = async (data: CultureTemplateFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_MICRO_TEMPLATE,
      data,
      {},
      { component: "CultureTemplateMaster" }
    );
    return resp;
  };

  const mutations = useMutation({
    mutationKey: ["createUpdateCultureTemplate"],
    mutationFn: createUpdateCultureTemplate,
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Something went wrong");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");

      queryClient.invalidateQueries({
        queryKey: ["CultureTemplate", selectedTypeId],
      });
      reset({
        id: 0,
        typeId: 0,
        type: "",
        name: "",
        contentValue: "",
        isActive: 1,
      });
      setTextValue("");
    },
    onError: errors => {
      showError(errors?.message ?? "Something went wrong");
    },
  });

  // submit handler
  const onsubmit = (data: CultureTemplateFormItem) => {
    mutations.mutate(data);
  };

  // get mapping template
  const getMappingTemplate = async (typeId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_MICRO_TEMPLATE_LIST,
      {},
      { params: { typeId } },
      { component: "CultureTemplateMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: cultureTemplateList = [] } = useQuery({
    queryKey: ["CultureTemplate", selectedTypeId],
    queryFn: () => getMappingTemplate(selectedTypeId),
    enabled: selectedTypeId > 0,
  });

  // filter template list

  const searchTemplateHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const filteredCultureTemplateMaster = useMemo(() => {
    if (!searchValue.trim()) {
      return cultureTemplateList;
    }

    return cultureTemplateList.filter((item: CultureItem) =>
      item.name?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [cultureTemplateList, searchValue]);

  // edit handler
  const editHandler = (item: CultureItem) => {
    reset({
      id: item?.id ?? 0,
      name: item?.name ?? "",
      contentValue: item?.contentValue ?? "",
      isActive: item?.isActive ?? 1,
      typeId: item?.typeId ?? 0,
      type: item?.type ?? "",
    });
    setSelectedTypeId(item?.typeId ?? 0);
    setTextValue(item?.contentValue ?? "");
  };

  // reset handler
  const resetHandler = () => {
    const firstType = templateType?.[0];

    reset({
      id: 0,
      typeId: Number(firstType?.key ?? 0),
      type: firstType?.value ?? "",
      name: "",
      contentValue: "",
      isActive: 1,
    });

    setSelectedTypeId(Number(firstType?.key ?? 0));
    setTextValue("");
  };

  useEffect(() => {
    if (!templateType?.length) return;

    if (selectedTypeId > 0) return;

    const firstType = templateType[0];

    setSelectedTypeId(Number(firstType.key));

    setValue("typeId", Number(firstType.key));

    setValue("type", firstType.value);
  }, [templateType, selectedTypeId, setValue]);

  return (
    <div className="mt-1">
      <div className="card mb-1">
        {/* form data */}
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Template Type" required>
              <select
                className="input-field"
                {...register("typeId", {
                  valueAsNumber: true,
                  onChange: templateTypeSelectHandler,
                })}
              >
                {templateType?.map((t: PickMasterItem) => (
                  <option key={t?.key} value={t?.key}>
                    {t?.value}
                  </option>
                ))}
              </select>
              {errors.typeId && <p className="input-field-error">{errors.typeId.message}</p>}
            </InputField>

            <InputField label="Template Name " required>
              <input
                className="input-field"
                placeholder="Enter template name"
                {...register("name")}
              />
              {errors.name && <p className="input-field-error">{errors.name.message}</p>}
            </InputField>

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
            </InputField>
          </div>
          <TextEditor value={textvalue} onChange={textChangeHandler} />
          {errors.contentValue && (
            <p className="input-field-error mt-1">{errors.contentValue.message}</p>
          )}
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button  " onClick={resetHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* table */}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Culture Template List</h2>
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
                              className="input-field lg:max-w-35 lg:max-h-7"
                              placeholder="search name..."
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
                  {filteredCultureTemplateMaster.length === 0 && (
                    <tr>
                      <td colSpan={HistoTemplateMasterTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredCultureTemplateMaster.map((item: CultureItem, idx: number) => (
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
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default CultureTemplateMaster;
