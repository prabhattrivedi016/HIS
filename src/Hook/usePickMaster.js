import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endPoints";

export const usePickMaster = () => {
  const [pickMasterValue, setPickMasterValue] = useState("");

  const getPickMasterValue = async (fieldName) => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.GET_PICKLIST_MASTER, {
        params: { fieldName },
      });
      setPickMasterValue(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return { pickMasterValue, getPickMasterValue };
};
