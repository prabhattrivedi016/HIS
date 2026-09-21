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
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  DeathDischargeDetailsFormData,
  deathDischargeDetailsSchema,
} from "@/validation/dischargeTypeDetailsSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { IpdPatientItem } from "../types";

const DeathDischargeDetails = ({
  patientDetails,
  dischargeDate,
  dischargeTime,
  refreshDischargeProcess,
}: {
  patientDetails: IpdPatientItem;
  dischargeDate: string;
  dischargeTime: string;
  refreshDischargeProcess?: () => Promise<void>;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const { branchId } = useContext(BranchContext) ?? { branchId: 1 };
  const deathCertificateStatusList = usePickMaster("DeathCertificateStatus")?.pickMasterValue ?? [];
  const { setUpdatedIpdPatientDetails } = useContext(IpdPatientDetailsContext)!;

  const relationTypeList = usePickMaster("PatientRelation")?.pickMasterValue ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(deathDischargeDetailsSchema),

    defaultValues: {
      dateOfDeath: new Date().toISOString().split("T")[0],

      timeOfDeath: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),

      causeOfDeath: "",
      certificateStatus: "",
      bodyHandoverDetails: "",
      relativeName: "",
      relationship: "",
      contactNumber: "",
      deathSummary: "",
    },
  });

  // create payload
  const createPaylaod = (formData: DeathDischargeDetailsFormData) => {
    return {
      dischargeDate: formatToDDMMYYYY(dischargeDate),
      dischargeTime: dischargeTime,
      dischargeType: dischargeProcessType?.DEATH,
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
        dateOfDeath: formData?.dateOfDeath,
        timeOfDeath: formData?.timeOfDeath,
        causeOfDeath: formData?.causeOfDeath,
        deathSummary: formData?.deathSummary,
        certificateStatus: formData?.certificateStatus,
        bodyHandoverDetails: formData?.bodyHandoverDetails,
        relativeName: formData?.relativeName,
        relationship: formData?.relationship,
        contactNumber: formData?.contactNumber,
      },
      abscondedDischargeDetails: {
        lastSeenDate: "",
        lastSeenTime: "",
        circumstances: "",
        isStaffInformed: false,
        isPoliceInformed: false,
        remarks: "",
        firNo: "",
      },
    };
  };

  const onSubmit = async (data: DeathDischargeDetailsFormData) => {
    const paylaod = createPaylaod(data);
    if (!paylaod?.dischargeDate || !paylaod?.dischargeTime) {
      showWarning("Please select discharge date and time");
      return;
    }
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.SAVE_IPD_DISCHARGE,
      paylaod,
      {},
      { component: "DeathDischargeDetails" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error which saving death discharge details");
      return;
    }

    const details = await getUpdatedIpdPatientDetails(fetchApi, branchId, patientDetails?.UHID);
    if (details) {
      setUpdatedIpdPatientDetails(details);
    }
    refreshDischargeProcess?.();
    showSuccess(resp?.message ?? "Death discharge details saved successfully");
  };

  return (
    <div className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-1 sm:p-2">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <i className="fa-solid fa-skull text-2xl" />
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 sm:text-sm">
            Death Discharge Details
          </h3>

          <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
            Complete the required discharge information.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid-4">
        {/* Death Date */}
        <InputField label="Death date" required>
          <CustomDateInput
            value={watch("dateOfDeath")}
            onChange={(value: string) => {
              setValue("dateOfDeath", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />

          {errors.dateOfDeath?.message && (
            <p className="input-field-error">{errors.dateOfDeath.message}</p>
          )}
        </InputField>

        {/* Death Time */}
        <InputField label="Death Time" required>
          <CustomTimePicker
            value={watch("timeOfDeath")}
            onChange={(value: string) => {
              setValue("timeOfDeath", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />

          {errors.timeOfDeath?.message && (
            <p className="input-field-error">{errors.timeOfDeath.message}</p>
          )}
        </InputField>

        {/* Cause of Death */}
        <InputField label="Cause of Death">
          <textarea
            rows={1}
            className="input-field"
            placeholder="Enter cause of death"
            {...register("causeOfDeath")}
          />

          {errors.causeOfDeath?.message && (
            <p className="input-field-error">{errors.causeOfDeath.message}</p>
          )}
        </InputField>

        {/* Death Certificate Status */}
        <InputField label="Death Certificate Status">
          <select className="input-field" {...register("certificateStatus")}>
            <option value="">--Select--</option>

            {deathCertificateStatusList?.map((item: PickMasterItem) => (
              <option key={item?.key} value={item?.key}>
                {item?.value}
              </option>
            ))}
          </select>

          {errors.certificateStatus?.message && (
            <p className="input-field-error">{errors.certificateStatus.message}</p>
          )}
        </InputField>

        {/* Body Handover Details */}
        <InputField label="Body handover details">
          <input
            className="input-field"
            placeholder="Enter handover details"
            {...register("bodyHandoverDetails")}
          />

          {errors.bodyHandoverDetails?.message && (
            <p className="input-field-error">{errors.bodyHandoverDetails.message}</p>
          )}
        </InputField>

        {/* Relative Name */}
        <InputField label="Relative Name" required>
          <input
            type="text"
            className="input-field"
            placeholder="Enter relative name"
            {...register("relativeName")}
          />

          {errors.relativeName?.message && (
            <p className="input-field-error">{errors.relativeName.message}</p>
          )}
        </InputField>

        {/* Relationship */}
        <InputField label="Relationship" required>
          <select className="input-field" {...register("relationship")}>
            <option value="">--Select--</option>

            {relationTypeList?.map((item: PickMasterItem) => (
              <option key={item?.key} value={item?.key}>
                {item?.value}
              </option>
            ))}
          </select>

          {errors.relationship?.message && (
            <p className="input-field-error">{errors.relationship.message}</p>
          )}
        </InputField>

        {/* Contact Number */}
        <InputField label="Contact Number">
          <input
            type="text"
            className="input-field"
            placeholder="Enter contact number"
            onInput={allowOnlyNumbers}
            {...register("contactNumber")}
            maxLength={10}
          />

          {errors.contactNumber?.message && (
            <p className="input-field-error">{errors.contactNumber.message}</p>
          )}
        </InputField>

        {/* Death Summary */}
        <InputField label="Death Summary" required>
          <textarea
            rows={2}
            className="input-field"
            placeholder="Enter death summary"
            {...register("deathSummary")}
          />

          {errors.deathSummary?.message && (
            <p className="input-field-error">{errors.deathSummary.message}</p>
          )}
        </InputField>

        {/* Save Button */}
        <div className="flex w-full flex-col items-stretch justify-end gap-2 sm:flex-row sm:items-center lg:col-start-4">
          <button type="submit" className="save-btn ">
            Submit Final Discharge
          </button>
        </div>
      </form>
      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default DeathDischargeDetails;
