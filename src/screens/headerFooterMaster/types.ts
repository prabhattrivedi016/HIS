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
  data: SequenceEditItem | null;
  onClose: () => void;
  onSuccess: () => void;
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

export type {
  BranchItem,
  HeaderFooterFormData,
  ReportItem,
  RoleItem,
  SelectItem,
  SequenceDrawerProps,
  SequenceDropDownItem,
  SequenceEditItem,
  SequenceTypeItem,
  VariableNameItem,
};
