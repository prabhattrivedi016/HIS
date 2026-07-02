interface GridLeftTop {
  label: string;
  value: number | string | null;
}
interface GridRightTop {
  label: string;
  action: string;
}

interface GridId {
  label: string;
  value: number | string;
}

interface GridTitle {
  label: string;
  value: string;
}

interface GridFooterItem {
  label: string;
  value: string;
}

interface GridButtonSection {
  label: string;
  action: string;
}

interface GridItem {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;

  cardLeftTop: GridLeftTop[];
  cardRightTop: GridRightTop[];
  cardAvatar: string | null;
  cardId: GridId[];
  cardTitle: GridTitle[];
  cardFooter: GridFooterItem[];
  cardButton: GridButtonSection[];
}

// list view
interface ListLeftButton {
  label: string;
  action: string;
}

interface ColumnItem {
  isSortable?: boolean;
  isSearchable?: boolean;
  allowColumnFilter?: boolean;
  isMasked?: boolean;

  label: string;
  keyFromApi: string;
  value: string | number | null;
}

interface ListItem {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;

  listLeftButton: ListLeftButton[];
  columns: ColumnItem[];
}

type ColumnVisibility = Record<string, boolean>;

export type { ColumnVisibility, GridItem, ListItem };

type SubSubCategoryItem = {
  subCategoryId: number;
  subSubCategoryId: number;
  subSubCategoryName: string;
};

type InvestigationName = {
  serviceItemId: number;
  hospId: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  name: string;
  code: string;
  reportTypeId: number;
  labTypeId: number;
  reportType: string;
  isSampleRequired: number;
  sampleTypeId: number;
  sampleTypeIdList: string;
  labMethodId: number;
  forGenderId: number;
  forGender: string;
  isOutSource: number;
  isPrintAlone: number;
  isDepartmentReceivingRequired: number;
  shortName: string;
  sampleVolume: string;
  investigationComment: string;
  tatInMin: number;
  isActive: number;
};

type SelectItem = {
  label: string;
  value: number;
};

type PickMasterItem = {
  value: string;
  key: string | number;
};

type BranchItem = {
  branchId: number;
  branchName: string;
};

type UserItem = {
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
  lastModifiedOn: string;
  reportToUserId: number;
  userDepartmentId: number;
};

type RoleItem = {
  roleId: number;
  roleName: string;
  faIconId: number;
  isActive: number;
  iconClass: string;
  iconName: string;
  imagePath: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type OptionItem = {
  value: number;
  label: string;
};

export type {
  BranchItem,
  InvestigationName,
  OptionItem,
  PickMasterItem,
  RoleItem,
  SelectItem,
  SubSubCategoryItem,
  UserItem,
};
