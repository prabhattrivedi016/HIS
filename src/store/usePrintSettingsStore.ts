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
  /** dataIds to leave out of a past-visit print — only meaningful when a multi-entry template
   * produced more than one saved row for the same header within one visit (an ordinary header is
   * always upserted, so this never applies to it); lets a doctor print just one of those entries
   * instead of always all of them. */
  excludedDataIds: number[];
  /** px of top padding reserved above the content when the letterhead renders as a full-page
   * background — every hospital's letterhead image has a differently-sized header (logo/seal/
   * tagline), so this can't be inferred from code; it's a doctor/branch-tunable knob instead of a
   * hardcoded guess. 150 clears the BIO PATH LAB letterhead's header art at actual print size
   * (confirmed against a real overlapping printout — 65, tried earlier, wasn't enough once
   * measured against the real page instead of the on-screen preview). Adjust via the print
   * preview's slider and "Save as default" for a different letterhead. */
  letterheadTopOffset: number;
  /** off by default — only PrintPreviewModal's Medicine List table (Dose pattern, Dose Unit,
   * Frequency, Duration Unit, Route) switches to Hindi when this is on; every other section and
   * the live EMR editing page are unaffected either way. */
  translateMedicineToHindi: boolean;
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
  excludedDataIds: [],
  letterheadTopOffset: 150,
  translateMedicineToHindi: false,
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
        // spread defaults first so a settings object saved before a new field (e.g.
        // letterheadTopOffset) existed still comes back with a real value instead of undefined
        return { ...DEFAULT_PRINT_SETTINGS, ...(get().settingsByDoctor[doctorId] ?? {}) };
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
