type HTTPMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type payload = Record<string, any>;

interface fetchApiOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  [key: string]: any;
}

import { useState } from "react";

import { AxiosError } from "axios";
import axiosInstance from "../api/axiosInstance";

const useGlobalApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   *
   * @param {String} method - GET | POST | PUT | DELETE
   * @param {String} url - API endpoint
   * @param {Object} payload - body for POST/PUT
   * @param {Object} options - additional config (headers, params etc.)
   */
  const fetchApi = async (
    method: HTTPMethod,
    url: string,
    payload: payload = {},
    options: fetchApiOptions = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (method.toUpperCase()) {
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
          throw new Error("Invalid HTTP method from global api provided");
      }

      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      setError(err?.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchApi };
};

export default useGlobalApi;
