import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { showError } from "@/utils/alert";

const getDoctorMaster = async (fetchApi: any, doctorId: number, component: string = "") => {
  const resolvedDoctorId = Number(doctorId) || 0;
  if (!resolvedDoctorId) return null;

  const resp = await fetchApi(
    "GET",
    ENDPOINTS.GET_DOCTOR_MASTER,
    {},
    { params: { doctorId: resolvedDoctorId } },
    { component: component }
  );
  const doctor = resp?.data?.[0];
  if (!doctor) return null;

  const resolvedValue = Number(doctor?.doctorId ?? doctor?.DoctorId ?? resolvedDoctorId) || 0;
  const resolvedLabel = String(doctor?.completeName ?? doctor?.CompleteName ?? "").trim();

  if (!resolvedValue || !resolvedLabel) return null;

  return {
    label: resolvedLabel,
    value: resolvedValue,
  };
};

// search patient by PatientId,
const getPatientDataByPatientId = async (
  fetchApi: any,
  patientId?: number,
  component: string = ""
) => {
  const resolvedPatientId = Number(patientId) || 0;
  if (!resolvedPatientId) return {};

  const resp = await fetchApi(
    "GET",
    ENDPOINTS.GET_PATIENT_MASTER,
    {},
    { params: { patientId: resolvedPatientId } },
    { component: component }
  );
  return resp?.data?.[0] ?? {};
};

// search patient by uhid
const getPatientDataByUhid = async (fetchApi: any, uhid?: number, component: string = "") => {
  const resp = await fetchApi(
    "GET",
    ENDPOINTS.GET_PATIENT_MASTER,
    {},
    { params: { uhid } },
    { component: component }
  );
  return resp?.data?.[0] ?? {};
};

// search patient by contactNumber
const getPatientDataByContact = async (
  fetchApi: any,
  contactNumber?: number,
  component: string = ""
) => {
  const resp = await fetchApi(
    "GET",
    ENDPOINTS.GET_PATIENT_MASTER,
    {},
    { params: { contactNumber } },
    { component: component }
  );
  return resp?.data?.[0] ?? {};
};

// search patient by branchId
const getPatientDataByBranchId = async (
  fetchApi: any,
  branchId?: number,
  component: string = ""
) => {
  const resp = await fetchApi(
    "GET",
    ENDPOINTS.GET_PATIENT_MASTER,
    {},
    { params: { branchId } },
    { component: component }
  );
  return resp?.data?.[0] ?? {};
};

// corporate master
const getCorporateMaster = async (fetchApi: any, component: string) => {
  const resp = await fetchApi(
    "GET",
    ENDPOINTS.GET_CORPORATE_MASTER_LIST,
    {},
    { params: { isActive: Status?.ACTIVE } },
    { component: component }
  );
  return resp?.data;
};

const getUpdatedIpdPatientDetails = async (fetchApi: any, branchId: number, uhid: string) => {
  const resp = await fetchApi(
    "GET",
    ENDPOINTS.SEARCH_IPD_PATIENT,
    {},
    { params: { branchId, searchBy: "PM.UHID", searchValue: uhid } },
    {}
  );

  return resp?.data?.[0] ?? null;
};

const uploadFile = async (fetchApi: any, file: File, component: string) => {
  const formData = new FormData();

  formData.append("file", file, file.name);

  const resp = await fetchApi("POST", ENDPOINTS.UPLOAD_DOCUMENT, formData, {}, { component });
  if (!resp?.result) {
    showError(resp?.message ?? "Failed to uplaod file");
    return;
  }

  return resp?.data;
};

export {
  getCorporateMaster,
  getDoctorMaster,
  getPatientDataByBranchId,
  getPatientDataByContact,
  getPatientDataByPatientId,
  getPatientDataByUhid,
  getUpdatedIpdPatientDetails,
  uploadFile,
};
