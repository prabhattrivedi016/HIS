import { AxiosError } from "axios";
import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { extractLineInfo } from "../utils/errorUtils";

type HTTPMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type Payload = Record<string, any>;

interface FetchApiOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

interface FetchMeta {
  component?: string;
  silent?: boolean;
  throwOnError?: boolean;
}

export type ApiError = {
  message: string;
  status?: number;
  data?: any;

  component?: string;
  method?: string;
  url?: string;

  stack?: string;
  line?: number;
  column?: number;
};

const useGlobalApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchApi = async <T = any>(
    method: HTTPMethod,
    url: string,
    payload: Payload = {},
    options: FetchApiOptions = {},
    meta: FetchMeta = {}
  ): Promise<T | null> => {
    setLoading(true);
    if (!meta.silent) setError(null);

    try {
      let response;

      switch (method) {
        case "GET":
          response = await axiosInstance.get(url, options);
          break;
        case "POST":
          response = await axiosInstance.post(url, payload, options);
          break;
        case "PUT":
          response = await axiosInstance.put(url, payload, options);
          break;
        case "PATCH":
          response = await axiosInstance.patch(url, payload, options);
          break;
        case "DELETE":
          response = await axiosInstance.delete(url, options);
          break;
        default:
          throw new Error("Invalid HTTP method");
      }

      return response.data as T;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<any>;

      const stack = axiosErr.stack;
      const { line, column } = extractLineInfo(stack);

      const apiError: ApiError = {
        message: axiosErr.response?.data?.message || axiosErr.message || "Something went wrong",

        status: axiosErr.response?.status,
        data: axiosErr.response?.data,

        component: meta.component,
        method,
        url,

        stack: import.meta.env.DEV ? stack : undefined,
        line: import.meta.env.DEV ? line : undefined,
        column: import.meta.env.DEV ? column : undefined,
      };

      if (!meta.silent) setError(apiError);

      // 🔐 future global handling
      if (apiError.status === 401) {
        // logout / redirect hook
      }

      if (meta.throwOnError) {
        throw apiError;
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchApi };
};

export default useGlobalApi;
