import { ENDPOINTS } from "../config/defaults";
import axiosInstance from "./axiosInstance";

// user master list
export const getUserMasterList = async (id = "") => {
  if (id) {
    return await axiosInstance.get(ENDPOINTS.USER_MASTER_LIST, {
      params: { userId: id },
    });
  }
  return await axiosInstance.get(ENDPOINTS.USER_MASTER_LIST);
};

// user department list
export const getUserDepartmentList = async () => {
  return await axiosInstance.get(ENDPOINTS.USER_DEPARTMENT_LIST);
};

// create a new user master

/**
 * @typedef {Object<string, any>} CreateUserData
 */

/**
 * Create or update a user master.
 * @param {CreateUserData} createUserData
 */
export const createUpdateUserMaster = async createUserData => {
  const { userId } = createUserData ?? {};
  const payload = {
    ...createUserData,
  };
  if (!userId) {
    payload.userId = "0";
  }
  return await axiosInstance.post(ENDPOINTS.CREATE_UPDATE_USER_MASTER, payload);
};

// update user master status
/**
 * @param {{ userId: string|number, isActive: boolean }} updateData
 */
export const updateForUserMasterstatus = async updateData => {
  try {
    console.log("user master active toggle is clicked");
    const response = await axiosInstance.patch(
      ENDPOINTS.UPDATE_USER_MASTER_STATUS,
      null, // no body since we're sending query params
      {
        params: {
          userId: updateData.userId,
          isActive: updateData.isActive,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error updating user master status:", error);
    throw error;
  }
};
