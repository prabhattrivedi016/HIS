import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { resetPasswordByUserId, sendOtpApi, verifySmsOtp } from "../../../api/AuthServices";
import Button from "../../../components/customButton";
import InputField from "../../../components/customInputField";
import { stopPropagationHandler } from "../../../utils/utilities";
import {
  otpSchema,
  resetPasswordSchema,
  userNameAndMobileSchema,
} from "../../../validation/forgotPasswordSchema";

const ForgotPassword = ({ onClose }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [hintMessage, setHintMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userId, setUserId] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [contactHint, setContactHint] = useState("");

  // 1) SEND OTP FORM
  const {
    register: registerSendOtp,
    handleSubmit: handleSendOtpSubmit,
    formState: { errors: sendOtpErrors },
  } = useForm({
    resolver: yupResolver(userNameAndMobileSchema),
    defaultValues: { userName: "", contact: "" },
  });

  // 2) VERIFY OTP FORM
  const {
    register: registerVerifyOtp,
    handleSubmit: handleVerifyOtpSubmit,
    formState: { errors: verifyOtpErrors },
  } = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // 3) RESET PASSWORD FORM
  const {
    register: registerResetPass,
    handleSubmit: handleResetPassSubmit,
    formState: { errors: resetPassErrors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // SEND OTP FUNCTION
  const sendOtp = async data => {
    try {
      const response = await sendOtpApi({
        userName: data.userName,
        contact: data.contact,
      });

      // console.log("otp sent successfully", response);
      setOtpSent(true);
      setUserId(response?.data?.userId);
      setHintMessage(response?.data?.message);
      setErrorMessage("");
    } catch (err) {
      const apiMessage = err?.response?.data;

      if (apiMessage) {
        setErrorMessage(apiMessage?.message);
        setContactHint(apiMessage?.contactHint);
        console.log("API Error:", apiMessage);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
        console.log("Unexpected Error:", err);
      }
    }
  };

  // VERIFY OTP FUNCTION

  const verifyOtp = async data => {
    try {
      const response = await verifySmsOtp({
        otp: data.otp,
        userId: userId,
      });

      // console.log("OTP Verified:", response);
      setOtpVerified(true);
      setErrorMessage("");
      setVerifiedOtp(response?.data?.otp);
    } catch (error) {
      console.log("error error", error);
      const apiMessage = error?.response?.data?.message || "Invalid OTP";
      setErrorMessage(apiMessage);
      setOtpVerified(false);
    }
  };

  // RESET PASSWORD FUNCTION
  const resetPassword = async data => {
    try {
      const response = await resetPasswordByUserId({
        userId: userId,
        otp: verifiedOtp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      // console.log("Password reset successfully:", response);

      setErrorMessage(""); // clear previous errors
      setSuccessMessage(response?.data?.message);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.log("Reset Password Error:", error);
      const apiMessage =
        error?.response?.data?.message || "Something went wrong while resetting password";
      setErrorMessage(apiMessage);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
             bg-linear-to-br from-indigo-900/60 via-black/50 to-indigo-800/50
             backdrop-blur-md p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-indigo-100 
                         w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10"
        onClick={stopPropagationHandler}
      >
        <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>

        <div className="mb-4">
          {successMessage && (
            <div className="animate-fade-in px-4 py-3 rounded-xl bg-green-100 border border-green-300 text-green-700 text-center font-medium shadow-sm">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="animate-fade-in px-4 py-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-center font-medium shadow-sm">
              {errorMessage}
            </div>
          )}
        </div>

        {!otpSent && (
          <>
            <form onSubmit={handleSendOtpSubmit(sendOtp)} className="space-y-4">
              <InputField label="UserName" required={true}>
                <input
                  {...registerSendOtp("userName")}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </InputField>
              {sendOtpErrors.userName && (
                <p className="text-red-500 text-sm">{sendOtpErrors.userName.message}</p>
              )}

              <InputField label="Mobile Number" required={true}>
                <input
                  type="tel"
                  maxLength={10}
                  {...registerSendOtp("contact")}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </InputField>
              {sendOtpErrors.contact && (
                <p className="text-red-500 text-sm">{sendOtpErrors.contact.message}</p>
              )}
              {contactHint && (
                <p className="text-sm text-gray-600 text-center">
                  Registered Contact Number is: <span className="font-semibold">{contactHint}</span>
                </p>
              )}

              <Button type="submit" className="w-full">
                Send OTP
              </Button>
            </form>
          </>
        )}

        {otpSent && !otpVerified && (
          <form onSubmit={handleVerifyOtpSubmit(verifyOtp)} className="space-y-4">
            <InputField label="Enter OTP" required={true}>
              <input {...registerVerifyOtp("otp")} className="w-full px-4 py-2 border rounded-lg" />
            </InputField>

            {verifyOtpErrors.otp && (
              <p className="text-red-500 text-sm">{verifyOtpErrors.otp.message}</p>
            )}

            {hintMessage && <p className="text-sm text-gray-600">{hintMessage}</p>}
            <Button type="submit" className="w-full">
              Verify OTP
            </Button>
          </form>
        )}

        {otpSent && otpVerified && (
          <form onSubmit={handleResetPassSubmit(resetPassword)} className="space-y-4">
            <InputField label="New Password" required={true}>
              <input
                type="password"
                {...registerResetPass("newPassword")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </InputField>

            {resetPassErrors.newPassword && (
              <p className="text-red-500 text-sm">{resetPassErrors.newPassword.message}</p>
            )}

            <InputField label="Confirm Password" required={true}>
              <input
                type="password"
                {...registerResetPass("confirmPassword")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </InputField>

            {resetPassErrors.confirmPassword && (
              <p className="text-red-500 text-sm">{resetPassErrors.confirmPassword.message}</p>
            )}

            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Remembered password?{" "}
          <span onClick={onClose} className="text-indigo-600 font-semibold cursor-pointer">
            Log In
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
