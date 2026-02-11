import { ENDPOINTS } from "@/config/defaults";
import { useEffect, useState } from "react";
import useGlobalApi from "./useGlobalApi";

type BranchItem = {
  branchId: number;
  branchName: string;
};

interface ApiResp {
  result: string;
  messageType: string;
  message: string;
  data: BranchItem[];
}

const useGetBranchList = () => {
  const { error, fetchApi } = useGlobalApi();

  const [branchList, setBranchList] = useState<ApiResp | null>(null);
  const fetchBranchList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BRANCHES,
      {},
      {},
      { component: "branchListHook" }
    );

    setBranchList(resp);
  };

  useEffect(() => {
    fetchBranchList();
  }, []);

  return { branchList };
};

export default useGetBranchList;
