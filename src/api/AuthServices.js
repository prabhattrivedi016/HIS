import axiosInstance from "./axiosInstance";
import { ENDPOINTS } from "./endPoints";

// User Login
export const userLogin = async (loginData) => {
  try {
    console.log("Login Payload:", JSON.stringify(loginData, null, 2));

    const response = await axiosInstance.post(ENDPOINTS.LOGIN, loginData);

    return response;
  } catch (err) {
    throw err;
  }
};

//  User Signup
export const userSignup = async (signupData) => {
  try {
    const payload = {
      ...signupData,
      userId: 0,
      isActive: true,
      employeeID: "",
    };

    const response = await axiosInstance.post(ENDPOINTS.SIGNUP, payload);

    return response ?? []; //TODO: check response type for fallback
  } catch (err) {
    throw err;
  }
};

// Get Active Branch List
export const getActiveBranchList = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.GET_BRANCHES);
    return response.data;
  } catch (error) {
    throw err;
  }
};

//send otp
export const sendOtpApi = async (forgotPasswordData) => {
  try {
    console.log(
      "forgot password otp:",
      JSON.stringify(forgotPasswordData, null, 2)
    );

    const response = await axiosInstance.post(
      ENDPOINTS.SEND_OTP,
      forgotPasswordData
    );
    return response;
  } catch (err) {
    throw err;
  }
};

//verify sms otp
export const verifySmsOtp = async (otpData) => {
  try {
    console.log("varify opt and password", JSON.stringify(otpData, null, 2));

    const response = await axiosInstance.post(
      ENDPOINTS.VERIFY_SMS_OTP,
      otpData
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// reset password by userId
export const resetPasswordByUserId = async (resetData) => {
  console.log("varify opt and password", JSON.stringify(resetData, null, 2));
  try {
    const response = await axiosInstance.post(
      ENDPOINTS.RESET_PASSWORD_BY_USERID,
      resetData
    );
    return response;
  } catch (err) {
    throw err;
  }
};
