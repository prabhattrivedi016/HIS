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
  LamaDamaDischargeDetailsFormData,
  lamaDamaDischargeDetailsSchema,
} from "@/validation/dischargeTypeDetailsSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DoctorItem, IpdPatientItem } from "../types";
import VerifyOtpPopup from "./VerifyOtpPopup";

const LamaDamaDischargeDetails = ({
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

  const [openVerifyOtpPopup, setOpenVerifyOtpPopup] = useState<boolean>(false);

  const [renderVerifyOtpPopup, setRenderVerifyOtpPopup] = useState<boolean>(false);

  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);

  const [otpVerifiedDate, setOtpVerifiedDate] = useState<string>("");

  const [showValidationError, setShowValidationError] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);

  const [filePath, setFilePath] = useState<string>("");

  const reasonForLeavingList = usePickMaster("ReasonForLeaving")?.pickMasterValue ?? [];

  const relationshipList = usePickMaster("PatientRelation")?.pickMasterValue ?? [];

  const { branchId } = useContext(BranchContext) ?? { branchId: 1 };
  const { setUpdatedIpdPatientDetails } = useContext(IpdPatientDetailsContext)!;

  // doctors lists
  const getDoctorsList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      {},
      {
        component: "LamaDamaDischargeDetails",
      }
    );

    return resp?.data ?? [];
  };

  const { data: doctorsList = [] } = useQuery({
    queryKey: ["doctor-list"],
    queryFn: getDoctorsList,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(lamaDamaDischargeDetailsSchema),

    defaultValues: {
      reason: "",
      isRiskExplained: false,
      declarationText: "",
      counsellingByDoctorId: patientDetails?.PrimaryDoctorId ?? undefined,
      relativeName: "",
      relationship: "",
      signatureFilePath: "",
    },
  });

  // primary doctor
  useEffect(() => {
    if (!doctorsList?.length) {
      return;
    }

    const matchedDoctor = doctorsList.find(
      (item: DoctorItem) => Number(item?.doctorId) === Number(patientDetails?.PrimaryDoctorId)
    );

    if (matchedDoctor?.doctorId) {
      setValue("counsellingByDoctorId", Number(matchedDoctor.doctorId), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [doctorsList, patientDetails?.PrimaryDoctorId, setValue]);

  //  signature file
  const signatureFileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
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

  // upload signature
  const handleFileUpload = async () => {
    setShowValidationError("");

    if (!file) {
      setShowValidationError("Please select a file");
      return;
    }

    const resp = await uploadFile(fetchApi, file, "LamaDamaDischargeDetails");

    if (!resp?.filePath) {
      setShowValidationError("File upload failed");
      return;
    }

    setFilePath(resp.filePath);

    setValue("signatureFilePath", resp.filePath, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setFile(null);
  };

  //  verify otp

  const handleVerifyOtp = () => {
    setOpenVerifyOtpPopup(true);
    setRenderVerifyOtpPopup(true);
  };

  const closeVerifyOtpPopup = useCallback(() => {
    setOpenVerifyOtpPopup(false);

    setTimeout(() => {
      setRenderVerifyOtpPopup(false);
    }, 300);
  }, []);

  // create payload
  const createPaylaod = (data: LamaDamaDischargeDetailsFormData) => {
    return {
      dischargeDate: formatToDDMMYYYY(dischargeDate),
      dischargeTime: dischargeTime,
      dischargeType: dischargeProcessType?.LAMA_DAMA,
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
        reason: data?.reason,
        isRiskExplained: data?.isRiskExplained,
        declarationText: data?.declarationText,
        counsellingByDoctorId: data?.counsellingByDoctorId,
        relativeName: data?.relativeName,
        relationship: data?.relationship,
        signatureFilePath: data?.signatureFilePath,
        isOtpVerified: isOtpVerified,
        otpVerifiedOn: otpVerifiedDate,
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

  // submit handler

  const onSubmit = async (data: LamaDamaDischargeDetailsFormData) => {
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
      { component: "LamaDamaDischargeDetails" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error which saving lama/dama discharge details");
      return;
    }

    const details = await getUpdatedIpdPatientDetails(fetchApi, branchId, patientDetails?.UHID);
    if (details) {
      setUpdatedIpdPatientDetails(details);
    }
    refreshDischargeProcess?.();
    showSuccess(resp?.message ?? "Lama/dama discharge details saved successfully");
  };

  return (
    <div className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-1 sm:p-2">
      {/* Header */}

      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <i className="fa-solid fa-user-plus text-2xl" />
        </div>

        <div className="flex w-full items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 sm:text-sm">
              LAMA/DAMA Discharge Details
            </h3>

            <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
              Complete the required discharge information.
            </p>
          </div>

          <div className="pr-2">
            <button type="button" className="send-otp-btn" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          </div>
        </div>
      </div>

      {/* Form */}

      <form className="form-grid-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Reason For Leaving */}

        <InputField label="Reason For Leaving" required>
          <select className="input-field" {...register("reason")}>
            <option value="">--Select--</option>

            {reasonForLeavingList.map((item: PickMasterItem) => (
              <option key={item?.key} value={item?.key}>
                {item?.value}
              </option>
            ))}
          </select>

          {errors.reason?.message && <p className="input-field-error">{errors.reason.message}</p>}
        </InputField>

        {/* Risk Explained */}

        <InputField label="Risk Explained" required>
          <select
            className="input-field"
            {...register("isRiskExplained", {
              setValueAs: value => {
                if (value === "") {
                  return false;
                }

                return value === "true";
              },
            })}
          >
            <option value="">--Select--</option>

            <option value="true">Yes</option>

            <option value="false">No</option>
          </select>

          {errors.isRiskExplained?.message && (
            <p className="input-field-error">{errors.isRiskExplained.message}</p>
          )}
        </InputField>

        {/* Counselling Done By */}

        <InputField label="Counselling Done By">
          <select
            className="input-field"
            {...register("counsellingByDoctorId", {
              setValueAs: value => {
                if (value === "") {
                  return undefined;
                }

                return Number(value);
              },
            })}
          >
            <option value="">--Select--</option>

            {doctorsList?.map((item: DoctorItem) => (
              <option key={item?.doctorId} value={item?.doctorId}>
                {item?.name}
              </option>
            ))}
          </select>

          {errors.counsellingByDoctorId?.message && (
            <p className="input-field-error">{errors.counsellingByDoctorId.message}</p>
          )}
        </InputField>

        {/* Relative Name */}

        <InputField label="Relative Name" required>
          <input
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

            {relationshipList?.map((item: PickMasterItem) => (
              <option key={item?.key} value={item?.key}>
                {item?.value}
              </option>
            ))}
          </select>

          {errors.relationship?.message && (
            <p className="input-field-error">{errors.relationship.message}</p>
          )}
        </InputField>

        {/* Signature */}

        <InputField label="Signature">
          <div className="flex items-center gap-2">
            <input
              type="file"
              className={`file-upload ${filePath ? "opacity-50" : ""}`}
              onChange={signatureFileChangeHandler}
              disabled={!!filePath}
            />

            <button
              type="button"
              className={`upload-file-btn !w-[100px] ${
                filePath ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!!filePath}
              onClick={handleFileUpload}
            >
              Upload
            </button>
          </div>

          {showValidationError && <p className="input-field-error">{showValidationError}</p>}

          {filePath && <p className="mt-1 text-sm text-gray-500">{filePath}</p>}
        </InputField>

        {/* Declaration */}

        <InputField label="Patient/Relative Decleration" required>
          <textarea
            rows={2}
            className="input-field"
            placeholder="Enter Patient/Relative Decleration"
            {...register("declarationText")}
          />

          {errors.declarationText?.message && (
            <p className="input-field-error">{errors.declarationText.message}</p>
          )}
        </InputField>

        {/* Save Button */}

        <div className="flex w-full flex-col items-stretch justify-end gap-2 sm:flex-row sm:items-center lg:col-start-4">
          <button type="submit" className="save-btn">
            Submit Final Discharge
          </button>
        </div>
      </form>

      {/* OTP Popup */}

      {renderVerifyOtpPopup && (
        <VerifyOtpPopup
          isOpen={openVerifyOtpPopup}
          onClose={closeVerifyOtpPopup}
          setIsVerifiedOtp={setIsOtpVerified}
          setOtpVerifiedDate={setOtpVerifiedDate}
        />
      )}

      {/* Loader */}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default LamaDamaDischargeDetails;
