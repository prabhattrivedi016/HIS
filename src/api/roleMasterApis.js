import axiosInstance from "./axiosInstance";
import { ENDPOINTS } from "../config/defaults";

// role master list

export const getRoleMaster = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.ROLE_MASTER_LIST);
    return response;
  } catch (error) {
    console.log("Error while fetching role master data ", error);
    throw error;
  }
};
