import abdmCoreClient from "@/api/abdmCoreClient";
import { AxiosError } from "axios";
import { useState } from "react";

type HTTPMethod = "GET" | "POST";
type Payload = Record<string, unknown>;

interface FetchOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

const useAbdmCoreApi = () => {
  const [loading, setLoading] = useState(false);

  const fetchAbdm = async <T>(
    method: HTTPMethod,
    url: string,
    payload: Payload = {},
    options: FetchOptions = {}
  ): Promise<T> => {
    setLoading(true);
    try {
      const response =
        method === "GET"
          ? await abdmCoreClient.get(url, options)
          : await abdmCoreClient.post(url, payload, options);

      return response.data as T;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<Record<string, unknown>>;
      if (axiosErr.response?.data && typeof axiosErr.response.data === "object") {
        return axiosErr.response.data as T;
      }

      return {
        result: false,
        message: axiosErr.message || "ABDMCore request failed",
        data: null,
      } as T;
    } finally {
      setLoading(false);
    }
  };

  return { loading, fetchAbdm };
};

export default useAbdmCoreApi;
