import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { SampleRejectionRemarkTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { RadiologyTableItem } from "@/screens/resultEntryRadiology/types";
import { SampleManagementTableData } from "@/screens/sampleManagement/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import {
  sampleManagementRemarksFormData,
  sampleManagementRemarksSchema,
} from "@/validation/sampleManagementSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SampleRemarksItem, SampleRemarkTableDataItem } from "../types";

const SampleRemarks = React.memo(
  ({
    isOpen,
    onClose,
    data,
  }: {
    isOpen: boolean;
    onClose: () => void;
    data: SampleManagementTableData | RadiologyTableItem | null;
  }) => {
    const { loading, fetchApi } = useGlobalApi();

    const [sampleRemarksList, setSampleRemarksList] = useState<SampleRemarksItem[]>([]);

    const [sampleRemarkTableData, setSampleRemarkTableData] = useState<SampleRemarkTableDataItem[]>(
      []
    );

    const {
      handleSubmit,
      reset,
      setValue,
      register,
      formState: { errors },
    } = useForm({
      resolver: yupResolver(sampleManagementRemarksSchema),
      defaultValues: {
        id: 0,
        patientInvestigationId: 0,
        testRemark: "",
        testComment: "",
        testCommentId: 0,
        isInternal: 0,
      },
    });

    // sample remarks

    const getSampleRemarks = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_SAMPLE_REMARKS_MASTER,
        {},
        { params: { isActive: Status?.ACTIVE } },
        { component: "SampleRemarkForAllPatients" }
      );
      setSampleRemarksList(resp?.data ?? []);
    };

    // patient remarks
    const getPatientRemarks = async (patientInvestigationId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_INVESTIGATION_REMARK,
        {},
        { params: { patientInvestigationId } },
        { component: "SampleRemarkForAllPatients" }
      );

      setSampleRemarkTableData(resp?.data ?? []);
    };

    useEffect(() => {
      const fetchData = async () => {
        await getSampleRemarks();

        if (data?.PatientInvestigationId != null) {
          setValue("patientInvestigationId", data.PatientInvestigationId);
          await getPatientRemarks(data.PatientInvestigationId);
        }
      };

      fetchData();
    }, [data?.PatientInvestigationId]);

    // select remark handler

    const selectRemarksHandler = (e: ChangeEvent<HTMLSelectElement>) => {
      const value = Number(e.target.value);
      if (!value) return;

      const selected = sampleRemarksList.find(s => s.sampleRemarksID === value);

      if (selected) {
        setValue("testComment", selected.sampleRemarks);
        setValue("testCommentId", selected.sampleRemarksID);
      }
    };

    // submit handler
    const onsubmit = async (formData: sampleManagementRemarksFormData) => {
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_PATIENT_INVESTIGATION_REMARK,
        formData,
        {},
        { component: "SampleRemarkForAllPatients" }
      );
      if (!resp?.result) {
        showWarning(resp?.message ?? "Something went wrong");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      reset({
        id: 0,
        patientInvestigationId: data?.PatientInvestigationId ?? 0,
        testRemark: "",
        testComment: "",
        testCommentId: 0,
        isInternal: 0,
      });
      await getPatientRemarks(data?.PatientInvestigationId);
    };

    useScrollLock(isOpen);

    // cancel handler
    const cancelHandler = () => {
      reset({
        id: 0,
        patientInvestigationId: data?.PatientInvestigationId ?? 0,
        testRemark: "",
        testComment: "",
        testCommentId: 0,
        isInternal: 0,
      });
      setValue("patientInvestigationId", data?.PatientInvestigationId);
    };

    // edit handler
    const editHandler = (item: SampleRemarkTableDataItem) => {
      reset({
        id: item?.Id,
        patientInvestigationId: item?.PatientInvestigationId ?? 0,
        testRemark: item?.testRemark,
        testComment: item?.testComment,
        testCommentId: item?.testCommentId,
        isInternal: item?.isInternal,
      });
    };

    // delete handler
    const deleteHandler = async (item: SampleRemarkTableDataItem) => {
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.DELETE_PATIENT_INVESTIGATION_REMARK,
        {},
        { params: { remarkId: item?.Id, patientInvestigationId: item?.PatientInvestigationId } },
        { component: "SampleRemarkForAllPatients" }
      );
      if (!resp?.result) {
        showError(resp?.message ?? "Something went wrong");
        return;
      }
      showSuccess(resp?.message ?? "Data deleted successfully");
      await getPatientRemarks(data?.PatientInvestigationId);
    };

    return (
      <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />

        <div
          className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-250 ${isOpen ? "opacity-full" : ""}`}
        >
          <div className="popup-header">
            <h2 className="popup-helper-text">Add Remarks</h2>
            <button onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>

          {/* Patient Info */}
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
            <input type="hidden" {...register("patientInvestigationId")} />
            {/* Sample Remark */}
            <InputField label="Sample Remark">
              <select
                className="input-field"
                {...register("testCommentId")}
                onChange={selectRemarksHandler}
              >
                <option value={0}>Select</option>
                {sampleRemarksList.map(s => (
                  <option key={s.sampleRemarksID} value={s.sampleRemarksID}>
                    {s.sampleRemarks}
                  </option>
                ))}
              </select>

              {errors.testCommentId && (
                <p className="input-field-error">{errors.testCommentId.message}</p>
              )}
            </InputField>

            {/* Hidden field for text */}
            <input type="hidden" {...register("testComment")} />

            {/* Remark Input */}
            <InputField label="Enter Remark">
              <input
                className="input-field"
                placeholder="Enter Remarks"
                {...register("testRemark")}
              />
              {errors.testRemark && (
                <p className="input-field-error">{errors.testRemark.message}</p>
              )}
            </InputField>

            {/* Is Internal */}
            <InputField label="Is Internal">
              <select className="input-field" {...register("isInternal")}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </InputField>

            {/* Buttons */}
            <div className="flex flex-row gap-3 justify-center items-center -mx-1">
              <button type="submit" className="save-btn">
                Save
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
                <div className="table-size lg:min-h-60">
                  <table className="base-table ">
                    <thead className="table-head">
                      <tr>
                        {SampleRejectionRemarkTableHeader.map((h, index) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {sampleRemarkTableData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={SampleRejectionRemarkTableHeader.length}
                            className="table-empty text-center py-4"
                          >
                            No records found
                          </td>
                        </tr>
                      ) : (
                        sampleRemarkTableData.map((item, idx) => (
                          <tr key={idx} className="table-row">
                            <td className="table-td">{idx + 1}</td>

                            <td className="table-td">{item?.testComment || "-"}</td>
                            <td className="table-td">{item?.testRemark || "-"}</td>
                            <td className="table-td">{item?.CreatedOn || "-"}</td>
                            <td className="table-td">{item?.CreatedBy || "-"}</td>

                            <td className="table-td ml-5">
                              {item?.isInternal === 0 ? "No" : "Yes"}
                            </td>

                            <td className="table-td" onClick={() => editHandler(item)}>
                              <i className="fa-solid fa-edit  icon-color-button" />
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
      </div>
    );
  }
);

export default SampleRemarks;
