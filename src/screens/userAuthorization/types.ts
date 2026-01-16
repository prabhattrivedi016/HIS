// User / Group Items
export type UserGroupRoleItem = {
  id: number;
  firstName: string;
  midelName: string;
  lastName: string;
  dob: string;
  gender: string;
  userName: string;
  password: string;
  address: string;
  contact: string;
  email: string;
  isActive: number;
  employeeID: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  reportToUserId: number;
  userDepartmentId: number;
};

export type UserGroupGroupItem = {
  id: number;
  groupName: string;
  isActive: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  ipAddress: string;
};

// Core Data Items:api response
export type RoleDataItem = {
  isGranted: number;
  roleName: string;
  roleId: number;
};

export type UserRightsItem = {
  isGranted: number;
  userRightName: string;
  description: string;
  userRightId: number;
};

export type BedMappingItem = {
  isGranted: number;
  serviceItemId: number;
  name: string;
};

export type UserDashboardItem = {
  isGranted: number;
  userRightName: string;
  details: string;
  userRightId: number;
};

export type PageAccessItem = {
  isGranted: number;
  subMenuId: number;
  tabId: number;
  subMenuName: string;
  tabName: string;
  isActive: number;
};

export type CorporateMappingItem = {
  isGranted: number;
  corporateId: number;
  corporateName: string;
  isActive: number;
};

// Table Structure Items
export type RoleTableItem = {
  type: "roleName";
  branchId: number;
  typeId: number | null;
  userId: number | null;
  data: RoleDataItem[];
};

export type UserRightTableItem = {
  type: "userRightName";
  branchId: number;
  typeId: number | null;
  userId: number | null;
  roleId: number;
  data: UserRightsItem[];
};

export type UserDashboardTableItem = {
  type: "userDashboard";
  branchId: number;
  typeId: number | null;
  userId: number | null;
  roleId: number;
  data: UserDashboardItem[];
};

export type BedMappingTableItem = {
  type: "bedMapping";
  branchId: number;
  typeId: number | null;
  userId: number | null;
  data: BedMappingItem[];
};

export type PageAccessTableItem = {
  type: "pageAccess";
  branchId: number;
  typeId: number | null;
  userId: number | null;
  roleId: number;
  data: PageAccessItem[];
};

export type CorporateMappingTableItem = {
  type: "corporateMapping";
  branchId: number;
  typeId: number | null;
  userId: number | null;
  roleId: number;
  data: CorporateMappingItem[];
};

// tableData
export type TableData =
  | RoleTableItem
  | UserRightTableItem
  | UserDashboardTableItem
  | PageAccessTableItem
  | CorporateMappingTableItem
  | BedMappingTableItem;

// Filtered Data
export type FilteredData =
  | RoleDataItem[]
  | UserRightsItem[]
  | UserDashboardItem[]
  | PageAccessItem[]
  | CorporateMappingItem[]
  | BedMappingItem[];

export type TableProps = {
  tableData: TableData;
  filteredData: FilteredData;
  onChangeFilter: (data: FilteredData) => void;
  onChangeMessage: (msg: string) => void;
  selectedButton: string;
};

// Pick Master
export type PickMasterValueItem = {
  id: number;
  fieldName: string;
  value: string;
  key: string;
};

export type SelectItem = {
  label: string;
  value: number;
};

export interface PickMasterItem {
  id: Number;
  fieldName: string;
  value: string;
  key: Number;
}
