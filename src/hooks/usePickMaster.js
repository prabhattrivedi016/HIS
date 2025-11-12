import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../config/defaults";

export const usePickMaster = () => {
  const [pickMasterValue, setPickMasterValue] = useState("");

  const getPickMasterValue = async (fieldName) => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.GET_PICKLIST_MASTER, {
        params: { fieldName },
      });
      setPickMasterValue(res?.data);
    } catch (err) {
      console.log("error while fetching pick master value", err);
    }
  };

  return { pickMasterValue, getPickMasterValue };
};
