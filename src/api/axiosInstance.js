import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://103.217.247.236/HISWEBAPI/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
