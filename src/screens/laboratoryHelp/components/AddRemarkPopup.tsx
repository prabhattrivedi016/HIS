import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import EditIconButton from "@/components/globalButtons/EditIconButton";
import RemoveIconButton from "@/components/globalButtons/RemoveIconButton";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import {
  sampleManagementRemarksFormData,
  sampleManagementRemarksSchema,
} from "@/validation/sampleManagementSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SampleRemarksItem, SampleRemarkTableDataItem } from "../types";

const AddRemarkPopup = React.memo(
  ({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: any }) => {
    const { loading, fetchApi } = useGlobalApi();
    const [sampleRemarksList, setSampleRemarksList] = useState<SampleRemarksItem[]>([]);
    const [sampleRemarkTableData, setSampleRemarkTableData] = useState<SampleRemarkTableDataItem[]>(
      []
    );

    // sample remarks

    const getSampleRemarks = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_SAMPLE_REMARKS_MASTER,
        {},
        { params: { isActive: 1 } },
        { component: "SampleRemarkForAllPatients" }
      );
      setSampleRemarksList(resp?.data ?? []);
    };

    // patient remarks
    const getPatientRemarks = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_INVESTIGATION_REMARK,
        {},
        { params: { patientInvestigationId: data?.PatientInvestigationId } },
        { component: "SampleRemarkForAllPatients" }
      );
      if (!resp?.result) {
        showWarning(resp?.message ?? "No data found");
        setSampleRemarkTableData([]);
        return;
      }

      setSampleRemarkTableData(resp?.data ?? []);
    };

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

    useEffect(() => {
      if (data) {
        getSampleRemarks();
        getPatientRemarks();
        if (data?.PatientInvestigationId) {
          setValue("patientInvestigationId", data.PatientInvestigationId);
        }
      }
    }, [data]);

    // select remark handler to set both id and name
    const selectRemarksHandler = (e: ChangeEvent<HTMLSelectElement>) => {
      const value = Number(e.target.value);
      const selected = sampleRemarksList.find(s => s.sampleRemarksID === value);
      setValue("testCommentId", value || 0, { shouldValidate: true });
      setValue("testComment", selected?.sampleRemarks ?? "", { shouldValidate: true });
    };

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

    //   delete handler
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
      await getPatientRemarks();
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
      await getPatientRemarks();
    };

    return (
      <CentralPopup
        title="Add Remarks"
        isOpen={isOpen}
        onClose={onClose}
        className="w-full lg:min-w-250"
      >
        <div>
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
            {/* Hidden fields */}
            <input type="hidden" {...register("id")} />
            <input type="hidden" {...register("patientInvestigationId")} />
            <input type="hidden" {...register("testComment")} />

            {/* Sample Remark */}
            <InputField label="Sample Remark">
              <select
                className="input-field"
                {...register("testCommentId", {
                  valueAsNumber: true,
                  onChange: selectRemarksHandler,
                })}
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
              {errors.testComment && (
                <p className="input-field-error">{errors.testComment.message}</p>
              )}
            </InputField>

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
              <select className="input-field" {...register("isInternal", { valueAsNumber: true })}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </InputField>

            {/* Buttons */}
            <div className="flex flex-row gap-3 justify-center items-center mt-4">
              <button type="submit" className="save-btn">
                Save
              </button>
              <button type="button" onClick={cancelHandler} className="cancel-button">
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
                        <th className="table-th">#</th>
                        <th className="table-th">Sample Remark</th>
                        <th className="table-th">Remark</th>
                        <th className="table-th">Remark Date</th>
                        <th className="table-th">Create By</th>
                        <th className="table-th">Is Internal</th>
                        <th className="table-th">Edit</th>
                        <th className="table-th">Delete</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sampleRemarkTableData.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="table-empty text-center py-4">
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

                            <td className="table-td">
                              <EditIconButton onClick={() => editHandler(item)} />
                            </td>
                            <td className="table-td">
                              <RemoveIconButton onClick={() => deleteHandler(item)} />
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
      </CentralPopup>
    );
  }
);

export default AddRemarkPopup;
