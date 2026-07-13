import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  otpSchema,
  resetPasswordSchema,
  userNameAndMobileSchema,
} from "@/validation/forgotPasswordSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "../../../../assets/svgIcons";
import InputField from "../../../components/customInputField";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText/index";
import { ENDPOINTS } from "../../../config/defaults/index";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { stopPropagationHandler } from "../../../utils/utilities";
import { ForgotPasswordProps } from "../type";

const ForgotPassword = ({ onClose }: ForgotPasswordProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [hintMessage, setHintMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userId, setUserId] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // const [contactHint, setContactHint] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  let contactHint = "";

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

  // send otp
  const sendOtp = async (data: { userName: string; contact: string }) => {
    const response = await fetchApi("POST", ENDPOINTS.SEND_SMS_OTP, {
      userName: data?.userName,
      contact: data?.contact,
    });
    if (!response?.result) {
      setErrorMessage(response?.message ?? "Failed to send OTP");
      return;
    }
    setErrorMessage("");
    setOtpSent(true);
    setUserId(response?.data?.userId);
    setHintMessage(response?.message ?? "OTP sent successfully");
  };

  // verify otp

  const verifyOtp = async (data: { otp: string }) => {
    const response = await fetchApi("POST", ENDPOINTS.VERIFY_SMS_OTP, {
      otp: data?.otp,
      userId: userId,
    });

    if (!response?.result) {
      setErrorMessage(response?.message ?? "Failed to verify OTP");
      return;
    }
    setErrorMessage("");
    setSuccessMessage(response?.message ?? "OTP verified successfully");
    setOtpVerified(true);
    setVerifiedOtp(response?.data?.otp);
  };

  // reset password
  const resetPassword = async (data: { newPassword: string; confirmPassword: string }) => {
    const response = await fetchApi("POST", ENDPOINTS.RESET_PASSWORD_BY_USERID, {
      userId: userId,
      otp: verifiedOtp,
      newPassword: data?.newPassword,
      confirmPassword: data?.confirmPassword,
    });
    if (!response?.result) {
      setErrorMessage(response?.message ?? "Failed to reset password");
      return;
    }
    setSuccessMessage(response?.message ?? "Password reset successfully");
    setErrorMessage("");
    setTimeout(() => {
      onClose();
    }, 2000);
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

        <div className="mb-2">
          {successMessage && <SuccessMessage text={successMessage} />}

          {error && <ErrorMessage text={error?.message} />}
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
                <p className="input-field-error">{sendOtpErrors.userName.message}</p>
              )}

              <InputField label="Mobile Number" required={true}>
                <input
                  type="tel"
                  maxLength={10}
                  minLength={10}
                  onInput={allowOnlyNumbers}
                  {...registerSendOtp("contact")}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </InputField>
              {sendOtpErrors.contact && (
                <p className="input-field-error">{sendOtpErrors?.contact?.message}</p>
              )}
              {contactHint && (
                <p className="text-sm text-gray-600 text-center">
                  Registered Contact Number is: <span className="font-semibold">{contactHint}</span>
                </p>
              )}

              <button type="submit" className="w-full save-btn flex items-center justify-center">
                {loading ? (
                  <div className=" flex items-center gap-2">
                    <Spinner />
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          </>
        )}

        {otpSent && !otpVerified && (
          <>
            <form onSubmit={handleVerifyOtpSubmit(verifyOtp)} className="space-y-4">
              <InputField label="Enter OTP" required={true}>
                <input
                  {...registerVerifyOtp("otp")}
                  className="w-full px-4 py-2 border rounded-lg"
                  minLength={6}
                  maxLength={6}
                  onInput={allowOnlyNumbers}
                />
              </InputField>

              {verifyOtpErrors.otp && (
                <p className="input-field-error">{verifyOtpErrors.otp.message}</p>
              )}

              {hintMessage && <p className="text-sm text-gray-600">{hintMessage}</p>}
              <button type="submit" className="w-full save-btn flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <span>Verifying OTP...</span>
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>
          </>
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

            {resetPassErrors?.newPassword && (
              <p className="input-field-error">{resetPassErrors?.newPassword?.message}</p>
            )}

            <InputField label="Confirm Password" required={true}>
              <input
                type="password"
                {...registerResetPass("confirmPassword")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </InputField>

            {resetPassErrors?.confirmPassword && (
              <p className="input-field-error">{resetPassErrors?.confirmPassword?.message}</p>
            )}

            <button type="submit" className="w-full login-btn">
              Reset Password
            </button>
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
