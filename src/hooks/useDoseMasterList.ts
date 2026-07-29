import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useQuery } from "@tanstack/react-query";

/** raw shape of a row from GET_DOSE_MASTER_LIST — the backend returns PascalCase here even
 * though CREATE_UPDATE_DOSE_MASTER's own request body is camelCase */
export interface DoseMasterRecord {
  DoseId: number;
  Dose: string;
  DoseTimes: string;
  DoseTimeLabels: string;
  IsActive: number;
}

/** shared react-query key — DoseMasterModal (the "Dose Master" popup, where new patterns are
 * created) and MedicineListControl (the Dose Unit dropdown that consumes them) both read through
 * this same hook/key, so invalidating it after a save refreshes the dropdown automatically
 * without either component having to know about the other */
export const DOSE_MASTER_QUERY_KEY = ["doseMasterList"];

export const useDoseMasterList = () => {
  const { fetchApi } = useGlobalApi();

  const query = useQuery<DoseMasterRecord[]>({
    queryKey: DOSE_MASTER_QUERY_KEY,
    queryFn: async () => {
      // doseId is a filter for one specific record, not a "0 = all" sentinel — omit it
      // entirely to fetch the whole list (sending doseId=0 filtered every row out, since no
      // record actually has id 0)
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_DOSE_MASTER_LIST,
        {},
        { params: { isActive: 1 } },
        { component: "useDoseMasterList", silent: true }
      );
      return Array.isArray(resp?.data) ? (resp.data as DoseMasterRecord[]) : [];
    },
  });

  return { doseMasterList: query.data ?? [], isLoading: query.isLoading };
};
