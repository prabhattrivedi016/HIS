export interface PastDiagnosisEntry {
  id: string;
  diagnosisType: string;
  status: string;
  remarks: string;
}

export interface VisitDiagnosisHistory {
  visitDate: string;
  entries: PastDiagnosisEntry[];
}

export const PATIENT_DIAGNOSIS_HISTORY: VisitDiagnosisHistory[] = [
  {
    visitDate: "2026-03-23",
    entries: [
      {
        id: "d1-1",
        diagnosisType: "Hypertension",
        status: "Active",
        remarks: "Well controlled on medication",
      },
      { id: "d1-2", diagnosisType: "Type 2 Diabetes", status: "Active", remarks: "HbA1c 6.8%" },
    ],
  },
  {
    visitDate: "2026-01-09",
    entries: [
      {
        id: "d2-1",
        diagnosisType: "Migraine",
        status: "Resolved",
        remarks: "No recurrence in 3 months",
      },
    ],
  },
  {
    visitDate: "2025-12-19",
    entries: [
      { id: "d3-1", diagnosisType: "Gastritis", status: "Active", remarks: "On PPI" },
      { id: "d3-2", diagnosisType: "Asthma", status: "Inactive", remarks: "" },
    ],
  },
];
