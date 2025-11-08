import axiosInstance from "./axiosInstance";
import { ENDPOINTS } from "../config/defaults";

// user master list
export const getUserMasterList = async () => {
  try {
    return await axiosInstance.get(ENDPOINTS.USER_MASTER_LIST);
  } catch (error) {
    throw error;
  }
};
