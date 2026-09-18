import { getUpdatedIpdPatientDetails } from "@/api/globalApiCall";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { dischargeProcessType } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { IpdPatientDetailsContext } from "@/context/IpdPatientDetailsContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess } from "@/utils/alert";
import {
  NormalDischargeDetailsFormData,
  normalDischargeDetailsSchema,
} from "@/validation/dischargeTypeDetailsSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DepartmentItem, DoctorItem, IpdPatientItem } from "../types";

const NormalDischargeDetails = ({ patientDetails }: { patientDetails: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();
  const [doctorDepartmentId, setDoctorDepartmentId] = useState<number>(
    patientDetails?.PrimaryDoctorDepartmentId ?? 0
  );
  const conditonAtDischargeList = usePickMaster("ConditionAtDischarge")?.pickMasterValue ?? [];

  const { branchId } = useContext(BranchContext);

  const { setUpdatedIpdPatientDetails } = useContext(IpdPatientDetailsContext)!;

  // department
  const getDoctorDepartmentList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST,
      {},
      { params: { isActive: 1 } },
      { component: "NormalDischargeDetails" }
    );
    return resp?.data ?? [];
  };

  const { data: departmentList = [] } = useQuery({
    queryKey: ["getDoctorDepartmentList"],
    queryFn: getDoctorDepartmentList,
  });

  // doctor
  const getDoctorList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      { params: { doctorDepartmentId, isActive: 1 } },
      { component: "NormalDischargeDetails" }
    );

    return resp?.data ?? [];
  };

  const { data: doctorList = [] } = useQuery({
    queryKey: ["getDoctorList", doctorDepartmentId],
    queryFn: getDoctorList,
    enabled: doctorDepartmentId > 0,
  });

  const {
    setValue,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(normalDischargeDetailsSchema),
    defaultValues: {
      conditionAtDischarge: "",
      followUpDate: "",
      followUpDepartmentId: patientDetails?.PrimaryDoctorDepartmentId,
      followUpDoctorId: patientDetails?.PrimaryDoctorId,
      dischargeAdvice: "",
    },
  });

  // auto-select department once department list loads
  useEffect(() => {
    if (departmentList.length > 0 && patientDetails?.PrimaryDoctorDepartmentId) {
      setDoctorDepartmentId(patientDetails.PrimaryDoctorDepartmentId);
      setValue("followUpDepartmentId", patientDetails.PrimaryDoctorDepartmentId);
    }
  }, [departmentList]);

  // auto-select doctor once doctor list loads
  useEffect(() => {
    if (doctorList.length > 0 && patientDetails?.PrimaryDoctorId) {
      setValue("followUpDoctorId", patientDetails.PrimaryDoctorId);
    }
  }, [doctorList]);

  // department select handler
  const departmentSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setDoctorDepartmentId(value);
    setValue("followUpDepartmentId", value);
  };

  // create paylaod
  const createPaylaod = (formData: NormalDischargeDetailsFormData) => {
    return {
      dischargeDate: new Date().toISOString().split("T")[0],
      dischargeTime: new Date().toTimeString().slice(0, 5),
      dischargeType: dischargeProcessType?.NORMAL,
      bedId: patientDetails?.BedId,
      visitId: patientDetails?.VisitId,
      normalDischargeDetails: {
        conditionAtDischarge: formData?.conditionAtDischarge,
        dischargeAdvice: formData?.dischargeAdvice,
        followUpDate: formData?.followUpDate,
        followUpDepartmentId: formData?.followUpDepartmentId,
        followUpDoctorId: formData?.followUpDoctorId,
      },
      lamaDischargeDetails: {
        reason: "string",
        isRiskExplained: true,
        declarationText: "string",
        counsellingByDoctorId: 0,
        relativeName: "string",
        relationship: "string",
        signatureFilePath: "string",
        isOtpVerified: true,
        otpVerifiedOn: "string",
      },
      transferDischargeDetails: {
        transferHospitalName: "string",
        transferReason: "string",
        conditionAtTransfer: "string",
        isAmbulanceRequired: true,
        accompanyingStaffUserId: 0,
        referralLetterFilePath: "string",
      },
      deathDischargeDetails: {
        dateOfDeath: "string",
        timeOfDeath: "string",
        causeOfDeath: "string",
        deathSummary: "string",
        certificateStatus: "string",
        bodyHandoverDetails: "string",
        relativeName: "string",
        relationship: "string",
        contactNumber: "string",
      },
      abscondedDischargeDetails: {
        lastSeenDate: "string",
        lastSeenTime: "string",
        circumstances: "string",
        isStaffInformed: true,
        isPoliceInformed: true,
        remarks: "string",
        firNo: "string",
      },
    };
  };

  const onSubmit = async (data: NormalDischargeDetailsFormData) => {
    const paylaod = createPaylaod(data);
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.SAVE_IPD_DISCHARGE,
      paylaod,
      {},
      { component: "NormalDischargeDetails" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error which saving normal discharge details");
      return;
    }

    const details = await getUpdatedIpdPatientDetails(fetchApi, branchId, patientDetails?.UHID);
    if (details) {
      setUpdatedIpdPatientDetails(details);
    }
    showSuccess(resp?.message ?? "Normal discharge details saved successfully");
  };

  return (
    <div className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-1 sm:p-2">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <i className="fa-solid fa-house-medical text-2xl" />
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 sm:text-sm">
            Normal Discharge Details
          </h3>

          <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
            Complete the required discharge information.
          </p>
        </div>
      </div>

      {/* Second section content */}
      <form className="form-grid-4" onSubmit={handleSubmit(onSubmit)}>
        <InputField label="Condition at Discharge" required>
          <select className="input-field" {...register("conditionAtDischarge")}>
            <option value="">Select condition</option>
            {conditonAtDischargeList.map((c: PickMasterItem) => (
              <option key={c?.key} value={c?.key}>
                {c?.value}
              </option>
            ))}
          </select>
          {errors?.conditionAtDischarge && (
            <p className="input-field-error">{errors?.conditionAtDischarge?.message}</p>
          )}
        </InputField>

        <InputField label="Follow Up Date">
          <CustomDateInput
            value={watch("followUpDate")}
            onChange={(value: string) => {
              setValue("followUpDate", value, { shouldValidate: true });
            }}
          />
        </InputField>

        <InputField label="Follow Up Department" required>
          <select
            className="input-field"
            {...register("followUpDepartmentId")}
            onChange={departmentSelectHandler}
          >
            <option value={0}>Select department</option>
            {departmentList.map((d: DepartmentItem) => (
              <option key={d?.departmentId} value={d?.departmentId}>
                {d?.department}
              </option>
            ))}
          </select>
          {errors?.followUpDepartmentId && (
            <p className="input-field-error">{errors?.followUpDepartmentId?.message}</p>
          )}
        </InputField>

        <InputField label="Follow Up Doctor" required>
          <select className="input-field" {...register("followUpDoctorId")}>
            <option value={0}>Select Doctor</option>
            {doctorList.map((d: DoctorItem) => (
              <option key={d?.doctorId} value={d?.doctorId}>
                {d?.name}
              </option>
            ))}
          </select>
          {errors?.followUpDoctorId && (
            <p className="input-field-error">{errors?.followUpDoctorId?.message}</p>
          )}
        </InputField>

        <InputField label="Discharge Advice">
          <textarea
            rows={2}
            className="input-field"
            placeholder="Enter discharge advice"
            {...register("dischargeAdvice")}
          />
        </InputField>

        {/* Save Button - same row as Discharge Advice */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full lg:col-start-4">
          <button type="submit" className="save-btn lg:w-30">
            Save
          </button>
        </div>
      </form>
      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default NormalDischargeDetails;
