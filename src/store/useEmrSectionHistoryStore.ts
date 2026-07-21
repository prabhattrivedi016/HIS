import { create } from "zustand";
import { persist } from "zustand/middleware";

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

      addVisitSnapshot: entry =>
        set(state => ({
          visitSnapshots: [...state.visitSnapshots, { ...entry, id: crypto.randomUUID() }].slice(
            -MAX_ENTRIES
          ),
        })),

      addChefComplaintSnapShot: entry =>
        set(state => ({
          visitSnapshots: [...state.visitSnapshots, { ...entry, id: crypto.randomUUID() }].slice(
            -MAX_ENTRIES
          ),
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
    }
  )
);
