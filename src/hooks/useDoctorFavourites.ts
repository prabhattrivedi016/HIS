import { ENDPOINTS } from "@/config/defaults";
import { useEffect, useState } from "react";
import useGlobalApi from "./useGlobalApi";

/** the backend sometimes double-encodes Entry (a JSON string containing another JSON string) */
const parseEntry = (raw: unknown): Record<string, unknown> => {
  let value: unknown = raw;
  for (let i = 0; i < 2 && typeof value === "string"; i++) {
    try {
      value = JSON.parse(value);
    } catch {
      break;
    }
  }
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
};

/**
 * Doctor-wise favourite entries for a given entity (e.g. an EMR table header, a master list…).
 * Reusable anywhere a doctor should get their own persisted shortlist of quick-pick items.
 */
export const useDoctorFavourites = (doctorId?: number, entityId?: number) => {
  const { fetchApi } = useGlobalApi();
  const [favorites, setFavorites] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!doctorId || !entityId) return;
    fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_FAVOURITE_TABLE_ENTRIES,
      {},
      { params: { doctorId, entityId } },
      { component: "useDoctorFavourites", silent: true }
    ).then(resp => {
      const raw = (resp as { data?: { Entry: string; RecordId: unknown }[] })?.data ?? [];
      setFavorites(raw.map(item => ({ ...parseEntry(item.Entry), __recordId: Number(item.RecordId) || 0 })));
    });
  }, [doctorId, entityId]);

  const setFavorite = (entry: Record<string, unknown>, isFavorite: boolean, recordId?: unknown) => {
    const numericRecordId = Number(recordId) || 0;

    setFavorites(prev =>
      isFavorite
        ? [...prev, { ...entry, __recordId: numericRecordId }]
        : prev.filter(f => f.__recordId !== numericRecordId)
    );
    if (!doctorId || !entityId) return;

    if (isFavorite) {
      fetchApi(
        "POST",
        ENDPOINTS.SAVE_DOCTOR_FAVOURITE_TABLE_ENTRY,
        {
          doctorId,
          entityId,
          recordId: numericRecordId,
          isFavorite: true,
          entry: JSON.stringify(entry),
        },
        {},
        { component: "useDoctorFavourites", silent: true }
      );
    } else {
      fetchApi(
        "PATCH",
        ENDPOINTS.DELETE_DOCTOR_FAVOURITE_TABLE_ENTRY,
        {},
        { params: { id: numericRecordId } },
        { component: "useDoctorFavourites", silent: true }
      );
    }
  };

  return { favorites, setFavorite };
};

export default useDoctorFavourites;
