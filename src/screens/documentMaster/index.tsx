import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";

import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess } from "@/utils/alert";
import { Minus, Plus } from "lucide-react";
import { InferType } from "yup";
import Animation from "../../components/animation";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { ENDPOINTS } from "../../config/defaults";
import { PatientDocumentTableHeader } from "../../constants/constants";
import useGlobalApi from "../../hooks/useGlobalApi";
import PatientDocumentSchema from "../../validation/patientDocumentSchema";
import { PatientDocumentItem } from "./types";
type PatientDocumentFormItem = InferType<typeof PatientDocumentSchema>;

const PatientDocumentMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const documentCategoryList = usePickMaster("DocumentCategoryType")?.pickMasterValue ?? [];
  console.log("documentCategoryList", documentCategoryList);

  const [patientDocumentList, setPatientDocumentList] = useState<PatientDocumentItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PatientDocumentSchema),
    defaultValues: {
      documentId: 0,
      documentName: "",
      documentCode: "",
      isActive: 1,
      documentCategoryId: 0,
      documentCategory: "",
      isMandatory: 0,
    },
  });

  const isEditMode = Boolean(watch("documentId"));
  const buttonTitle = isEditMode ? "Update" : "Create";

  // document list
  const getPatientDocument = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_DOCUMENT_MASTER,
      {},
      {},
      { component: "PatientDocumentMaster", silent: true }
    );

    setPatientDocumentList(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) {
      getPatientDocument();
    }
  }, [showDetails]);

  //  submit handler
  const submitHandler = async (payload: PatientDocumentFormItem) => {
    debugger;
    if (!payload?.documentName) return;

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_PATIENT_DOCUMENT_MASTER,
      payload,
      {},
      {
        component: "PatientDocumentMaster",
      }
    );
    if (!resp?.result) {
      showError(error?.message ?? "Something went wrong!");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");

    reset({
      documentId: 0,
      documentName: "",
      documentCode: "",
      isActive: 1,
      documentCategoryId: 0,
      documentCategory: "",
      isMandatory: 0,
    });
    await getPatientDocument();
  };

  // edit handler
  const editHandler = (item: PatientDocumentItem) => {
    if (!item) {
      reset({
        documentId: 0,
        documentName: "",
        documentCode: "",
        isActive: 1,
        documentCategoryId: 0,
        documentCategory: "",
        isMandatory: 0,
      });
      return;
    }
    reset({
      documentId: item.documentId,
      documentName: item.documentName,
      documentCode: item.documentCode,
      isActive: item.isActive,
      documentCategoryId: item?.documentCategoryId,
      documentCategory: item?.documentCategory,
      isMandatory: item?.isMandatory,
    });
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      documentId: 0,
      documentName: "",
      documentCode: "",
      isActive: 1,
      documentCategoryId: 0,
      documentCategory: "",
      isMandatory: 0,
    });
  };

  return (
    <div className="page-container">
      <h1 className="page-heading"> Document Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span> Document Master</span>
      </nav>

      <div className="card mb-1">
        {/* form */}

        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="form-grid-4">
            <InputField label="Document Category" required>
              <select
                className="input-field"
                {...register("documentCategoryId")}
                onChange={e => {
                  const selectedId = e.target.value;

                  const selectedCategory = documentCategoryList?.find(
                    d => String(d.key) === selectedId
                  );

                  setValue("documentCategory", selectedCategory?.type || "");

                  setValue("documentCategoryId", Number(selectedId));
                }}
              >
                <option value={0}>--Select--</option>
                {documentCategoryList?.map((d: PickMasterItem) => (
                  <option key={d?.key} value={d?.key}>
                    {d?.value}
                  </option>
                ))}
              </select>
              {errors.documentCategoryId && (
                <p className="input-field-error">{errors.documentCategoryId.message}</p>
              )}
            </InputField>

            <InputField label="Document Name" required>
              <input
                type="text"
                placeholder="Enter Document Name"
                className="input-field"
                {...register("documentName")}
              />
              {errors.documentName && (
                <p className="input-field-error">{errors.documentName.message}</p>
              )}
            </InputField>

            <InputField label="Document Code" required>
              <input
                type="text"
                placeholder="Enter Document Code"
                className="input-field"
                {...register("documentCode")}
              />
              {errors.documentCode && (
                <p className="input-field-error">{errors.documentCode.message}</p>
              )}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>

            <InputField label="Is Mandatory" required>
              <select className="input-field" {...register("isMandatory")}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button " onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* table */}
      <div className="card ">
        <div className="card-header">
          <h2 className="card-title">Patient Document List</h2>

          <button className="" onClick={() => setShowDetails(p => !p)}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-scroll-wrapper">
              <table className="base-table lg:min-h-50 lg:max-h-50">
                <thead className="table-head">
                  <tr>
                    {PatientDocumentTableHeader.map((h, index) => (
                      <th key={index} className="table-th">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {patientDocumentList.length === 0 && (
                    <tr>
                      <td colSpan={PatientDocumentTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {patientDocumentList.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.documentCategory}</td>

                      <td className="table-td">{item.documentName}</td>
                      <td className="table-td">{item.documentCode}</td>
                      <td
                        className={`table-td ${
                          Number(item?.isMandatory) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isMandatory) === 1 ? "Yes" : "No"}
                      </td>
                      <td
                        className={`table-td ${
                          Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                      </td>

                      <td className="table-td">{item.createdBy}</td>
                      <td className="table-td">{item.createdOn}</td>
                      <td className="table-td">{item.lastModifiedBy}</td>
                      <td className="table-td">{item.lastModifiedOn}</td>
                      <td className="table-action" onClick={() => editHandler(item)}>
                        <i className="fa-solid fa-edit text-xl icon-color-button"></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Animation>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default PatientDocumentMaster;
