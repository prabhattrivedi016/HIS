import { safeRandomUUID } from "@/utils/uuid";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

/** one field that changed while a section was being edited (audit trail) */
export interface EmrSectionEditLogEntry {
  id: string;
  patientId: number;
  sectionId: number;
  headerId: number;
  headerName: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy: number;
  changedByName: string;
  changedOn: string;
}

/** keeps only the most recent N entries so localStorage doesn't grow unbounded */
const MAX_ENTRIES = 500;

/** localStorage's quota is per-origin and shared with everything else this app stores there —
 * if this store's own history ever pushes it over the edge, drop back to a small recent slice
 * and retry once instead of throwing an uncaught QuotaExceededError that breaks the page */
const safeLocalStorage: StateStorage = {
  getItem: name => localStorage.getItem(name),
  removeItem: name => localStorage.removeItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      try {
        const parsed = JSON.parse(value);
        const state = parsed.state ?? {};
        const trimmed = {
          ...parsed,
          state: {
            ...state,
            editLog: (state.editLog ?? []).slice(-50),
          },
        };
        localStorage.setItem(name, JSON.stringify(trimmed));
      } catch {
        // still doesn't fit — this is a local audit-trail cache, not critical data, so drop the
        // write rather than crash the app over it
      }
    }
  },
};

interface EmrSectionHistoryStore {
  editLog: EmrSectionEditLogEntry[];
  logEdit: (entry: Omit<EmrSectionEditLogEntry, "id">) => void;
  getEditLog: (patientId: number, sectionId: number) => EmrSectionEditLogEntry[];
}

/**
 * Local stand-in for the EMR section edit/change audit trail (the "Edit Log" tab) until
 * GET_EMR_SECTION_EDIT_LOG / SAVE_EMR_SECTION_EDIT_LOG exist on the backend — see the TODO in
 * config/defaults/index.ts. The "Past Visits" tab is no longer backed by this store — it reads
 * real data via usePatientVisitHistory (GET_PATIENT_VISIT_DETAILS_BY_PATIENT_ID +
 * GET_DOCTOR_CONSULTATION_BY_VISIT_ID).
 */
export const useEmrSectionHistoryStore = create<EmrSectionHistoryStore>()(
  persist(
    (set, get) => ({
      editLog: [],

      logEdit: entry =>
        set(state => ({
          editLog: [...state.editLog, { ...entry, id: safeRandomUUID() }].slice(-MAX_ENTRIES),
        })),

      getEditLog: (patientId, sectionId) =>
        get()
          .editLog.filter(e => e.patientId === patientId && e.sectionId === sectionId)
          .sort((a, b) => b.changedOn.localeCompare(a.changedOn)),
    }),
    {
      name: "emr-section-history",
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);
