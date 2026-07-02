type ListOfLovsItem = {
  value: string;
  dataTypeId: number;
  headerName?: string;
  options?: string[];
};

type HeaderMasterItem = {
  headerId: number;
  headerName: string;
  displayName: string;
  controlType: string;
  controlTypeId: number;
  isPrint: number;
  isShowInTempRoom: number;
  usedForPatientType: number;
  usedForPatientTypeName: string;
  isActive: number;
};

type DoctorItem = {
  doctorId: number;
  title: string;
  name: string;
  dob: string;
  gender: string;
  completeName: string;
  contactNo: string;
  emailId: string;
  address: string;
  specializationId: number;
  specialization: string;
  userName: string;
  password: string;
  departmentId: number;
  department: string;
  profileSummery: string;
  registrationNo: string;
  isActive: number;
  userId: number;
  hospId: number;
  createdBy: string;
  createdOn: string;
  ipAddress: string;
  branchId: string;
  canApproveLabReport: number;
  canApproveDischargeSummary: number;
  doctorPhotoFilePath: string;
  isDoctorUnit: number;
  roomNo: string;
};

type DepartmentItem = {
  departmentId: number;
  department: string;
  departmentTypeId: number;
  departmentType: string;
  isActive: number;
};

type DoctorDepartmentTableItem = {
  headerId: number;
  headerName: string;
  displayName: string;
  controlType: string;
  mappingId: number;
  sequenceNo: number;
};

export type {
  DepartmentItem,
  DoctorDepartmentTableItem,
  DoctorItem,
  HeaderMasterItem,
  ListOfLovsItem,
};
