import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export const useAuthorizedPages = create(
  persist<AuthorizedPagesState>(
    set => ({
      authorizedPages: [],
      setAuthorizedPages: data => set({ authorizedPages: data }),
    }),
    {
      name: "authorized-pages", // localStorage key
    }
  )
);
