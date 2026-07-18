import { ENDPOINTS } from "@/config/defaults";
import { useEffect, useState } from "react";
import useGlobalApi from "./useGlobalApi";

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
    ).then(resp => setFavorites((resp as { data?: Record<string, unknown>[] })?.data ?? []));
  }, [doctorId, entityId]);

  const setFavorite = (entry: Record<string, unknown>, isFavorite: boolean, recordId?: unknown) => {
    setFavorites(prev =>
      isFavorite ? [...prev, entry] : prev.filter(f => JSON.stringify(f) !== JSON.stringify(entry))
    );
    if (!doctorId || !entityId) return;
    fetchApi(
      "POST",
      ENDPOINTS.SAVE_DOCTOR_FAVOURITE_TABLE_ENTRIES,
      { doctorId, entityId, recordId, isFavorite, entry },
      {},
      { component: "useDoctorFavourites", silent: true }
    );
  };

  return { favorites, setFavorite };
};

export default useDoctorFavourites;
