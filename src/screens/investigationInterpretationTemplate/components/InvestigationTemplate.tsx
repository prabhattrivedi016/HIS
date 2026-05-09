import Animation from "@/components/animation";
import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { InvestigationCommentTableHeader, Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { showSuccess, showWarning } from "@/utils/alert";
import {
  InvestigationTemplateFormData,
  investigationTemplateSchema,
} from "@/validation/investigationInterpretationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InvestigationCommentItem } from "../types";

const InvestigationTemplate = () => {
  const { loading, fetchApi } = useGlobalApi();
  const templateList = usePickMaster("TemplateInterpretationComment")?.pickMasterValue ?? [];

  const [allInvestigationComment, setAllInvestigationComment] = useState<
    InvestigationCommentItem[]
  >([]);

  const [showDetails, setShowDetails] = useState<boolean>(false);

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(investigationTemplateSchema),
    defaultValues: {
      id: 0,
      typeId: 1,
      type: "",
      name: "",
      contentValue: "",
      isActive: 1,
    },
  });
  const selectedTypeId = watch("typeId");
  const contentValue = watch("contentValue");

  //   all investigation comment
  const getAllInvestigationComment = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_INVESTIGATION_TEMPLATE_COMMENTS,
      {},
      {},
      { component: "InvestigationTemplate" }
    );
    setAllInvestigationComment(resp?.data ?? []);
  };

  useEffect(() => {
    const defaultTemplate = templateList?.find(t => Number(t?.key) === Status?.ACTIVE);
    setValue("type", defaultTemplate?.value ?? "", { shouldDirty: false });
    setValue("typeId", Number(defaultTemplate?.key) || 1, { shouldDirty: false });
    getAllInvestigationComment();
  }, [templateList]);

  //   text editor change handler
  const textEditorChangeHandler = (data: string) => {
    setValue("contentValue", data ?? "", { shouldValidate: true, shouldDirty: true });
  };

  //   template name change handler
  const templateNameChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) return;
    const selected = templateList?.find(t => Number(t?.key) === value);
    setValue("type", selected?.value ?? "", { shouldValidate: true, shouldDirty: true });
    setValue("typeId", Number(selected?.key) || 1, { shouldValidate: true, shouldDirty: true });
  };

  //   submit handler
  const onsubmit = async (formData: InvestigationTemplateFormData) => {
    const payload = [formData];
    if (!payload) return;
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_INVESTIGATION_TEMPLATE_COMMENT_MASTER,
      payload,
      {},
      { component: "InvestigationTemplate" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    const defaultTemplate = templateList?.find(t => Number(t?.key) === Status?.ACTIVE);
    reset({
      id: 0,
      typeId: Number(defaultTemplate?.key) || 1,
      type: defaultTemplate?.value ?? "",
      name: "",
      contentValue: "",
      isActive: 1,
    });
    await getAllInvestigationComment();
  };

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  //   edit handler
  const editHandler = async (item: InvestigationCommentItem) => {
    if (!item) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_TEMPLATE_COMMENT_MASTER,
      {},
      { params: { id: item?.Id, typeId: item?.TypeId } },
      { component: "InvestigationTemplate" }
    );
    reset({
      id: resp?.data?.[0]?.Id ?? 0,
      typeId: resp?.data?.[0]?.TypeId ?? resp?.data?.[0]?.Typeid ?? 1,
      type: resp?.data?.[0]?.Type ?? "",
      name: resp?.data?.[0]?.Name ?? "",
      contentValue: resp?.data?.[0]?.ContentValue ?? "",
      isActive: resp?.data?.[0]?.IsActive ?? 1,
    });
  };

  const cancelHandler = () => {
    const defaultTemplate = templateList?.find(t => Number(t?.key) === Status?.ACTIVE);
    reset({
      id: 0,
      typeId: Number(defaultTemplate?.key) || 1,
      type: defaultTemplate?.value ?? "",
      name: "",
      contentValue: "",
      isActive: 1,
    });
  };
  return (
    <div className="mt-1">
      <div className="card mb-1">
        <h2 className="card-title ">Investigation template Master</h2>
        {/* form */}
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Mapping Type" required>
              <select
                className="input-field"
                value={selectedTypeId ?? 1}
                onChange={templateNameChangeHandler}
              >
                {templateList.map(t => (
                  <option key={t?.key} value={t?.key}>
                    {t?.value}
                  </option>
                ))}
              </select>
              {errors.type && <p className="input-field-error">{errors.type.message}</p>}
            </InputField>

            <InputField label="Template Name">
              <input
                className="input-field"
                placeholder="Enter template name"
                {...register("name")}
              />

              {errors.name && <p className="input-field-error">{errors.name.message}</p>}
            </InputField>

            <InputField label="Status">
              <select className="input-field" {...register("isActive", { valueAsNumber: true })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>
          {/* text editor */}
          <div className="flex flex-col gap-1">
            <TextEditor value={contentValue ?? ""} onChange={textEditorChangeHandler} />
            {errors.contentValue && (
              <p className="input-field-error">{errors.contentValue.message}</p>
            )}
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {"Save"}
            </button>
            <button type="button" className="cancel-button " onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Investigation Template Master List</h2>

          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-58 lg:max-h-58 ">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {InvestigationCommentTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {allInvestigationComment?.length === 0 && (
                      <tr>
                        <td colSpan={allInvestigationComment.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {allInvestigationComment.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>

                        <td className="table-td">{item?.Type || "-"}</td>

                        <td className="table-td">{item?.Name || "-"}</td>

                        <td
                          className={`table-td ${
                            Number(item?.IsActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item?.IsActive) === 1 ? "Active" : "Inactive"}
                        </td>

                        <td className="table-td">{item?.CreatedBy || "-"}</td>
                        <td className="table-td">{item?.CreatedOn || "-"}</td>

                        <td className="table-td">{item?.LastModifiedBy || "-"}</td>
                        <td className="table-td">{item?.LastModifiedOn || "-"}</td>

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
        </Animation>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default InvestigationTemplate;
