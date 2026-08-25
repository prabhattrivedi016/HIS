import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useEffect, useMemo, useState } from "react";
import { EmrSectionVisitSnapshotEntry, RawConsultationHeaderRow } from "../types";

/**
 * This visit's already-saved header values, keyed by section — so a template/section view that
 * reopens mid-session shows prior answers and upserts (dataId) instead of duplicating rows.
 * Extracted from TemplateFillerModal.tsx (its original, verbatim copy of what
 * ConsultationEmrSections.tsx computes for itself) so TemplateInlineSections can reuse the exact
 * same logic instead of a second hand-copied version drifting out of sync.
 */
export const useVisitSavedHeaderValues = (visitId?: number, enabled = true) => {
  const { fetchApi } = useGlobalApi();
  const [savedHeaderRows, setSavedHeaderRows] = useState<RawConsultationHeaderRow[]>([]);

  useEffect(() => {
    if (!enabled || visitId == null) {
      setSavedHeaderRows([]);
      return;
    }

    let cancelled = false;
    (async () => {
      const resp = await fetchApi<{ data?: RawConsultationHeaderRow[] }>(
        "GET",
        ENDPOINTS.GET_DOCTOR_CONSULTATION_BY_VISIT_ID,
        {},
        { params: { visitId } },
        { component: "useVisitSavedHeaderValues", silent: true }
      );
      if (cancelled) return;
      setSavedHeaderRows(resp?.data ?? []);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, visitId]);

  const savedHeaderValuesBySectionId = useMemo(() => {
    const map = new Map<number, EmrSectionVisitSnapshotEntry["values"]>();
    savedHeaderRows.forEach(row => {
      let value: unknown;
      try {
        value = JSON.parse(row.HeaderValue);
      } catch {
        value = row.HeaderValue;
      }
      const bucket = map.get(row.SectionId) ?? [];
      bucket.push({ headerId: row.HeaderId, headerName: "", controlType: "", value });
      map.set(row.SectionId, bucket);
    });
    return map;
  }, [savedHeaderRows]);

  const savedDataIdsByHeaderId = useMemo(() => {
    const map = new Map<number, number>();
    savedHeaderRows.forEach(row => map.set(row.HeaderId, row.DataId));
    return map;
  }, [savedHeaderRows]);

  return { savedHeaderValuesBySectionId, savedDataIdsByHeaderId };
};
