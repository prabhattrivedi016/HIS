import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../config/defaults";

export const usePickMaster = ({ fieldName }: { fieldName: string }) => {
  const [pickMasterValue, setPickMasterValue] = useState("");

  const getPickMasterValue = async (fieldName: string) => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.GET_PICKLIST_MASTER, {
        params: { fieldName },
      });
      setPickMasterValue(res?.data);
    } catch (err) {
      console.log("error while fetching pick master value", err);
    }
  };

  useEffect(() => {
    getPickMasterValue(fieldName);
  });

  return { pickMasterValue };
};
