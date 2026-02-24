import { ENDPOINTS } from "@/config/defaults";
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
  refetchAuthorizedPages: (roleId: number, branchId: number, fetchApi: any) => Promise<void>;
};

export const useAuthorizedPages = create<AuthorizedPagesState>()(
  persist(
    set => ({
      authorizedPages: [],

      setAuthorizedPages: data => set({ authorizedPages: Array.isArray(data) ? data : [] }),

      refetchAuthorizedPages: async (roleId, branchId, fetchApi) => {
        const response = await fetchApi(
          "GET",
          ENDPOINTS.GET_USER_TAB_SUB_MENU_MAPPING,
          {},
          { params: { branchId, roleId } }
        );

        if (!response) return;

        const tabs = response.data?.tabs ?? [];
        const subMenus = response.data?.subMenus ?? [];
        const favoriteSubMenus = response.data?.favoriteSubMenus ?? [];

        const quickLinksTab = {
          tabName: {
            tabId: 0,
            tabName: "Quick Links",
            iconClass: "fa-solid fa-star",
          },
          pages: favoriteSubMenus.map(item => ({
            ...item,
            tabId: 0,
          })),
        };

        const normalTabs = tabs.map(tab => ({
          tabName: {
            tabId: tab.tabId,
            tabName: tab.tabName.trim(),
            iconClass: tab.iconClass,
          },
          pages: subMenus.filter(page => page.tabId === tab.tabId),
        }));

        set({ authorizedPages: [quickLinksTab, ...normalTabs] });
      },
    }),
    {
      name: "authorized-pages",
      partialize: state => ({ authorizedPages: state.authorizedPages }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        authorizedPages: Array.isArray(
          (persistedState as { authorizedPages?: unknown })?.authorizedPages
        )
          ? (persistedState as { authorizedPages: TabItem[] }).authorizedPages
          : currentState.authorizedPages,
      }),
    }
  )
);
