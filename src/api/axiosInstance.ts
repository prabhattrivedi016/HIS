import axios from "axios";
import { getAuthStorage } from "../utils/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  config => {
    const storage = getAuthStorage();
    const token = storage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const storage = getAuthStorage();
      storage.removeItem("auth");
      storage.removeItem("accessToken");
      storage.removeItem("role");
      localStorage.removeItem("auth");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      sessionStorage.removeItem("auth");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("role");

      window.dispatchEvent(new CustomEvent("unauthorized", { detail: { status: 401 } }));

      window.location.replace(`${window.location.origin}/GWSNHIS`);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
