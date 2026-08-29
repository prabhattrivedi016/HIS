import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { PatientVisitSummary, RawConsultationHeaderRow } from "../types";

export interface PatientVisitHistoryEntry {
  visitId: number;
  doctorId: number;
  doctorName: string;
  /** ISO yyyy-mm-dd, converted from the API's "dd-mm-yyyy" so string comparison sorts correctly
   * and `new Date(...)` (PreviousSectionVisitsStrip's formatTabDate) parses it correctly */
  recordedOn: string;
  rows: RawConsultationHeaderRow[];
}

const toIsoDate = (ddMmYyyy: string): string => {
  const [day, month, year] = (ddMmYyyy || "").split("-");
  if (!day || !month || !year) return ddMmYyyy;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

/**
 * Backs the EMR section "Past Visits" history (inline strip in EmrSectionRenderer, full list in
 * EmrSectionHistoryDrawer, "Copy Previous" in MedicineListControl) with real backend data:
 * GET_PATIENT_VISIT_DETAILS_BY_PATIENT_ID lists every visit this patient has (including the one
 * currently open — once it's saved, its own consultation data is real history too), then
 * GET_DOCTOR_CONSULTATION_BY_VISIT_ID (the same endpoint/shape ConsultationEmrSections already
 * uses to hydrate the current visit) is called per visitId, one by one, for that visit's saved
 * header values.
 *
 * React Query dedupes/caches both by query key, so calling this hook from several components at
 * once (one EmrSectionRenderer per section, plus the History drawer) only issues each request once.
 */
export const usePatientVisitHistory = (patientId?: number) => {
  const { fetchApi } = useGlobalApi();

  const visitsQuery = useQuery({
    queryKey: ["patientVisitHistory", patientId],
    queryFn: async () => {
      const resp = await fetchApi<{ data?: PatientVisitSummary[] }>(
        "GET",
        ENDPOINTS.GET_PATIENT_VISIT_DETAILS_BY_PATIENT_ID,
        {},
        { params: { patientId } },
        { component: "usePatientVisitHistory", silent: true }
      );
      return resp?.data ?? [];
    },
    enabled: patientId != null,
    staleTime: 60_000,
  });

  const visits = visitsQuery.data ?? [];

  const consultationQueries = useQueries({
    queries: visits.map(v => ({
      queryKey: ["doctorConsultationByVisitId", v.VisitId],
      queryFn: async () => {
        const resp = await fetchApi<{ data?: RawConsultationHeaderRow[] }>(
          "GET",
          ENDPOINTS.GET_DOCTOR_CONSULTATION_BY_VISIT_ID,
          {},
          { params: { visitId: v.VisitId } },
          { component: "usePatientVisitHistory", silent: true }
        );
        return resp?.data ?? [];
      },
      staleTime: 5 * 60_000,
    })),
  });

  const historyEntries = useMemo<PatientVisitHistoryEntry[]>(
    () =>
      visits
        .map((v, idx) => {
          const rows = consultationQueries[idx]?.data ?? [];
          // a row's CreatedOn is a real date+time (confirmed present in the API response); the
          // visit-list endpoint's VisitDate is date-only. Prefer the latest CreatedOn among this
          // visit's rows when there is one — strictly more precise, and lets an actual time show
          // up wherever recordedOn is rendered, with no change for a visit with no rows saved yet
          // (still falls back to the date-only value).
          const latestCreatedOn = rows.reduce<string | null>((latest, row) => {
            if (!row.CreatedOn) return latest;
            return !latest || row.CreatedOn > latest ? row.CreatedOn : latest;
          }, null);
          return {
            visitId: v.VisitId,
            doctorId: v.DoctorId,
            doctorName: v.DoctorName,
            recordedOn: latestCreatedOn ?? toIsoDate(v.VisitDate),
            rows,
          };
        })
        .sort((a, b) => b.recordedOn.localeCompare(a.recordedOn)),
    [visits, consultationQueries]
  );

  /** this section's rows from every past visit that has any, newest first */
  const getSectionRows = useCallback(
    (sectionId: number) =>
      historyEntries
        .map(entry => ({ ...entry, rows: entry.rows.filter(r => r.SectionId === sectionId) }))
        .filter(entry => entry.rows.length > 0),
    [historyEntries]
  );

  return {
    isLoading: visitsQuery.isLoading || consultationQueries.some(q => q.isLoading),
    /** every visit this patient has, newest first, each with ALL of its rows (unfiltered by
     * section) — e.g. PrintPreviewModal's "print a past visit" picker needs the whole visit, not
     * one section's slice of it */
    visits: historyEntries,
    getSectionRows,
  };
};
