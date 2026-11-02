import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import ImageDownload from "@/components/SingledrawerAndPopup/components/ImageDownload";
import ImagePreview from "@/components/SingledrawerAndPopup/components/ImagePreview";
import { ENDPOINTS } from "@/config/defaults";
import { SampleManagementDocumentTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showError, showSuccess } from "@/utils/alert";
import { formatDisplayDate } from "@/utils/dateConvertHandler";
import {
  sampleManagementDocumentUploadFormData,
  sampleManagementDocumentUploadSchema,
} from "@/validation/sampleManagementSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { DocumentNameItem, SampleManagementItem } from "../types";
import DocumentNamePopup from "./DocumentNamePopup";

const UploadDocument = React.memo(
  ({
    isOpen,
    onClose,
    data,
  }: {
    isOpen: boolean;
    onClose: () => void;
    data: SampleManagementItem | null;
  }) => {
    const { loading, fetchApi } = useGlobalApi();

    console.log("datadatadatadata", data);

    const [openPatientDocumentName, setOpenPatientDocumentName] = useState<boolean>(false);
    const [renderPatientDocumentName, setRenderPatientDocumentName] = useState<boolean>(false);

    const [documentNameList, setDocumentNameList] = useState<DocumentNameItem[]>([]);

    const [selectedDocumentName, setSelectedDocumentName] = useState<DocumentNameItem | null>(null);

    const [documentTableList, setDocumentTableList] = useState<any[]>([]);

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
      handleSubmit,
      reset,
      setValue,
      register,
      watch,
      formState: { errors },
    } = useForm({
      resolver: yupResolver(sampleManagementDocumentUploadSchema),
      defaultValues: {
        PatientInvestigationId: data?.PatientInvestigationId ?? 0,
        InvestigationDocumentNameId: 0,
        UploadFile: undefined,
      },
    });

    const selectedDocId = watch("InvestigationDocumentNameId");

    // keep selectedDocumentName in sync with selected dropdown item
    useEffect(() => {
      const docId = Number(selectedDocId || 0);
      if (docId > 0) {
        const found = documentNameList.find(d => Number(d?.documentId) === docId);
        setSelectedDocumentName(found ?? null);
      } else {
        setSelectedDocumentName(null);
      }
    }, [selectedDocId, documentNameList]);

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
    const getDocumentName = useCallback(
      async (newId?: number) => {
        const resp = await fetchApi(
          "GET",
          ENDPOINTS.GET_INVESTIGATION_DOCUMENT_NAME_MASTER,
          {},
          {},
          { component: "UploadDocument" }
        );
        const list = resp?.data ?? [];
        setDocumentNameList(list);

        if (newId && Number(newId) > 0) {
          const idNum = Number(newId);
          setValue("InvestigationDocumentNameId", idNum, { shouldValidate: true });
          const found = list.find((d: DocumentNameItem) => Number(d?.documentId) === idNum);
          if (found) {
            setSelectedDocumentName(found);
          }
        }
      },
      [setValue]
    );

    // all investigation of a patient
    const getPatientInvestigation = async (patientInvestigationId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_INVESTIGATION_DOCUMENT_LIST,
        {},
        { params: { patientInvestigationId } },
        { component: "UploadDocument" }
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
    const deleteHandler = async (item: any) => {
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

    // document name handler (handles create when not selected, update when selected)
    const documentNameHandler = () => {
      const docId = Number(watch("InvestigationDocumentNameId") || 0);
      if (docId > 0) {
        const found =
          documentNameList.find(d => Number(d?.documentId) === docId) ?? selectedDocumentName;
        setSelectedDocumentName(found ?? null);
      } else {
        setSelectedDocumentName(null);
      }
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

    if (!data) {
      return null;
    }

    return (
      <CentralPopup
        title="Upload Document"
        isOpen={isOpen}
        onClose={onClose}
        className="w-full lg:min-w-250"
      >
        <div>
          {/* Patient Info*/}
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
          </div>
          {/* FORM */}
          <form className="form-grid-4 card -mt-3" onSubmit={handleSubmit(onsubmit)}>
            {/* Sample Remark */}
            <InputField label="Investigation">
              <input className="input-field cursor-not-allowed" readOnly value={data?.Name} />
            </InputField>

            <InputField label="Document Name">
              <div className="flex gap-2 items-center ">
                <select
                  className="input-field"
                  {...register("InvestigationDocumentNameId", {
                    valueAsNumber: true,
                    onChange: e => {
                      const val = Number(e.target.value || 0);
                      const found = documentNameList.find(d => Number(d?.documentId) === val);
                      setSelectedDocumentName(found ?? null);
                    },
                  })}
                >
                  <option value={0}>Select</option>
                  {documentNameList?.map(d => (
                    <option key={d?.documentId} value={Number(d?.documentId)}>
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
                  setValue("UploadFile", e.target.files?.[0] as any, { shouldValidate: true });
                }}
              />
              {errors.UploadFile && (
                <p className="input-field-error">{errors.UploadFile.message as string}</p>
              )}
            </InputField>

            {/* Buttons */}
            <div className="flex flex-row gap-3 justify-center items-center mt-4">
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
      </CentralPopup>
    );
  }
);

export default UploadDocument;
