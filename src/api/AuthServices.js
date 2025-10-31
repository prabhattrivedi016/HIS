import axiosInstance from "./axiosInstance";
import { ENDPOINTS } from "./endPoints";

// User Login
export const userLogin = async (loginData) => {
  try {
    // console.log("Login Payload:", JSON.stringify(loginData, null, 2));

    const response = await axiosInstance.post(ENDPOINTS.LOGIN, loginData);

    return response;
  } catch (err) {
    throw err;
  }
};

// User Signup
export const userSignup = async (signupData) => {
  try {
    // console.log("userSignup Payload:", JSON.stringify(signupData, null, 2));

    const response = await axiosInstance.post(
      ENDPOINTS.USER_SIGNUP,
      signupData
    );

    return response; //TODO: fallback
  } catch (err) {
    throw err;
  }
};

// const payload = {
//   ...signupData,
// userId: 0,
// isActive: true,
// employeeID: "",
// };
//

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

//send email otp
export const sendEmailOtp = async (emailOtp) => {
  try {
    const response = await axiosInstance.post(
      ENDPOINTS.SEND_EMAIL_OTP,
      emailOtp
    );
    return response;
  } catch (err) {
    throw err;
  }
};
