export interface PastProcedureEntry {
  id: string;
  procedure: string;
  status: string;
  followUp: string;
  date: string;
}

export interface VisitProcedureHistory {
  visitDate: string;
  entries: PastProcedureEntry[];
}

export const PATIENT_PROCEDURE_HISTORY: VisitProcedureHistory[] = [
  {
    visitDate: "2026-03-23",
    entries: [
      {
        id: "p1-1",
        procedure: "Wound Dressing",
        status: "Completed",
        followUp: "1 Week",
        date: "2026-03-23",
      },
    ],
  },
  {
    visitDate: "2025-12-02",
    entries: [
      {
        id: "p2-1",
        procedure: "Suturing",
        status: "Completed",
        followUp: "2 Weeks",
        date: "2025-12-02",
      },
      {
        id: "p2-2",
        procedure: "Nebulization",
        status: "Completed",
        followUp: "None",
        date: "2025-12-02",
      },
    ],
  },
];
