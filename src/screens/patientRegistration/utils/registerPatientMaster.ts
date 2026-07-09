import { ENDPOINTS } from "@/config/defaults";
import { formatApiValidationMessage, getApiValidationFieldErrors } from "@/utils/errorUtils";
import { normalizePatientGenderForApi } from "../components/dobHelper";

export type RegisterPatientMasterSuccess = {
  patientId: number;
  branchId: number;
  registrationResp: Record<string, unknown>;
  patientRecord: Record<string, unknown> | null;
};

export type RegisterPatientMasterFailure = {
  reason: "gender" | "validation" | "failed";
  message: string;
  fieldErrors?: Record<string, string[] | string>;
};

export type RegisterPatientMasterResult =
  | { ok: true; data: RegisterPatientMasterSuccess }
  | { ok: false; error: RegisterPatientMasterFailure };

export const buildPatientRegistrationFormData = (
  patientRegistrationDetails: Record<string, unknown>
): { formData: FormData; normalizedGender: string } | null => {
  const normalizedGender = normalizePatientGenderForApi(
    patientRegistrationDetails?.Gender ?? patientRegistrationDetails?.gender
  );

  if (!normalizedGender) {
    return null;
  }

  const formData = new FormData();
  let hasGenderField = false;

  for (const key in patientRegistrationDetails) {
    if (key === "gender") continue;

    let value = patientRegistrationDetails[key];
    if (key === "Gender") {
      value = normalizedGender;
      hasGenderField = true;
    }

    if (value === null || value === undefined || value === "") {
      continue;
    }

    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  }

  if (!hasGenderField) {
    formData.append("Gender", normalizedGender);
  }

  return { formData, normalizedGender };
};

export const registerPatientMaster = async (
  fetchApi: (...args: any[]) => Promise<any>,
  patientRegistrationDetails: Record<string, unknown>,
  component = "Patient Registration"
): Promise<RegisterPatientMasterResult> => {
  const registrationForm = buildPatientRegistrationFormData(patientRegistrationDetails);

  if (!registrationForm) {
    return {
      ok: false,
      error: {
        reason: "gender",
        message: "Gender must be Male, Female, or Other",
        fieldErrors: {
          Gender: ["Gender must be Male, Female, or Other"],
        },
      },
    };
  }

  const registrationResp = (await fetchApi(
    "POST",
    ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,
    registrationForm.formData,
    { headers: { "Content-Type": "multipart/form-data" } },
    { component }
  )) as Record<string, unknown>;

  const apiFieldErrors = getApiValidationFieldErrors(registrationResp);
  if (Object.keys(apiFieldErrors).length > 0) {
    return {
      ok: false,
      error: {
        reason: "validation",
        message: formatApiValidationMessage(registrationResp, "Failed to register patient"),
        fieldErrors: apiFieldErrors,
      },
    };
  }

  const registrationData = registrationResp?.data as Record<string, unknown> | undefined;
  if (!registrationData) {
    return {
      ok: false,
      error: {
        reason: "failed",
        message: formatApiValidationMessage(registrationResp, "Failed to register patient"),
      },
    };
  }

  const patientId = Number(registrationData?.patientId ?? 0);
  if (!patientId) {
    return {
      ok: false,
      error: {
        reason: "failed",
        message: "Patient registration succeeded but patient ID was not returned.",
      },
    };
  }

  const patientResponse = (await fetchApi(
    "GET",
    ENDPOINTS.GET_PATIENT_MASTER,
    {},
    { params: { patientId } },
    { component }
  )) as Record<string, unknown>;

  const patientRecord = (Array.isArray(patientResponse?.data)
    ? patientResponse.data[0]
    : null) as Record<string, unknown> | null;

  if (!patientRecord) {
    return {
      ok: false,
      error: {
        reason: "failed",
        message: "Failed to fetch patient details after registration.",
      },
    };
  }

  return {
    ok: true,
    data: {
      patientId,
      branchId: Number(patientRecord?.branchId ?? registrationData?.branchId ?? 1),
      registrationResp: registrationResp,
      patientRecord,
    },
  };
};
