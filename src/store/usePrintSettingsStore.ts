import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PrintSettings {
  showLetterhead: boolean;
  showPatientDetails: boolean;
  showHospitalDetails: boolean;
  showVitals: boolean;
  showAllergy: boolean;
  paperSize: "A4" | "A5";
  fontSize: "sm" | "md" | "lg";
  excludedSectionIds: number[];
  updatedOn: string;
}

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  showLetterhead: true,
  showPatientDetails: true,
  showHospitalDetails: true,
  showVitals: true,
  showAllergy: true,
  paperSize: "A4",
  fontSize: "md",
  excludedSectionIds: [],
  updatedOn: "",
};

interface PrintSettingsState {
  settingsByDoctor: Record<number, PrintSettings>;
  getSettings: (doctorId?: number) => PrintSettings;
  saveSettings: (doctorId: number, settings: PrintSettings) => void;
}

export const usePrintSettingsStore = create<PrintSettingsState>()(
  persist(
    (set, get) => ({
      settingsByDoctor: {},

      getSettings: doctorId => {
        if (doctorId == null) return DEFAULT_PRINT_SETTINGS;
        return get().settingsByDoctor[doctorId] ?? DEFAULT_PRINT_SETTINGS;
      },

      saveSettings: (doctorId, settings) =>
        set(state => ({
          settingsByDoctor: {
            ...state.settingsByDoctor,
            [doctorId]: { ...settings, updatedOn: new Date().toISOString() },
          },
        })),
    }),
    { name: "emr-print-settings-v2" }
  )
);
