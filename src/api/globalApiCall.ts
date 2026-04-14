import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";

const getDoctorMaster = async (fetchApi: any, doctorId: number, component: string = "") => {
  const resp = await fetchApi(
    "GET",
    ENDPOINTS.GET_DOCTOR_MASTER,
    {},
    { params: { doctorId } },
    { component: component }
  );
  const doctorDetails = {
    label: resp?.data?.[0]?.completeName,
    value: resp?.data?.[0]?.doctorId,
  };
  return doctorDetails;
};

// search patient by PatientId,
const getPatientDataByPatientId = async (
  fetchApi: any,
  PatientId?: number,
  component: string = ""
) => {
  const resp = await fetchApi(
    "GET",
    ENDPOINTS.GET_PATIENT_MASTER,
    {},
    { params: { PatientId } },
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
export {
  getCorporateMaster,
  getDoctorMaster,
  getPatientDataByBranchId,
  getPatientDataByContact,
  getPatientDataByPatientId,
  getPatientDataByUhid,
};
