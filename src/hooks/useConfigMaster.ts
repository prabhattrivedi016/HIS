import { useEffect, useState } from "react";
import { ENDPOINTS } from "../config/defaults";
import useGlobalApi from "./useGlobalApi";

export const useConfigMaster = (fieldName: string) => {
  const { fetchApi } = useGlobalApi();
  const [configDataValue, setConfigDataValue] = useState(null);

  const getConfigMasterValue = async (fieldName: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.MASTER_CONFIG,
      {},
      { params: { configKey: fieldName } },
      { component: "configMasterHook", silent: true }
    );

    const parsedJson = JSON.parse(resp?.data?.[0]?.configJson ?? {});

    setConfigDataValue(parsedJson);
  };

  useEffect(() => {
    getConfigMasterValue(fieldName);
  }, []);

  return { configDataValue };
};
