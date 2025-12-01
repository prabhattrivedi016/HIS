import type { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../config/defaults";
import type { BranchListResponse } from "../screens/login/type";

const useGetBranchList = () => {
  const [branchList, setBranchList] = useState<BranchListResponse | null>(null);
  const [branchListError, setBranchListError] = useState<string>("");

  const fetchBranchList = useCallback(async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.GET_BRANCHES);
      setBranchList((res?.data as BranchListResponse) ?? []);
    } catch (error) {
      const err = error as AxiosError;
      setBranchListError(
        (err?.response?.data as string) || "Server not responding. Please retry in a moment"
      );
    }
  }, [setBranchList, setBranchListError]);

  useEffect(() => {
    fetchBranchList();
  }, []);

  return { branchList, branchListError };
};

export default useGetBranchList;
