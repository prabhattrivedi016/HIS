interface ReportItem {
  id: number;
  fieldName: string;
  value: string;
  key: string;
}

interface BranchItem {
  branchId: number;
  branchName: string;
}

interface VariableNameItem {
  id: number;
  fieldName: string;
  value: string;
  key: string;
}

interface RoleItem {
  roleId: number;
  roleName: string;
  faIconId: number;
  isActive: number;
  iconClass: string;
  imagePath: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
}

type HeaderFooterFormData = {
  headerId: number;
  roleId: number;
  branchId: number | null;
  typeId: number | null;
  type: string;
  isHeader: number;
  headerBody: string;
  isActive: number;
};

interface SelectItem {
  label: string;
  value: number;
}

interface SequenceTypeItem {
  typeId: number;
  typeName: string;
}

interface SequenceDropDownItem {
  sequenceId: number;
  name: string;
  typeId: number;
  typeName: string;
  prefix: string;
  firstSeprator: string;
  fyFormatId: number;
  fyFormat: string;
  secondSeprator: string;
  length: number;
  preview: string;
}

type SequenceDrawerProps = {
  isOpen: boolean;
  data: SequenceEditItem | null;
  onClose: () => void;
  onExited?: () => void;
  handleRefresh: () => Promise<void>;
  resetType: () => void;
  resetSequence: () => void;
};

type SequenceEditItem = {
  sequenceId?: number;
  name?: string;
  typeId?: number;
  typeName?: string;
  prefix?: string;
  firstSeprator?: string;
  fyFormatId?: number;
  fyFormat?: string;
  secondSeprator?: string;
  length?: number;
  preview?: string;
};

type SequenceMappingItem = {
  mappingId: number;
  branchId: number;
  branchName: string;
  roleId: number;
  roleName: string;
  typeId: number;
  typeName: string;
  sequenceId: number;
  sequencePreview: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type PickMasterList = {
  value: string;
  key: number;
};

type LetterHeadItem = {
  id: number;
  branchId: number;
  branchName: string;
  typeId: number;
  typeName: string;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  letterHeadFilePath: string;
  isActive: number;
};

type DoctorTableItem = {
  id: number;
  branchId: number;
  branchName: string;
  doctorId: number;
  doctorName: string;
  xSign: number;
  ySign: number;
  docSignPath: string;
};

type DoctorItem = {
  doctorId: number;
  name: string;
};

export type {
  BranchItem,
  DoctorItem,
  DoctorTableItem,
  HeaderFooterFormData,
  LetterHeadItem,
  PickMasterList,
  ReportItem,
  RoleItem,
  SelectItem,
  SequenceDrawerProps,
  SequenceDropDownItem,
  SequenceEditItem,
  SequenceMappingItem,
  SequenceTypeItem,
  VariableNameItem,
};
