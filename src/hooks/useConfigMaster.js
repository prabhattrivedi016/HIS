import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../config/defaults";

export const useConfigMaster = () => {
  const [configDataValue, setConfigDataValue] = useState(null);

  const getConfigMasterValue = async fieldName => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.MASTER_CONFIG, {
        params: { configKey: fieldName },
      });

      const apiRes = res?.data?.data;

      const parsedJson = JSON.parse(apiRes[0].configJson);

      setConfigDataValue(parsedJson);
    } catch (error) {
      console.error("Error while fetching config master value:", error);
      setConfigDataValue(null);
      return null;
    }
  };

  return { configDataValue, getConfigMasterValue };
};
