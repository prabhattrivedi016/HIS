import { ENDPOINTS } from "../config/defaults";
import axiosInstance from "./axiosInstance";

// User Login
/**
 * @param {*} loginData
 */
export const userLogin = async loginData => {
  return await axiosInstance.post(ENDPOINTS.LOGIN, loginData);
};

// User Signup
/**
 * @param {*} signupData
 */
export const userSignup = async signupData => {
  return await axiosInstance.post(ENDPOINTS.USER_SIGNUP, signupData);
};

// Get Active Branch List
export const getActiveBranchList = async () => {
  const response = await axiosInstance.get(ENDPOINTS.GET_BRANCHES);
  return response.data;
};

// Send OTP (SMS)
/**
 * @param {*} payload
 */
export const sendOtpApi = async payload => {
  return await axiosInstance.post(ENDPOINTS.SEND_OTP, payload);
};

// Verify SMS OTP
/**
 * @param {*} payload
 */
export const verifySmsOtp = async payload => {
  return await axiosInstance.post(ENDPOINTS.VERIFY_SMS_OTP, payload);
};

// Reset Password by UserID
/**
 * @param {*} payload
 */
export const resetPasswordByUserId = async payload => {
  return await axiosInstance.post(ENDPOINTS.RESET_PASSWORD_BY_USERID, payload);
};

// Verify Email OTP
/**
 * @param {*} payload
 */
export const verifyEmailOtp = async payload => {
  return await axiosInstance.post(ENDPOINTS.VERIFY_EMAIL_OTP, payload);
};

//send email otp
/**
 * @param {*} emailOtp
 */
export const sendEmailOtp = async emailOtp => {
  const response = await axiosInstance.post(ENDPOINTS.SEND_EMAIL_OTP, emailOtp);
  return response;
};
