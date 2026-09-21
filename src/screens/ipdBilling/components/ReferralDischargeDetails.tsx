import { getUpdatedIpdPatientDetails, uploadFile } from "@/api/globalApiCall";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { dischargeProcessType } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { IpdPatientDetailsContext } from "@/context/IpdPatientDetailsContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import {
  ReferralDischargeDetailsFormData,
  referralDischargeDetailsSchema,
} from "@/validation/dischargeTypeDetailsSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { IpdPatientItem, userMasterItem } from "../types";

const ReferralDischargeDetails = ({
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
  const { setUpdatedIpdPatientDetails } = useContext(IpdPatientDetailsContext)!;

  const [showValidationError, setShowValidationError] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>("");

  // Users list
  const getUsersList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.USER_MASTER_LIST,
      {},
      {},
      { component: "ReferralDischargeDetails" }
    );

    return resp?.data ?? [];
  };

  const { data: usersList = [] } = useQuery({
    queryKey: ["getUsersList"],
    queryFn: getUsersList,
  });

  const conditonAtDischargeList = usePickMaster("ConditionAtDischarge")?.pickMasterValue ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(referralDischargeDetailsSchema),

    defaultValues: {
      transferHospitalName: "",
      transferReason: "",
      conditionAtTransfer: "",
      isAmbulanceRequired: false,
      accompanyingStaffUserId: 0,
      referralLetterFilePath: "",
    },
  });

  // Referral letter change handler
  const referralLetterChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setShowValidationError("");

    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const fileSize = selectedFile.size / (1024 * 1024);

    if (fileSize > 2) {
      setShowValidationError("File size must be less than 2MB");
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // File upload handler
  const handleFileUpload = async () => {
    setShowValidationError("");

    if (!file) {
      setShowValidationError("Please select a file");
      return;
    }

    const resp = await uploadFile(fetchApi, file, "ReferralDischargeDetails");

    if (!resp?.filePath) {
      setShowValidationError("File upload failed");
      return;
    }

    setFilePath(resp.filePath);

    setValue("referralLetterFilePath", resp.filePath, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setFile(null);
  };

  const createPaylaod = (formData: ReferralDischargeDetailsFormData) => {
    return {
      dischargeDate: formatToDDMMYYYY(dischargeDate),
      dischargeTime: dischargeTime,
      dischargeType: dischargeProcessType?.REFERRAL,
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
        transferHospitalName: formData?.transferHospitalName,
        transferReason: formData?.transferReason,
        conditionAtTransfer: formData?.conditionAtTransfer,
        isAmbulanceRequired: formData?.isAmbulanceRequired,
        accompanyingStaffUserId: formData?.accompanyingStaffUserId,
        referralLetterFilePath: formData?.referralLetterFilePath,
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

  // Submit handler
  const onSubmit = async (data: ReferralDischargeDetailsFormData) => {
    const payload = createPaylaod(data);
    if (!payload?.dischargeDate || !payload?.dischargeTime) {
      showWarning("Please select discharge date and time");
      return;
    }
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.SAVE_IPD_DISCHARGE,
      payload,
      {},
      { component: "ReferralDischargeDetails" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error which saving referral discharge details");
      return;
    }

    const details = await getUpdatedIpdPatientDetails(fetchApi, branchId, patientDetails?.UHID);
    if (details) {
      setUpdatedIpdPatientDetails(details);
    }
    refreshDischargeProcess?.();
    showSuccess(resp?.message ?? "Referral discharge details saved successfully");
  };

  return (
    <div className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-1 sm:p-2">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <i className="fa-solid fa-truck-medical text-2xl" />
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 sm:text-sm">
            Referral Discharge Details
          </h3>

          <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
            Complete the required discharge information.
          </p>
        </div>
      </div>

      <form className="form-grid-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Transfer Hospital */}
        <InputField label="Transfer Hospital Name" required>
          <input
            {...register("transferHospitalName")}
            className="input-field"
            type="text"
            placeholder="Enter hospital name"
          />

          {errors.transferHospitalName?.message && (
            <p className="input-field-error">{errors.transferHospitalName.message}</p>
          )}
        </InputField>

        {/* Transfer Reason */}
        <InputField label="Transfer Reason" required>
          <input
            {...register("transferReason")}
            className="input-field"
            type="text"
            placeholder="Enter reason for transfer"
          />

          {errors.transferReason?.message && (
            <p className="input-field-error">{errors.transferReason.message}</p>
          )}
        </InputField>

        {/* Condition */}
        <InputField label="Condition at Transfer" required>
          <select className="input-field" {...register("conditionAtTransfer")}>
            <option value="">Select condition</option>

            {conditonAtDischargeList.map((c: PickMasterItem) => (
              <option key={c?.key} value={c?.key}>
                {c?.value}
              </option>
            ))}
          </select>

          {errors.conditionAtTransfer?.message && (
            <p className="input-field-error">{errors.conditionAtTransfer.message}</p>
          )}
        </InputField>

        {/* Ambulance */}
        <InputField label="Ambulance Required" required>
          <select
            className="input-field"
            {...register("isAmbulanceRequired", {
              setValueAs: value => {
                if (value === "") {
                  return undefined;
                }

                return value === "true";
              },
            })}
          >
            <option value="">--Select--</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          {errors.isAmbulanceRequired?.message && (
            <p className="input-field-error">{errors.isAmbulanceRequired.message}</p>
          )}
        </InputField>

        {/* Accompanying Staff - OPTIONAL */}
        <InputField label="Accompanying Staff">
          <select
            className="input-field"
            {...register("accompanyingStaffUserId", {
              setValueAs: value => {
                if (value === "") {
                  return null;
                }

                return Number(value);
              },
            })}
          >
            <option value="">--Select--</option>

            {usersList
              ?.filter((user: userMasterItem) => user?.isActive === 1)
              .map((u: userMasterItem) => (
                <option key={u?.id} value={u?.id}>
                  {u?.userName}
                </option>
              ))}
          </select>

          {errors.accompanyingStaffUserId?.message && (
            <p className="input-field-error">{errors.accompanyingStaffUserId.message}</p>
          )}
        </InputField>

        {/* Referral Letter - OPTIONAL */}
        <InputField label="Referral Letter">
          <div className="flex items-center gap-2">
            <input type="file" className="file-upload" onChange={referralLetterChangeHandler} />

            <button type="button" className="upload-file-btn !w-[100px]" onClick={handleFileUpload}>
              Upload
            </button>
          </div>

          {/* Actual file validation error */}
          {showValidationError && <p className="input-field-error">{showValidationError}</p>}

          {filePath && <p className="mt-1 text-sm text-gray-500">{filePath}</p>}
        </InputField>

        {/* Save */}
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

export default ReferralDischargeDetails;
