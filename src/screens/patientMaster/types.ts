type ValueItem = {
  label?: string;
  value?: string | number;
  keyFromApi?: string;
};

type LabelAction = {
  label: string;
  action: string;
};

interface PatientMasterGridItem {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  cardLeftTop: { label: string; value?: number | null }[];
  cardRightTop: ValueItem[];
  cardAvatar?: string | null;
  cardId: ValueItem[];
  cardTitle: ValueItem[];
  cardFooter: ValueItem[];
  cardButton: {
    label: string;
    action: string;
  }[];
  buttonSection: {
    label: string;
    action: string;
    color?: string;
  }[];
}

interface ListColumn {
  label: string;
  keyFromApi: string;

  value: string | number | null;

  isSortable?: boolean;
  isSearchable?: boolean;
  allowColumnFilter?: boolean;
  isMasked?: boolean;
}

interface PatientMasterListItem {
  type: "patientMaster";
  cardType: "patientMasterList";
  cardViewType: "list";

  id: number;

  listLeftButton: LabelAction[];

  columns: ListColumn[];
}

type PatientMasterItem = {
  patientId: number;
  branchId: number;
  uhid: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  patientName: string;
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  age: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  relation: string;
  relativeName: string;
  idProofName: string;
  idProofNumber: string;
  contactNumber: string;
  emergencyContactNumber: string;
  email: string;
  privilegedCardNumber: string;
  address: string;
  countryId: number;
  country: string;
  stateId: number;
  state: string;
  districtId: number;
  district: string;
  cityId: number;
  city: string;
  insuranceCompanyId: number;
  corporateId: number;
  cardNo: string;
  isVaccination: number;
  vipPatient: number;
  patientImagePath: "";
  policyNo: string;
  policyCardNo: string;
  expiryDate: string;
  cardHolder: string;
  referalNo: string;
  referalDate: string;
};

type PickMasterItem = {
  value: string;
  key: string;
};
export type { PatientMasterGridItem, PatientMasterItem, PatientMasterListItem, PickMasterItem };
