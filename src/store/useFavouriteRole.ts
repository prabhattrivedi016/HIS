import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FavoriteRole {
  roleId: number;
  roleName: string;
  imagePath: string;
  isFavoriteRole?: number;
}

interface FavoriteRoleStore {
  favoriteRoles: FavoriteRole[];
  setFavoriteRoles: (roles: FavoriteRole[]) => void;
  addFavoriteRole: (role: FavoriteRole) => void;
  removeFavoriteRole: (roleId: number) => void;
  isFavorite: (roleId: number) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteRoles = create<FavoriteRoleStore>()(
  persist(
    (set, get) => ({
      favoriteRoles: [],

      setFavoriteRoles: roles => set({ favoriteRoles: roles }),

      addFavoriteRole: role =>
        set(state => {
          if (state.favoriteRoles.some(r => r.roleId === role.roleId)) {
            return state;
          }
          return { favoriteRoles: [...state.favoriteRoles, role] };
        }),

      removeFavoriteRole: roleId =>
        set(state => ({
          favoriteRoles: state.favoriteRoles.filter(r => r.roleId !== roleId),
        })),

      isFavorite: roleId => get().favoriteRoles.some(r => r.roleId === roleId),

      clearFavorites: () => set({ favoriteRoles: [] }),
    }),
    {
      name: "favorite-roles", // localStorage
    }
  )
);
