interface RoleInfo {
  tabId: number;
  tabName: string;
  iconClass: string;
}

interface PageItem {
  subMenuId: number;
  subMenuName: string;
  url: string;
  tabId: number;
}

interface TabItem {
  tabName: RoleInfo;
  pages: PageItem[];
  selectedRoleId: number;
}
export type { PageItem, TabItem };
