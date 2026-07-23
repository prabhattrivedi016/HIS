import { ReportAnnotationStroke } from "@/store/useVisitReportsStore";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ImageTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

export const DEFAULT_IMAGE_TRANSFORM: ImageTransform = { x: 0, y: 0, scaleX: 1, scaleY: 1 };

export interface DoctorNoteEntry {
  patientId: number;
  visitId: number;
  content: string;
  imageSrc: string | null;
  imageTransform: ImageTransform;
  strokes: ReportAnnotationStroke[];
  updatedOn: string;
}

interface DoctorNotesState {
  notes: DoctorNoteEntry[];
  saveNote: (
    patientId: number,
    visitId: number,
    content: string,
    imageSrc: string | null,
    imageTransform: ImageTransform,
    strokes: ReportAnnotationStroke[]
  ) => void;
  getNote: (patientId: number, visitId: number) => DoctorNoteEntry | undefined;
}

export const useDoctorNotesStore = create<DoctorNotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      saveNote: (patientId, visitId, content, imageSrc, imageTransform, strokes) =>
        set(state => {
          const entry: DoctorNoteEntry = {
            patientId,
            visitId,
            content,
            imageSrc,
            imageTransform,
            strokes,
            updatedOn: new Date().toISOString(),
          };
          const existingIndex = state.notes.findIndex(
            note => note.patientId === patientId && note.visitId === visitId
          );
          if (existingIndex === -1) return { notes: [...state.notes, entry] };
          const notes = [...state.notes];
          notes[existingIndex] = entry;
          return { notes };
        }),

      getNote: (patientId, visitId) =>
        get().notes.find(note => note.patientId === patientId && note.visitId === visitId),
    }),
    { name: "emr-doctor-notes-v4" }
  )
);
