import { ENDPOINTS } from "@/config/defaults";
import { useCallback, useEffect, useState } from "react";
import useGlobalApi from "./useGlobalApi";

export const usePickMaster = (fieldName: string) => {
  const { fetchApi } = useGlobalApi();
  const [pickMasterValue, setPickMasterValue] = useState<any[]>([]);

  const getPickMasterValue = useCallback(async () => {
    if (!fieldName) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PICKLIST_MASTER,
      {},
      { params: { fieldName } },
      { component: "pickMasterHook", silent: true }
    );

    setPickMasterValue(resp?.data ?? []);
  }, [fieldName]);

  useEffect(() => {
    getPickMasterValue();
  }, [getPickMasterValue]);

  return { pickMasterValue };
};
