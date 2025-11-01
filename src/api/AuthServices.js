import axiosInstance from "./axiosInstance";
import { ENDPOINTS } from "./endPoints";

// User Login
export const userLogin = async (loginData) => {
  try {
    return await axiosInstance.post(ENDPOINTS.LOGIN, loginData);
  } catch (err) {
    throw err;
  }
};

// User Signup
export const userSignup = async (signupData) => {
  try {
    return await axiosInstance.post(ENDPOINTS.USER_SIGNUP, signupData);
  } catch (err) {
    throw err;
  }
};

// Get Active Branch List
export const getActiveBranchList = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.GET_BRANCHES);
    return response.data;
  } catch (err) {
    throw err;
  }
};

// Send OTP (SMS)
export const sendOtpApi = async (payload) => {
  try {
    return await axiosInstance.post(ENDPOINTS.SEND_OTP, payload);
  } catch (err) {
    throw err;
  }
};

// Verify SMS OTP
export const verifySmsOtp = async (payload) => {
  try {
    return await axiosInstance.post(ENDPOINTS.VERIFY_SMS_OTP, payload);
  } catch (err) {
    throw err;
  }
};

// Reset Password by UserID
export const resetPasswordByUserId = async (payload) => {
  try {
    return await axiosInstance.post(
      ENDPOINTS.RESET_PASSWORD_BY_USERID,
      payload
    );
  } catch (err) {
    throw err;
  }
};

// Send Email OTP
export const sendEmailOtp = async (payload) => {
  try {
    return await axiosInstance.post(ENDPOINTS.SEND_EMAIL_OTP, payload);
  } catch (err) {
    throw err;
  }
};

// Verify Email OTP
export const verifyEmailOtp = async (payload) => {
  try {
    return await axiosInstance.post(ENDPOINTS.VERIFY_EMAIL_OTP, payload);
  } catch (err) {
    throw err;
  }
};
