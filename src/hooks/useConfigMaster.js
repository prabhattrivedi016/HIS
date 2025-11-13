import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../config/defaults";

export const useConfigMaster = () => {
  const [configDataValue, setConfigDataValue] = useState(null);

  const getConfigMasterValue = async fieldName => {
    try {
      //  API call with query param
      const response = await axiosInstance.get(ENDPOINTS.MASTER_CONFIG, {
        params: { configKey: fieldName },
      });

      //  response
      const data = Array.isArray(response?.data?.data)
        ? response?.data?.data[0]
        : response?.data?.data;

      if (!data?.configJson) {
        console.warn(" No configJson found in API response");
        return;
      }

      let configString = data.configJson;

      // Parse data
      const parsedJson = JSON.parse(configString);
      setConfigDataValue(parsedJson);

      console.log(" Parsed Config Object:", parsedJson);
    } catch (error) {
      console.error(" Error while fetching config master value:", error);
      setConfigDataValue(null);
    }
  };

  return { configDataValue, getConfigMasterValue };
};
