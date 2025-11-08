import { useCallback, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../config/defaults";

const useGetBranchList = () => {
  const [branchList, setBranchList] = useState();
  const [branchListError, setBranchListError] = useState("");

  const fetchBranchList = useCallback(async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.GET_BRANCHES);
      setBranchList(res?.data ?? []);
    } catch (err) {
      setBranchListError(
        err?.response?.data || "Server not responding. Please retry in a moment"
      );
    }
  }, [setBranchList, setBranchListError]);
  return { branchList, fetchBranchList, branchListError };
};

export default useGetBranchList;
