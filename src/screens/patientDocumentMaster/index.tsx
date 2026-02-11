import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";

import { Minus, Plus } from "lucide-react";
import Animation from "../../components/animation";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { ENDPOINTS } from "../../config/defaults";
import {
  DEFAULT_PATIENT_DOCUMENT_MASTER_FORMDATA,
  PatientDocumentTableHeader,
} from "../../constants/constants";
import useGlobalApi from "../../hooks/useGlobalApi";
import PatientDocumentMasterValidation from "../../validation/patientDocumentMaster";
import { PatientDocumentItem } from "./types";

const PatientDocumentMaster = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [patientDocumentList, setPatientDocumentList] = useState<PatientDocumentItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const buttonTitle = isEditMode ? "Update" : "Create";

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PatientDocumentMasterValidation),
    defaultValues: {
      ...DEFAULT_PATIENT_DOCUMENT_MASTER_FORMDATA,
    },
  });

  /* ---------------- fetch document list ---------------- */
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
    getPatientDocument();
  }, []);

  /* ---------------- submit ---------------- */
  const submitHandler = async (data: {
    documentId?: number | null;
    documentName: string;
    documentCode: string;
    isActive: number;
  }) => {
    const payload = {
      documentId: isEditMode ? data?.documentId : 0,
      documentName: data?.documentName,
      documentCode: data?.documentCode,
      isActive: data?.isActive,
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_PATIENT_DOCUMENT_MASTER,
      payload,
      {},
      {
        component: "PatientDocumentMaster",
        silent: true,
      }
    );
    if (resp?.result) {
      reset({ ...DEFAULT_PATIENT_DOCUMENT_MASTER_FORMDATA });
      setIsEditMode(false);
      await getPatientDocument();
    }
  };

  /* ---------------- edit handler ---------------- */
  const editHandler = (item: PatientDocumentItem) => {
    setIsEditMode(true);
    reset({
      documentId: item.documentId,
      documentName: item.documentName,
      documentCode: item.documentCode,
      isActive: item.isActive,
    });
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Patient Document Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Patient Document Master</span>
      </nav>

      <div className="card">
        <h2 className="card-title ">Document Details</h2>

        <form className="form-grid-4" onSubmit={handleSubmit(submitHandler)}>
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

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* ------------------------------patient document table------------------------------ */}
      <div className="card ">
        <div className="card-header">
          <h2 className="card-title">Patient Document List</h2>

          <button className="" onClick={() => setShowDetails(p => !p)}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-container-height">
              <table className="base-table ">
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
                      <td className="table-td">{item.documentName}</td>
                      <td className="table-td">{item.documentCode}</td>
                      <td className="table-td">{item.isActive ? "Active" : "Inactive"}</td>
                      <td className="table-td">{item.createdBy}</td>
                      <td className="table-td">{item.createdOn}</td>
                      <td className="table-td">{item.lastModifiedBy}</td>
                      <td className="table-td">{item.lastModifiedOn}</td>
                      <td className="table-action" onClick={() => editHandler(item)}>
                        <i className="edit-icon fa-solid fa-edit text-xl active:scale-90"></i>
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
