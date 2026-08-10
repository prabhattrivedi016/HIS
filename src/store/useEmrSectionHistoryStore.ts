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

/** a full snapshot of a section's saved values from one past consultation */
export interface EmrSectionVisitSnapshotEntry {
  id: string;
  patientId: number;
  sectionId: number;
  sectionName: string;
  visitId: number;
  doctorId: number;
  doctorName: string;
  recordedOn: string;
  values: { headerId: number; headerName: string; controlType: string; value: unknown }[];
}

/** keeps only the most recent N entries so localStorage doesn't grow unbounded */
const MAX_ENTRIES = 500;

/** local calendar day comparison — matches the dd-mm-yyyy grouping the History strip's tabs are
 * labelled with (PreviousSectionVisitsStrip's formatTabDate) */
const sameCalendarDay = (isoA: string, isoB: string) => {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

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
            visitSnapshots: (state.visitSnapshots ?? []).slice(-50),
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
  visitSnapshots: EmrSectionVisitSnapshotEntry[];
  logEdit: (entry: Omit<EmrSectionEditLogEntry, "id">) => void;
  addVisitSnapshot: (entry: Omit<EmrSectionVisitSnapshotEntry, "id">) => void;
  getEditLog: (patientId: number, sectionId: number) => EmrSectionEditLogEntry[];
  getVisitSnapshots: (patientId: number, sectionId: number) => EmrSectionVisitSnapshotEntry[];
}

/**
 * Local stand-in for the EMR section History feature (both the edit/change audit trail and
 * past-visit snapshots) until the backend endpoints exist — see the GET_EMR_SECTION_HISTORY /
 * GET_EMR_SECTION_EDIT_LOG TODOs in config/defaults/index.ts for the intended API contract,
 * which mirrors these two entry shapes.
 */
export const useEmrSectionHistoryStore = create<EmrSectionHistoryStore>()(
  persist(
    (set, get) => ({
      editLog: [],
      visitSnapshots: [],

      logEdit: entry =>
        set(state => ({
          editLog: [...state.editLog, { ...entry, id: crypto.randomUUID() }].slice(-MAX_ENTRIES),
        })),

      // one snapshot per (patientId, sectionId, calendar day) — the History strip's tabs are
      // labelled by day, so saving more than once on the same day (repeat Save clicks, or more
      // than one visit that day) must replace that day's existing entry, not pile up duplicate
      // same-date tabs
      addVisitSnapshot: entry =>
        set(state => ({
          visitSnapshots: [
            ...state.visitSnapshots.filter(
              v =>
                !(
                  v.patientId === entry.patientId &&
                  v.sectionId === entry.sectionId &&
                  sameCalendarDay(v.recordedOn, entry.recordedOn)
                )
            ),
            { ...entry, id: crypto.randomUUID() },
          ].slice(-MAX_ENTRIES),
        })),

      getEditLog: (patientId, sectionId) =>
        get()
          .editLog.filter(e => e.patientId === patientId && e.sectionId === sectionId)
          .sort((a, b) => b.changedOn.localeCompare(a.changedOn)),

      getVisitSnapshots: (patientId, sectionId) =>
        get()
          .visitSnapshots.filter(v => v.patientId === patientId && v.sectionId === sectionId)
          .sort((a, b) => b.recordedOn.localeCompare(a.recordedOn)),
    }),
    {
      name: "emr-section-history",
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);
