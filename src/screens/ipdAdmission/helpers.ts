import { PatientDataItem } from "../patientRegistration/types";
import { AvailableBedItem, IpdAdmissionFormValues, SaveIpdAdmissionPayload } from "./types";

const getRoomTypeId = (item: AvailableBedItem): number =>
  Number(item.typeId ?? item.roomTypeId ?? item.serviceItemId ?? 0);

const getRoomTypeName = (item: AvailableBedItem): string =>
  item.wardName ?? item.roomType ?? item.name ?? "Unknown";

const getAvailableCount = (item: AvailableBedItem): number =>
  Number(item.availableBed ?? item.avl ?? 0);

const getOccupiedCount = (item: AvailableBedItem): number =>
  Number(item.occupiedBed ?? item.occ ?? 0);

export const formatRoomTypeLabel = (item: AvailableBedItem): string => {
  const name = getRoomTypeName(item);
  const available = getAvailableCount(item);
  const occupied = getOccupiedCount(item);

  if (item.availableBed !== undefined || item.avl !== undefined) {
    return `${name} | Avl: ${available} | Occ: ${occupied}`;
  }

  return `${name} (${available} Available)`;
};

export const getRoomTypeOptionValue = (item: AvailableBedItem): number => getRoomTypeId(item);

export type IpdPatientSummary = {
  uhid: string;
  patientName: string;
  ageSex: string;
  contactNumber: string;
};

export const buildIpdPatientSummary = (
  details: Record<string, unknown>
): IpdPatientSummary | null => {
  const patientId = Number(details.PatientId ?? 0);

  // Only show summary after an existing patient is bound/loaded, not while typing UHID.
  if (patientId <= 0) {
    return null;
  }

  const uhid = String(details.UhidOrBarcode ?? "").trim();
  const title = String(details.Title ?? "").trim();
  const firstName = String(details.FirstName ?? "").trim();
  const middleName = String(details.MiddleName ?? "").trim();
  const lastName = String(details.LastName ?? "").trim();
  const patientName = [title, firstName, middleName, lastName].filter(Boolean).join(" ") || "-";

  const ageYears = Number(details.AgeYears ?? 0);
  const ageMonths = Number(details.AgeMonths ?? 0);
  const ageDays = Number(details.AgeDays ?? 0);
  const gender = String(details.Gender ?? "-").trim() || "-";

  return {
    uhid: uhid || "-",
    patientName,
    ageSex: `${ageYears}Y ${ageMonths}M ${ageDays}D / ${gender}`,
    contactNumber: String(details.SelfContactNumber ?? "-").trim() || "-",
  };
};

const toIsoDateString = (value?: string): string => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
};

export const buildSaveIpdAdmissionPayload = (
  patient: PatientDataItem,
  admission: IpdAdmissionFormValues
): SaveIpdAdmissionPayload => ({
  patientId: Number(patient.patientId ?? 0),
  uhid: patient.uhid ?? "",
  branchId: Number(patient.branchId ?? 0),
  currentAge: patient.age ?? "",
  primaryDoctorId: Number(admission.primaryDoctorId ?? 0),
  secondaryDoctorIds: (admission.secondaryDoctorIds ?? [])
    .map(id => Number(id))
    .filter(id => id > 0),
  insuranceCompanyId: Number(admission.insuranceCompanyId ?? 0),
  corporateId: Number(admission.corporateId ?? 0),
  referDoctorId: Number(admission.referDoctorId ?? 0),
  proId: Number(admission.proId ?? 0),
  proName: admission.proName ?? "",
  admissionType: admission.admissionType ?? "",
  billingTypeId: Number(admission.billingTypeId ?? 0),
  roomTypeId: Number(admission.roomTypeId ?? 0),
  bedId: Number(admission.bedId ?? 0),
  admissionDate: admission.admissionDate ?? "",
  admissionTime: admission.admissionTime ?? "",
  attendantRelation: admission.attendantRelation ?? "",
  attendantName: admission.attendantName ?? "",
  attendantContactNumber: admission.attendantContactNumber ?? "",
  handleWithCare: Number(admission.handleWithCare ?? 0),
  nameMasking: Number(admission.nameMasking ?? 0),
  mlcNo: admission.mlcNo ?? "",
  mlcTypeId: Number(admission.mlcTypeId ?? 0),
  mlcType: admission.mlcType ?? "",
  injuryTypeId: Number(admission.injuryTypeId ?? 0),
  injuryType: admission.injuryType ?? "",
  broughtBy: admission.broughtBy ?? "",
  transportId: Number(admission.transportId ?? 0),
  transport: admission.transport ?? "",
  placeOfAccident: admission.placeOfAccident ?? "",
  policeStation: admission.policeStation ?? "",
  officerName: admission.officerName ?? "",
  officerPhone: admission.officerPhone ?? "",
  complaintNo: admission.complaintNo ?? "",
  buckleNoOfPolice: admission.buckleNoOfPolice ?? "",
  dateOfInjury: toIsoDateString(admission.dateOfInjury),
  dateOfInitiation: toIsoDateString(admission.dateOfInitiation),
  causeOfAccident: admission.causeOfAccident ?? "",
  identificationMarks: admission.identificationMarks ?? "",
  remarks: admission.remarks ?? "",
});
