import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endPoints";

const useGetBranchList = () => {
  const [branchList, setBranchList] = useState();

  const fetchBranchList = async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.GET_BRANCHES);
      setBranchList(res?.data ?? []);
    } catch (error) {
      console.log(error);
    }
  };
  return { branchList, fetchBranchList };
};

export default useGetBranchList;
