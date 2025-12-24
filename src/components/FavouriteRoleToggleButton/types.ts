type RoleValue = {
  roleId: number;
  roleName: string;
  iconClass: string;
  imagePath: string;
  isFavoriteRole: number;
};

type TabValue = {
  tabId: number;
  tabName: string;
  iconClass: string;
};

type SubMenuValue = {
  subMenuId: number;
  subMenuName: string;
  url: string;
  tabId: number;
};

export type { RoleValue, SubMenuValue, TabValue };
