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

export type { BranchItem, HeaderFooterFormData, ReportItem, RoleItem, VariableNameItem };
