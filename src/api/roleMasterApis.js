import { ENDPOINTS } from "../config/defaults";
import axiosInstance from "./axiosInstance";

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

// role master status update
/**
 * @param {{ roleId: string|number, isActive: boolean }} updateData
 */
export const updateForRoleMasterstatus = async updateData => {
  try {
    const response = await axiosInstance.patch(
      ENDPOINTS.UPDATE_ROLE_MASTER_STATUS,
      null, // no body since we're sending query params
      {
        params: {
          roleId: updateData.roleId,
          isActive: updateData.isActive,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error updating role master status:", error);
    throw error;
  }
};

// role master role icon  Admin/getFaIconList
export const getFaIconList = async () => {
  const response = await axiosInstance.get(ENDPOINTS.FA_ICON_LIST);
  return response;
};

// create update role master
/**
 * @param {Object} createData
 */
export const createUpdateRoleMaster = async createData => {
  const payload = {
    ...createData,
  };
  return await axiosInstance.post(ENDPOINTS.CREATE_UPDATE_ROLE_MASTER, payload);
};
