interface DoctorMasterItem {
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
  doctorSignFilePath: string;
  isDoctorUnit: number;
  roomNo: string;
}

interface LabelValue {
  label: string;
  value: string | number;
}

interface LabelAction {
  label: string;
  action: string;
}

interface DoctorMasterGridCard {
  type: "doctorMaster";
  cardType: "doctorMasterGrid";
  cardViewType: "grid";

  id: number;

  cardLeftTop: LabelValue[];

  cardRightTop: LabelAction[];

  cardAvatar: string;

  cardId: LabelValue[];

  cardTitle: LabelValue[];

  cardFooter: LabelValue[];

  buttonSection: LabelAction[];
}

interface ListColumn {
  label: string;
  keyFromApi: string;

  value?: string | number;

  isSortable?: boolean;
  isSearchable?: boolean;
  allowColumnFilter?: boolean;
  isMasked?: boolean;
}

interface DoctorMasterListCard {
  type: "doctorMaster";
  cardType: "doctorMasterList";
  cardViewType: "list";

  id: number;

  listLeftButton: LabelAction[];

  columns: ListColumn[];
}

type DepartmentItem = {
  departmentId: number;
  department: string;
  departmentTypeId: number;
  departmentType: string;
  isActive: number;
};

type SpecializationItem = {
  specializationId: number;
  specialization: string;
  isActive: number;
};

type SelectItem = {
  value: number;
  label: string;
};

type TitleItem = {
  value: string;
  key: string;
};

type GenderItem = {
  value: string;
  key: string;
};

type DoctorUnitMasterProps = {
  isOpen: boolean;
  onClose: () => void;
};

type DoctorMasterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  buttonTitle: string;
  drawerTitle: string;
  doctorId?: number | undefined | null;
  onCloseDrawer: () => void;
};

type DoctorTimingItem = {
  branchId: number;
  day: string;
  startTiming: string;
  endTiming: string;
  branchName: string;
};

interface DepartmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: number | undefined;
  refreshDepartment: () => Promise<void>;
}

interface SpecializationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  specializationId: number | undefined;
  refreshSpec: () => Promise<void>;
}

interface DoctorUnitMappingItem {
  doctorId: number;
  completeName: string;
}

interface DoctorTimingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
}

interface CardRightButtonPopupProps {
  position: { top: number; bottom: number };
  onClose: () => void;
  doctorId: number;
}

export type {
  CardRightButtonPopupProps,
  DepartmentItem,
  DepartmentPopupProps,
  DoctorMasterDrawerProps,
  DoctorMasterGridCard,
  DoctorMasterItem,
  DoctorMasterListCard,
  DoctorTimingItem,
  DoctorTimingModalProps,
  DoctorUnitMappingItem,
  DoctorUnitMasterProps,
  GenderItem,
  SelectItem,
  SpecializationItem,
  SpecializationPopupProps,
  TitleItem,
};
