import axios from "axios";
import { getAuthStorage } from "../utils/authStorage";

const axiosInstance = axios.create({
  baseURL: "http://103.217.247.236/HISWEBAPI/Api",
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

export default axiosInstance;
