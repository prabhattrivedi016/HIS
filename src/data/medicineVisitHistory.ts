export interface PastMedicineEntry {
  id: string;
  medicineName: string;
  doseQty: string;
  doseUnit: string;
  frequency: string;
  durationValue: string;
  durationUnit: string;
  route: string;
}

export interface VisitMedicineHistory {
  visitDate: string;
  entries: PastMedicineEntry[];
}

export const PATIENT_MEDICINE_HISTORY: VisitMedicineHistory[] = [
  {
    visitDate: "2026-03-23",
    entries: [
      {
        id: "m1-1",
        medicineName: "DOLO 650MG TABLET",
        doseQty: "1",
        doseUnit: "Tablet",
        frequency: "Twice a Day",
        durationValue: "5",
        durationUnit: "Day(s)",
        route: "Oral",
      },
      {
        id: "m1-2",
        medicineName: "REBAGEN 100mg TABLET 1x10 MACLEODS PHARMACEUTICALS PVT.LTD.",
        doseQty: "1",
        doseUnit: "Tablet",
        frequency: "Once a Day",
        durationValue: "10",
        durationUnit: "Day(s)",
        route: "Oral",
      },
    ],
  },
  {
    visitDate: "2025-11-05",
    entries: [
      {
        id: "m2-1",
        medicineName: "UPRISE D3 60000IU CAPSULES 1x8 ALKEM LABORATRIES LTD.(CHOLECALCIFEROL)",
        doseQty: "1",
        doseUnit: "Capsule",
        frequency: "Once a Week",
        durationValue: "4",
        durationUnit: "Week(s)",
        route: "Oral",
      },
    ],
  },
];
