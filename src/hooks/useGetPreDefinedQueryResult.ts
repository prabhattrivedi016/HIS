import { ENDPOINTS } from "@/config/defaults";
import { useQuery } from "@tanstack/react-query";
import useGlobalApi from "./useGlobalApi";

export type PreDefinedQueryResultType = "ipdSummaryBillByBranch" | "otherType";

const useGetPreDefinedQueryResult = ({
  queryName,
  filter1 = 0,
  filter2 = 0,
}: {
  queryName: string;
  filter1?: number | string;
  filter2?: number | string;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const getPreDefinedQueryResult = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PREDEFINE_QUERY_RESULT,
      {},
      { params: { queryName, filter1, filter2 } },
      { component: "useGetPreDefinedQueryResult" }
    );
    return resp?.data ?? [];
  };

  const { data: predefinedQueryResult = [] } = useQuery({
    queryKey: ["predefinedQueryResult", queryName, filter1, filter2],
    queryFn: () => getPreDefinedQueryResult(),
  });

  return { predefinedQueryResult };
};

export default useGetPreDefinedQueryResult;
