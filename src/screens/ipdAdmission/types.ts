import { ipdAdmissionSchema } from "@/validation/ipdAdmissionSchema";
import { InferType } from "yup";

type InsuranceItem = {
  insuranceCompanyId: number;
  insuranceCompanyName: string;
};

type CorporateItem = {
  corporateId: number;
  corporateName: string;
  insuranceCompanyId: number;
  isActive: number;
};

type SpecializationItem = {
  specializationId: number;
  specialization: string;
  isActive?: number;
};

type DoctorItem = {
  doctorId: number;
  completeName: string;
  specializationId: number;
  specialization?: string;
};

type ReferDoctorItem = {
  referDoctorId: number;
  doctorName: string;
};

type ProNameItem = {
  proId: number;
  name: string;
};

type BillingTypeItem = {
  typeId: number;
  roomTypeName: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
};

type SelectOption = {
  value: number;
  label: string;
};

type PickMasterItem = {
  key: string;
  value: string;
};

type IpdAdmissionFormValues = InferType<typeof ipdAdmissionSchema>;

type SaveIpdAdmissionPayload = {
  patientId: number;
  uhid: string;
  branchId: number;
  currentAge: string;

  primaryDoctorId: number;
  secondaryDoctorIds: number[];

  insuranceCompanyId: number;
  corporateId: number;

  referDoctorId: number;

  proId: number;
  proName: string;

  admissionType: string;

  billingTypeId: number;
  roomTypeId: number;
  bedId: number;

  admissionDate: string;
  admissionTime: string;

  attendantRelation: string;
  attendantName: string;
  attendantContactNumber: string;

  handleWithCare: number;
  nameMasking: number;

  mlcNo: string;

  mlcTypeId: number;
  mlcType: string;

  injuryTypeId: number;
  injuryType: string;

  broughtBy: string;

  transportId: number;
  transport: string;

  placeOfAccident: string;

  policeStation: string;

  officerName: string;
  officerPhone: string;

  complaintNo: string;
  buckleNoOfPolice: string;

  dateOfInjury: string;
  dateOfInitiation: string;

  causeOfAccident: string;

  identificationMarks: string;

  remarks: string;
};

type IpdAdmissionDetailsHandle = {
  validateForm: () => Promise<boolean>;
  validateBedSelection: () => Promise<boolean>;
  getValues: () => IpdAdmissionFormValues;
  resetForm: () => void;
};
type AvailableBedItem = {
  bedId: number;
  bedName: string;
  gender: string;
};
export type {
  AvailableBedItem,
  BillingTypeItem,
  CorporateItem,
  DoctorItem,
  InsuranceItem,
  IpdAdmissionDetailsHandle,
  IpdAdmissionFormValues,
  PickMasterItem,
  ProNameItem,
  ReferDoctorItem,
  SaveIpdAdmissionPayload,
  SelectOption,
  SpecializationItem,
};
