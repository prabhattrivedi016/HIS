export interface PastFamilyHistoryEntry {
  id: string;
  relationship: string;
  sex: string;
  status: string;
  date: string;
  condition: string;
  conditionText: string;
  onsetAge: string;
  contributedToDeath: string;
}

export interface VisitFamilyHistory {
  visitDate: string;
  entries: PastFamilyHistoryEntry[];
}

export const PATIENT_FAMILY_HISTORY: VisitFamilyHistory[] = [
  {
    visitDate: "2026-03-23",
    entries: [
      {
        id: "f1-1",
        relationship: "Father",
        sex: "Male",
        status: "Active",
        date: "2026-03-23",
        condition: "Hypertension",
        conditionText: "",
        onsetAge: "55",
        contributedToDeath: "No",
      },
      {
        id: "f1-2",
        relationship: "Mother",
        sex: "Female",
        status: "Active",
        date: "2026-03-23",
        condition: "Type 2 Diabetes",
        conditionText: "",
        onsetAge: "60",
        contributedToDeath: "No",
      },
    ],
  },
  {
    visitDate: "2025-09-09",
    entries: [
      {
        id: "f2-1",
        relationship: "Grandfather",
        sex: "Male",
        status: "Resolved",
        date: "2025-09-09",
        condition: "Heart Attack",
        conditionText: "",
        onsetAge: "70",
        contributedToDeath: "Yes",
      },
    ],
  },
];
