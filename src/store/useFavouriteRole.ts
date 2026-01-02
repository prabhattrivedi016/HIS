import { create } from "zustand";

export const useFavoriteRoles = create(set => ({
  favoriteRoles: [],
  setFavoriteRoles: roles => set({ favoriteRoles: roles }),
}));
