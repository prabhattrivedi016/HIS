interface RoleBindPageProps {
  isOpen: boolean;
  onClose: () => void;
}

type RoleMapItem = {
  roleId: number;
  roleName: string;
  iconClass: string;
  imagePath: string;
};

type TabItem = {
  tabId: number;
  tabName: string;
  iconClass: string;
};
type subMenuItem = {
  subMenuId: number;
  subMenuName: string;
  url: string;
  tabId: number;
};

export type { RoleBindPageProps, RoleMapItem, subMenuItem, TabItem };
