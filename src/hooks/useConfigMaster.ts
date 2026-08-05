import { useEffect, useState } from "react";
import { ENDPOINTS } from "../config/defaults";
import useGlobalApi from "./useGlobalApi";

const safeParseConfigJson = (rawConfig: unknown) => {
  if (!rawConfig) return null;
  if (typeof rawConfig === "object") return rawConfig;
  if (typeof rawConfig === "string") {
    let trimmed = rawConfig.trim();
    if (!trimmed) return null;

    // 1. Try direct JSON.parse
    try {
      return JSON.parse(trimmed);
    } catch {
      // Continue to cleanup
    }

    // 2. Extract content between first { or [ and last } or ]
    const firstObj = trimmed.indexOf("{");
    const lastObj = trimmed.lastIndexOf("}");
    const firstArr = trimmed.indexOf("[");
    const lastArr = trimmed.lastIndexOf("]");

    let extracted = trimmed;

    if (firstObj !== -1 && lastObj > firstObj && (firstArr === -1 || firstObj < firstArr)) {
      extracted = trimmed.substring(firstObj, lastObj + 1);
    } else if (firstArr !== -1 && lastArr > firstArr) {
      extracted = trimmed.substring(firstArr, lastArr + 1);
    } else {
      extracted = extracted.replace(/^[^{[]*/, "").replace(/[^}\]]*$/, "");
    }

    // 3. Try JSON.parse on extracted string
    try {
      return JSON.parse(extracted);
    } catch {
      // Continue to JS evaluation
    }

    // 4. Try JS Object evaluation
    try {
      return new Function(`return (${extracted});`)();
    } catch {
      try {
        return new Function(`${trimmed}; return typeof config !== 'undefined' ? config : null;`)();
      } catch (err) {
        console.error("Failed to parse configJson:", err);
        return null;
      }
    }
  }
  return null;
};

export const useConfigMaster = (fieldName: string) => {
  const { fetchApi } = useGlobalApi();
  const [configDataValue, setConfigDataValue] = useState<any>(null);

  const getConfigMasterValue = async (key: string) => {
    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.MASTER_CONFIG,
        {},
        { params: { configKey: key } },
        { component: "configMasterHook", silent: true }
      );

      const rawJson = resp?.data?.[0]?.configJson;
      const parsedJson = safeParseConfigJson(rawJson);

      setConfigDataValue(parsedJson);
    } catch (error) {
      console.error("Error fetching master config:", error);
      setConfigDataValue(null);
    }
  };

  useEffect(() => {
    if (fieldName) {
      void getConfigMasterValue(fieldName);
    }
  }, [fieldName]);

  return { configDataValue };
};
