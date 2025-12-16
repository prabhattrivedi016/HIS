import { create } from "zustand";

export type RoleInfo = {
  tabId: number;
  tabName: string;
  iconClass: string;
};

export type AuthorizedPageItem = {
  subMenuId: number;
  subMenuName: string;
  url: string;
  tabId: number;
};

export type TabItem = {
  tabName: RoleInfo;
  pages: AuthorizedPageItem[];
  selectedRole?: {
    roleId: number;
    roleName: string;
    iconClass: string;
  };
};

export type AuthorizedPagesState = {
  authorizedPages: TabItem[];
  setAuthorizedPages: (data: TabItem[]) => void;
};

export const useAuthorizedPages = create<AuthorizedPagesState>(set => ({
  authorizedPages: [
    {
      tabName: {
        tabId: 1,
        tabName: "Admin",
        iconClass: "fa-brands fa-accessible-icon",
      },
      pages: [
        { subMenuId: 1, subMenuName: "User Group", url: "user-group", tabId: 1 },
        { subMenuId: 2, subMenuName: "User Master", url: "user-master", tabId: 1 },
        { subMenuId: 7, subMenuName: "Role Master", url: "role-master", tabId: 1 },
        { subMenuId: 11, subMenuName: "Dashboard", url: "dashboard", tabId: 1 },
        { subMenuId: 12, subMenuName: "User Department", url: "user-department", tabId: 1 },
        { subMenuId: 13, subMenuName: "User Authorization", url: "user-authorization", tabId: 1 },
        { subMenuId: 14, subMenuName: "Navigation Pane", url: "navigation-pane", tabId: 1 },
        // { subMenuId: 15, subMenuName: "Branch Master", url: "branch-master", tabId: 1 },
      ],
      selectedRole: {
        roleId: 2,
        roleName: "Admin",
        iconClass: "fa-brands fa-accessible-icon",
      },
    },
    {
      tabName: {
        tabId: 3,
        tabName: "Reports",
        iconClass: "fa-brands fa-airbnb",
      },
      pages: [
        { subMenuId: 4, subMenuName: "Stock Report", url: "stock-report", tabId: 3 },
        // { subMenuId: 10, subMenuName: "Collect Report", url: "collect-report", tabId: 3 },
      ],
      selectedRole: {
        roleId: 2,
        roleName: "Admin",
        iconClass: "fa-brands fa-accessible-icon",
      },
    },
    {
      tabName: {
        tabId: 4,
        tabName: "OPD Display",
        iconClass: "fa-solid fa-2",
      },
      pages: [{ subMenuId: 5, subMenuName: "OPD Patients", url: "opd-patients", tabId: 4 }],
      selectedRole: {
        roleId: 2,
        roleName: "Admin",
        iconClass: "fa-brands fa-accessible-icon",
      },
    },
    {
      tabName: {
        tabId: 6,
        tabName: "Cancellation",
        iconClass: "fa-brands fa-accusoft",
      },
      pages: [
        { subMenuId: 6, subMenuName: "Bill Receipt Cancel", url: "bill-receipt-cancel", tabId: 6 },
        // { subMenuId: 9, subMenuName: "IPD Bill Cancel", url: "ipd-bill-cancel", tabId: 6 },
      ],
      selectedRole: {
        roleId: 2,
        roleName: "Admin",
        iconClass: "fa-brands fa-accessible-icon",
      },
    },
    {
      tabName: {
        tabId: 7,
        tabName: "Rate Master",
        iconClass: "fa-solid fa-9",
      },
      pages: [{ subMenuId: 8, subMenuName: "Rate List Master", url: "rate-list-master", tabId: 7 }],
      selectedRole: {
        roleId: 2,
        roleName: "Admin",
        iconClass: "fa-brands fa-accessible-icon",
      },
    },
  ],

  setAuthorizedPages: data =>
    set({
      authorizedPages: data,
    }),
}));
