import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { SampleManagementDocumentTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  InvestigationItem,
  PatientAllInvestigationItem,
} from "@/screens/InvestigationResultEntry/types";
import { LabResultEntryTableData } from "@/screens/labResultEntry/types";
import { RadiologyTableItem } from "@/screens/resultEntryRadiology/types";
import { SampleManagementTableData } from "@/screens/sampleManagement/types";
import { showError, showSuccess } from "@/utils/alert";
import { formatDisplayDate } from "@/utils/dateConvertHandler";
import {
  sampleManagementDocumentUploadFormData,
  sampleManagementDocumentUploadSchema,
} from "@/validation/sampleManagementSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { DocumentNameItem, SampleManagementDocumentTableItem } from "../types";
import DocumentNamePopup from "./DocumentNamePopup";
import ImageDownload from "./ImageDownload";
import ImagePreview from "./ImagePreview";

const SampleManagementPatientDocument = React.memo(
  ({
    isOpen,
    onClose,
    data,
  }: {
    isOpen: boolean;
    onClose: () => void;
    data:
      | SampleManagementTableData
      | LabResultEntryTableData
      | InvestigationItem
      | PatientAllInvestigationItem
      | RadiologyTableItem
      | null;
  }) => {
    const { loading, fetchApi } = useGlobalApi();

    const [openPatientDocumentName, setOpenPatientDocumentName] = useState<boolean>(false);
    const [renderPatientDocumentName, setRenderPatientDocumentName] = useState<boolean>(false);

    const [documentNameList, setDocumentNameList] = useState<DocumentNameItem[]>([]);

    const [selectedDocumentName, setSelectedDocumentName] = useState<DocumentNameItem | null>(null);

    const [documentTableList, setDocumentTableList] = useState<SampleManagementDocumentTableItem[]>(
      []
    );

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
      handleSubmit,
      reset,
      setValue,
      register,
      formState: { errors },
    } = useForm({
      resolver: yupResolver(sampleManagementDocumentUploadSchema),
      defaultValues: {
        PatientInvestigationId: data?.PatientInvestigationId,
        InvestigationDocumentNameId: 0,
        UploadFile: File,
      },
    });
    // reset on mount
    useEffect(() => {
      if (data?.PatientInvestigationId) {
        reset({
          PatientInvestigationId: data.PatientInvestigationId,
          InvestigationDocumentNameId: 0,
          UploadFile: undefined,
        });
      }
    }, [data?.PatientInvestigationId, reset]);

    // document name
    const getDocumentName = useCallback(async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_INVESTIGATION_DOCUMENT_NAME_MASTER,
        {},
        {},
        { component: "SampleManagementPatientDocument" }
      );
      setDocumentNameList(resp?.data ?? []);
    }, []);

    // all investigation of a patient
    const getPatientInvestigation = async (patientInvestigationId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_INVESTIGATION_DOCUMENT_LIST,
        {},
        { params: { patientInvestigationId } },
        { component: "SampleManagementPatientDocument" }
      );
      setDocumentTableList(resp?.data ?? []);
    };

    useEffect(() => {
      getDocumentName();

      if (data) {
        getPatientInvestigation(data?.PatientInvestigationId);
      }
    }, [data?.PatientInvestigationId]);

    const onsubmit = async (formData: sampleManagementDocumentUploadFormData) => {
      const form = new FormData();

      form.append("PatientInvestigationId", String(formData.PatientInvestigationId));

      form.append("InvestigationDocumentNameId", String(formData.InvestigationDocumentNameId));

      if (formData.UploadFile) {
        form.append("UploadFile", formData.UploadFile as File);
      }

      try {
        const resp = await fetchApi(
          "POST",
          ENDPOINTS.INSERT_PATIENT_INVESTIGATION_DOCUMENT,
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
          { component: "Document Upload" }
        );

        if (!resp?.result) {
          setErrorMessage(resp?.message ?? "Something went wrong");
          setSuccessMessage("");
          return;
        }

        setSuccessMessage(resp?.message ?? "File uploaded successfully");
        setErrorMessage("");

        reset({
          PatientInvestigationId: formData.PatientInvestigationId,
          InvestigationDocumentNameId: 0,
          UploadFile: undefined,
        });

        // Clear selected document name and refresh document list
        setSelectedDocumentName(null);

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        if (formData.PatientInvestigationId) {
          await getPatientInvestigation(formData.PatientInvestigationId);
        }
      } catch (err) {
        console.error(err);
      }
    };

    useScrollLock(isOpen);

    // cancel handler
    const cancelHandler = () => {
      reset({
        PatientInvestigationId: data?.PatientInvestigationId,
        InvestigationDocumentNameId: 0,
        UploadFile: undefined,
      });

      // Clear selected document name
      setSelectedDocumentName(null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    // delete handler
    const deleteHandler = async (item: SampleManagementDocumentTableItem) => {
      setErrorMessage("");
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.DELETE_PATIENT_INVESTIGATION_DOCUMENT,
        {},
        {
          params: {
            patientDocumentId: item?.InvestigationDocumentId,
            patientInvestigationId: item?.PatientInvestigationId,
          },
        },
        { component: "SampleRemarkForAllPatients" }
      );
      if (!resp?.result) {
        showError(resp?.message ?? "Something went wrong");

        return;
      }
      showSuccess(resp?.message ?? "Data deleted successfully");
      await getPatientInvestigation(data?.PatientInvestigationId);
    };

    // document name handler
    const documentNameHandler = () => {
      setOpenPatientDocumentName(true);
      setRenderPatientDocumentName(true);
    };

    // document name close handler
    const documentNameCloseHandler = useCallback(() => {
      setOpenPatientDocumentName(false);
    }, []);

    // success and error message
    useEffect(() => {
      if (successMessage) {
        const timer = setTimeout(() => {
          setSuccessMessage("");
        }, 1000);

        return () => clearTimeout(timer);
      }
    }, [successMessage]);

    return (
      <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />

        <div
          className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-250 ${isOpen ? "opacity-full" : ""}`}
        >
          <div className="popup-header">
            <h2 className="popup-helper-text">Add Report</h2>
            <button onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>
          <div>
            {errorMessage && <ErrorMessage text={errorMessage} />}
            {successMessage && <SuccessMessage text={successMessage} />}
          </div>
          {/* Patient Info
          <div className="card m-1 form-grid-2">
            <div className="flex flex-row">
              <h1 className="name-header">UHID :</h1>
              <span className="ml-2">{data?.UHID}</span>
            </div>

            <div className="flex flex-row">
              <h1 className="name-header">Test Name :</h1>
              <span className="ml-2">{data?.Name}</span>
            </div>

            <div className="flex flex-row">
              <h1 className="name-header">Patient Name :</h1>
              <span className="ml-2">{data?.PatientName}</span>
            </div>

            <div className="flex flex-row">
              <h1 className="name-header">Bar Code:</h1>
              <span className="ml-2">{data?.Barcode}</span>
            </div>
          </div> */}
          {/* FORM */}
          <form className="form-grid-4 card" onSubmit={handleSubmit(onsubmit)}>
            {/* Sample Remark */}
            <InputField label="Investigation">
              <select className="input-field">
                <option value={0}>Select</option>
                <option value={49115}>KIDNEY BIOPSY FOR IMMUNOFLUORESCENCE</option>
                <option value={49113}>ERYTHROPOIETIN (EPO)</option>
                <option value={49114}>HUMAN GROWTH HORMONE (GH)</option>
                <option value={49111}>MRI ABDOMEN</option>
                <option value={49112}>ALBUMIN (FLUID)</option>
              </select>
            </InputField>

            <InputField label="Document Name">
              <div className="flex gap-2 items-center ">
                <select className="input-field" {...register("InvestigationDocumentNameId")}>
                  <option>Select</option>
                  {documentNameList?.map(d => (
                    <option key={d?.documentId} value={d?.documentId}>
                      {d?.name}
                    </option>
                  ))}
                </select>
                <button className="-mt-1.5" type="button" onClick={() => documentNameHandler()}>
                  <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
                </button>
              </div>
              {errors.InvestigationDocumentNameId && (
                <p className="input-field-error">{errors.InvestigationDocumentNameId.message}</p>
              )}
            </InputField>

            {/* document */}
            <InputField label="Upload Document">
              <input
                ref={fileInputRef}
                type="file"
                className="file-upload"
                onChange={e => {
                  setValue("UploadFile", e.target.files?.[0]!);
                }}
              />
            </InputField>

            {/* Buttons */}
            <div className="flex flex-row gap-3 justify-center items-center -mx-1 mt-1">
              <button type="submit" className="save-btn">
                Upload
              </button>
              <button type="button" className="cancel-button" onClick={cancelHandler}>
                Cancel
              </button>
            </div>
          </form>
          {/* table */}
          <div className=" -mt-3 m-1  ">
            <div className="table-container  ">
              <div className="table-scroll-wrapper ">
                <div className="table-size lg:min-h-60 lg:max-h-110">
                  <table className="base-table ">
                    <thead className="table-head">
                      <tr>
                        {SampleManagementDocumentTableHeader.map((h, index) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {documentTableList.length === 0 ? (
                        <tr>
                          <td
                            colSpan={SampleManagementDocumentTableHeader.length}
                            className="table-empty text-center py-4"
                          >
                            No records found
                          </td>
                        </tr>
                      ) : (
                        documentTableList.map((item, idx) => (
                          <tr key={idx} className="table-row">
                            <td className="table-td">{idx + 1}</td>
                            <td className="table-td">{item?.InvestigationDocumentName || "-"}</td>
                            <td className="table-td">{formatDisplayDate(item?.UploadOn) || "-"}</td>
                            <td className="table-td">{item?.UploadedBy || "-"}</td>

                            <td className="table-td">
                              {<ImagePreview pathName={item?.UploadFileLocation} />}
                            </td>
                            <td className="table-td">
                              <ImageDownload pathName={item?.UploadFileLocation} />
                            </td>

                            <td className="table-td" onClick={() => deleteHandler(item)}>
                              <i className="fa-solid fa-trash icon-color-delete" />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {loading && <CustomLoader isLoading={loading} />}
        </div>

        {/*patient document */}
        {!!renderPatientDocumentName ? (
          <DocumentNamePopup
            isOpen={openPatientDocumentName}
            onClose={documentNameCloseHandler}
            refreshName={getDocumentName}
            doc={selectedDocumentName}
          />
        ) : (
          <></>
        )}
      </div>
    );
  }
);

export default SampleManagementPatientDocument;
