import { getUpdatedIpdPatientDetails } from "@/api/globalApiCall";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CustomTimePicker from "@/components/timePicker";
import { ENDPOINTS } from "@/config/defaults";
import { dischargeProcessType } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { IpdPatientDetailsContext } from "@/context/IpdPatientDetailsContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import {
  AbscondedDischargeDetailsFormData,
  abscondedDischargeDetailsSchema,
} from "@/validation/dischargeTypeDetailsSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { IpdPatientItem } from "../types";

const AbscondedDischargeDetails = ({ patientDetails }: { patientDetails: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();
  const { branchId } = useContext(BranchContext) ?? { branchId: 1 };
  const { setUpdatedIpdPatientDetails } = useContext(IpdPatientDetailsContext)!;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(abscondedDischargeDetailsSchema),
    defaultValues: {
      lastSeenDate: new Date().toISOString().split("T")[0],
      lastSeenTime: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      circumstances: "",
      isStaffInformed: false,
      isPoliceInformed: false,
      remarks: "",
      firNo: "",
    },
  });

  // create payload
  const createPayload = (formData: AbscondedDischargeDetailsFormData) => {
    return {
      dischargeDate: formData?.lastSeenDate,
      dischargeTime: formData?.lastSeenTime,
      dischargeType: dischargeProcessType?.ABSCONDED,
      bedId: patientDetails?.BedId,
      visitId: patientDetails?.VisitId,
      normalDischargeDetails: {
        conditionAtDischarge: "",
        dischargeAdvice: "",
        followUpDate: "",
        followUpDepartmentId: 0,
        followUpDoctorId: 0,
      },
      lamaDischargeDetails: {
        reason: "",
        isRiskExplained: false,
        declarationText: "",
        counsellingByDoctorId: 0,
        relativeName: "",
        relationship: "",
        signatureFilePath: "",
        isOtpVerified: false,
        otpVerifiedOn: "",
      },
      transferDischargeDetails: {
        transferHospitalName: "",
        transferReason: "",
        conditionAtTransfer: "",
        isAmbulanceRequired: false,
        accompanyingStaffUserId: 0,
        referralLetterFilePath: "",
      },
      deathDischargeDetails: {
        dateOfDeath: "",
        timeOfDeath: "",
        causeOfDeath: "",
        deathSummary: "",
        certificateStatus: "",
        bodyHandoverDetails: "",
        relativeName: "",
        relationship: "",
        contactNumber: "",
      },
      abscondedDischargeDetails: {
        lastSeenDate: formData?.lastSeenDate,
        lastSeenTime: formData?.lastSeenTime,
        circumstances: formData?.circumstances,
        isStaffInformed: formData?.isStaffInformed,
        isPoliceInformed: formData?.isPoliceInformed,
        remarks: formData?.remarks,
        firNo: formData?.firNo,
      },
    };
  };

  const onSubmit = async (data: AbscondedDischargeDetailsFormData) => {
    const payload = createPayload(data);
    console.log("payload", payload);
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.SAVE_IPD_DISCHARGE,
      payload,
      {},
      { component: "AbscondedDischargeDetails" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error which saving absconded discharge details");
      return;
    }

    const details = await getUpdatedIpdPatientDetails(fetchApi, branchId, patientDetails?.UHID);
    if (details) {
      setUpdatedIpdPatientDetails(details);
    }
    showSuccess(resp?.message ?? "Absconded discharge details saved successfully");
  };

  return (
    <div className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-1 sm:p-2">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <i className="fa-solid fa-person-running text-2xl" />
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 sm:text-sm">
            Absconded Discharge Details
          </h3>

          <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
            Complete the required discharge information.
          </p>
        </div>
      </div>

      {/* Second section content */}

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid-4">
        <InputField label="Last Seen Date" required>
          <CustomDateInput
            value={watch("lastSeenDate")}
            onChange={(value: string) => {
              setValue("lastSeenDate", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />

          {errors.lastSeenDate?.message && (
            <p className="input-field-error">{errors.lastSeenDate.message}</p>
          )}
        </InputField>

        <InputField label="Last Seen Time" required>
          <CustomTimePicker
            value={watch("lastSeenTime")}
            onChange={(value: string) => {
              setValue("lastSeenTime", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />

          {errors.lastSeenTime?.message && (
            <p className="input-field-error">{errors.lastSeenTime.message}</p>
          )}
        </InputField>

        <InputField label="Circumstances" required>
          <textarea
            rows={1}
            className="input-field"
            placeholder="Enter cause of death"
            {...register("circumstances")}
          />

          {errors.circumstances?.message && (
            <p className="input-field-error">{errors.circumstances.message}</p>
          )}
        </InputField>

        <InputField label="Staff Informed">
          <select
            className="input-field"
            {...register("isStaffInformed", {
              setValueAs: value => value === "true",
            })}
          >
            <option value="">--Select--</option>
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>

          {errors.isStaffInformed?.message && (
            <p className="input-field-error">{errors.isStaffInformed.message}</p>
          )}
        </InputField>

        <InputField label="Police Informed">
          <select
            className="input-field"
            {...register("isPoliceInformed", {
              setValueAs: value => value === "true",
            })}
          >
            <option value="">--Select--</option>
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>

          {errors.isPoliceInformed?.message && (
            <p className="input-field-error">{errors.isPoliceInformed.message}</p>
          )}
        </InputField>

        <InputField label="Remarks" required>
          <textarea
            rows={2}
            className="input-field"
            placeholder="Enter remarks"
            {...register("remarks")}
          />
          {errors.remarks?.message && <p className="input-field-error">{errors.remarks.message}</p>}
        </InputField>

        <InputField label="FIR (if any)">
          <input className="input-field" placeholder="Enter FIR no." {...register("firNo")} />
        </InputField>

        {/* Save Button */}
        <div className="flex w-full flex-col items-stretch justify-end gap-2 sm:flex-row sm:items-center lg:col-start-4">
          <button type="submit" className="save-btn lg:w-30">
            Save
          </button>
        </div>
      </form>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default AbscondedDischargeDetails;
