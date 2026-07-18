import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EmrSectionLayout = "horizontal" | "vertical";

interface EmrSectionLayoutStore {
  layout: EmrSectionLayout;
  setLayout: (layout: EmrSectionLayout) => void;
  toggleLayout: () => void;
}

export const useEmrSectionLayout = create<EmrSectionLayoutStore>()(
  persist(
    set => ({
      layout: "horizontal",

      setLayout: layout => set({ layout }),

      toggleLayout: () =>
        set(state => ({ layout: state.layout === "horizontal" ? "vertical" : "horizontal" })),
    }),
    {
      name: "emr-section-layout",
    }
  )
);
