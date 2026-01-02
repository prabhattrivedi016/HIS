type SubMenuItem = {
  subMenuId: number;
  tabId: number;
  tabName: string;
  subMenuName: string;
  url: string;
  isActive: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  ipAddress: string;
};

type NavigationPanelDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  buttonTitle: string;
  drawerTitle: string;
  onUpdate: () => void;
  updatedValue: updatedValueItem | null;
};
type SubmitPayload = {
  isActive: boolean;
  url: string;
  subMenuName: string;
  tabId: number;
  subMenuId: number;
};

type tabDropdownItem = {
  tabId: number;
  tabName: string;
  isActive: number;
  faIconId: number;
};

type AddNewTabPanelProps = {
  isOpenTab: boolean;
  onCloseTab: () => void;
  tabId?: number | null;
};

type NewTabProps = {
  tabId?: string | number | null;
  tabName: string;
  faIconId: string | number;
};

type IconListItem = {
  id: number;
  iconClass: string;
  iconName: string;
};

type NavigationFormFields = {
  subMenuId: number;
  tabId: number | string;
  subMenuName: string;
  url: string;
  isActive: string | boolean;
};

type AddTabFormFields = {
  tabId: number | string;
  tabName: string;
  faIconId: number | string;
  imagePath: string;
};

type PageMappingProps = {
  isOpen: boolean;
  onClose: () => void;
};

type BranchListItem = {
  branchId: number;
  branchName: string;
};
type ActiveRoleItem = {
  roleId: number;
  roleName: string;
  faIconId: number;
  isActive: number;
  iconClass: string;
  iconName: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type RoleItem = {
  isGranted: number;
  subMenuId: number;
  tabId: number;
  subMenuName: string;
  tabName: string;
  isActive: number;
};

type updatedValueItem = {
  subMenuId: number;
  tabId: number | string | undefined;
  tabName: string;
  subMenuName: string;
  url: string;
  isActive: number | boolean;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  ipAddress: string;
};

export type {
  ActiveRoleItem,
  AddNewTabPanelProps,
  AddTabFormFields,
  BranchListItem,
  IconListItem,
  NavigationFormFields,
  NavigationPanelDrawerProps,
  NewTabProps,
  PageMappingProps,
  RoleItem,
  SubMenuItem,
  SubmitPayload,
  tabDropdownItem,
  updatedValueItem,
};
