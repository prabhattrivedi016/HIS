type SubMenuItem = {
  subMenuId: number;
  tabId: number;
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
};

type AddNewTabPanelProps = {
  isOpenTab: boolean;
  onCloseTab: () => void;
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

export type {
  AddNewTabPanelProps,
  IconListItem,
  NavigationPanelDrawerProps,
  NewTabProps,
  SubMenuItem,
  SubmitPayload,
  tabDropdownItem,
};
