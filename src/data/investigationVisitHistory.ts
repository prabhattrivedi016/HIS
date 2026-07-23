export interface PastInvestigationOrder {
  id: string;
  serviceName: string;
  orderType: string;
  investigationDate: string;
}

export interface VisitInvestigationHistory {
  visitDate: string;
  orders: PastInvestigationOrder[];
}

export const PATIENT_INVESTIGATION_HISTORY: VisitInvestigationHistory[] = [
  {
    visitDate: "2026-03-23",
    orders: [
      {
        id: "v1-1",
        serviceName: "LIPID PROFILE",
        orderType: "Routine",
        investigationDate: "2026-03-23",
      },
      {
        id: "v1-2",
        serviceName: "LIVER FUNCTION TEST",
        orderType: "Routine",
        investigationDate: "2026-03-23",
      },
      { id: "v1-3", serviceName: "HBA1C", orderType: "Routine", investigationDate: "2026-03-24" },
    ],
  },
  {
    visitDate: "2026-01-09",
    orders: [
      {
        id: "v2-1",
        serviceName: "COMPLETE BLOOD COUNT -CBC(HB\\TLC\\PCV\\RBC\\PLATELET)",
        orderType: "Urgent",
        investigationDate: "2025-06-17",
      },
      {
        id: "v2-2",
        serviceName: "INFANTOGRAM/FETOGRAM--XRAY",
        orderType: "Routine",
        investigationDate: "2025-06-10",
      },
      {
        id: "v2-3",
        serviceName: "LEVICIKA LOTIONS 1x30ML TEMPLE WELLNESS",
        orderType: "Routine",
        investigationDate: "2025-06-10",
      },
      {
        id: "v2-4",
        serviceName: "TESTICULAR BIOPSY",
        orderType: "STAT",
        investigationDate: "2025-06-10",
      },
      {
        id: "v2-5",
        serviceName: "CT-ABDOMEN -PELVIS/LOWER ABDOMEN WITH CONTRAST",
        orderType: "Urgent",
        investigationDate: "2025-06-15",
      },
      {
        id: "v2-6",
        serviceName: "ABSCESS DRAINAGE PERINEPHRIC",
        orderType: "Emergency",
        investigationDate: "2025-06-15",
      },
    ],
  },
  {
    visitDate: "2025-12-19",
    orders: [
      {
        id: "v3-1",
        serviceName: "THYROID PROFILE (T3/T4/TSH)",
        orderType: "Routine",
        investigationDate: "2025-12-19",
      },
      {
        id: "v3-2",
        serviceName: "CHEST X-RAY PA VIEW",
        orderType: "Routine",
        investigationDate: "2025-12-19",
      },
    ],
  },
  {
    visitDate: "2025-12-02",
    orders: [
      {
        id: "v4-1",
        serviceName: "RANDOM BLOOD SUGAR",
        orderType: "STAT",
        investigationDate: "2025-12-02",
      },
      {
        id: "v4-2",
        serviceName: "URINE ROUTINE MICROSCOPY",
        orderType: "Routine",
        investigationDate: "2025-12-02",
      },
      {
        id: "v4-3",
        serviceName: "USG ABDOMEN AND PELVIS",
        orderType: "Urgent",
        investigationDate: "2025-12-03",
      },
    ],
  },
  {
    visitDate: "2025-11-05",
    orders: [
      {
        id: "v5-1",
        serviceName: "MRI BRAIN WITH CONTRAST",
        orderType: "Urgent",
        investigationDate: "2025-11-05",
      },
      {
        id: "v5-2",
        serviceName: "SERUM CREATININE",
        orderType: "Routine",
        investigationDate: "2025-11-05",
      },
    ],
  },
  {
    visitDate: "2025-09-09",
    orders: [
      { id: "v6-1", serviceName: "ECG", orderType: "Emergency", investigationDate: "2025-09-09" },
      { id: "v6-2", serviceName: "2D ECHO", orderType: "Urgent", investigationDate: "2025-09-09" },
      { id: "v6-3", serviceName: "TROPONIN I", orderType: "STAT", investigationDate: "2025-09-09" },
    ],
  },
];
