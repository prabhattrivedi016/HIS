import { useState } from "react";

import axiosInstance from "../api/axiosInstance";

const useGlobalApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   *
   * @param {String} method - GET | POST | PUT | DELETE
   * @param {String} url - API endpoint
   * @param {Object} payload - body for POST/PUT
   * @param {Object} options - additional config (headers, params etc.)
   */
  const fetchApi = async (method, url, payload = {}, options = {}) => {
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

        case "DELETE":
          response = await axiosInstance.delete(url, options);
          break;

        default:
          throw new Error("Invalid HTTP method provided");
      }

      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchApi };
};

export default useGlobalApi;
