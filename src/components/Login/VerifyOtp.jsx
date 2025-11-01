import React, { useEffect, useState } from "react";
import Button from "../Atomic/Button";
import InputField from "../Atomic/InputField";
import { stopPropagationHandler } from "../../utils/utilities";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  emailOtpSchema,
  mobileOtpSchema,
} from "../../validation/verifyOtpSchema";
import {
  sendOtpApi,
  verifySmsOtp,
  sendEmailOtp,
  verifyEmailOtp,
} from "../../api/AuthServices";

const VerifyOtp = ({
  userId,
  onClose,
  userName,
  contact,
  email,
  setIsContact,
  setIsEmail,
  isContact,
  isEmail,
}) => {
  // HINT / ERROR / SUCCESS STATES
  const [mobileHint, setMobileHint] = useState("");
  const [mobileOtpError, setMobileOtpError] = useState("");
  const [mobileVerifySuccess, setMobileVerifySuccess] = useState("");

  const [emailHint, setEmailHint] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailVerifySuccess, setEmailVerifySuccess] = useState("");

  // STOP PROPAGATION HANDLER
  const stopPropagationHandler = (e) => {
    e.stopPropagation();
  };

  // SEND MOBILE OTP
  const sendMobileOtp = async () => {
    try {
      const response = await sendOtpApi({ userName, contact });
      setMobileHint(response?.data?.message || "OTP Sent");
      setMobileOtpError("");
    } catch (err) {
      setMobileOtpError(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  // SEND EMAIL OTP
  const sendEmailOtpVerify = async () => {
    try {
      const response = await sendEmailOtp({ userName, email });
      setEmailHint(response?.data?.message || "OTP Sent");
      setEmailOtpError("");
    } catch (error) {
      setEmailOtpError(error?.response?.data?.message || "Failed to send OTP");
    }
  };

  // AUTO SEND OTP DEPENDING ON VERIFY STATUS
  useEffect(() => {
    if (!isContact && !isEmail) {
      sendMobileOtp();
      sendEmailOtpVerify();
    } else if (!isContact) {
      sendMobileOtp();
    } else if (!isEmail) {
      sendEmailOtpVerify();
    }
  }, [isContact, isEmail, contact, email]);

  // AUTO CLOSE MODAL WHEN BOTH VERIFIED
  useEffect(() => {
    if (isContact && isEmail) {
      const timer = setTimeout(() => {
        onClose();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isContact, isEmail, onClose]);

  // VERIFY MOBILE OTP
  const verifyMobile = async (data) => {
    try {
      const response = await verifySmsOtp({
        otp: data.otp,
        userId: userId,
      });

      setMobileVerifySuccess(response?.data?.message);
      setIsContact(true);
      setMobileOtpError("");
      setMobileHint("");
    } catch (err) {
      setMobileOtpError(err?.response?.data?.message);
    }
  };

  // VERIFY EMAIL OTP
  const verifyEmail = async (data) => {
    try {
      const response = await verifyEmailOtp({ userId, otp: data.otp });

      setEmailVerifySuccess(response?.data?.message);
      setIsEmail(true);
      setEmailOtpError("");
      setEmailHint("");
    } catch (err) {
      setEmailOtpError(err?.response?.data?.message);
    }
  };

  // MOBILE OTP FORM
  const {
    register: registerMobileOtp,
    handleSubmit: handleMobileOtpSubmit,
    formState: { errors: mobileErrors },
  } = useForm({
    resolver: yupResolver(mobileOtpSchema),
  });

  // EMAIL OTP FORM
  const {
    register: registerEmailOtp,
    handleSubmit: handleEmailOtpSubmit,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: yupResolver(emailOtpSchema),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-300 p-6 rounded-xl w-[350px] shadow-lg"
        onClick={stopPropagationHandler}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Verify OTP</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Helper Form Renderers */}
        {(() => {
          const renderMobileForm = () => (
            <>
              <form
                onSubmit={handleMobileOtpSubmit(verifyMobile)}
                className="space-y-2"
              >
                <InputField
                  label={isContact ? "Mobile Verified " : "Enter Mobile OTP"}
                >
                  <input
                    type="text"
                    {...registerMobileOtp("otp")}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isContact ? "border-green-500 bg-green-50" : ""
                    }`}
                    disabled={isContact}
                  />
                </InputField>

                {mobileHint && (
                  <p className="text-gray-600 text-sm">{mobileHint}</p>
                )}
                {mobileErrors?.otp && (
                  <p className="text-red-500 text-sm">
                    {mobileErrors.otp.message}
                  </p>
                )}
                {mobileOtpError && (
                  <p className="text-red-500 text-sm">{mobileOtpError}</p>
                )}

                <Button type="submit" className="w-full" disabled={isContact}>
                  {isContact ? "Verified " : "Verify Mobile OTP"}
                </Button>
              </form>

              {mobileVerifySuccess && (
                <div className="animate-fade-in px-4 py-3 rounded-xl bg-green-100 border border-green-300 text-green-700 text-center font-medium shadow-sm">
                  {mobileVerifySuccess}
                </div>
              )}
            </>
          );

          const renderEmailForm = () => (
            <>
              <form
                onSubmit={handleEmailOtpSubmit(verifyEmail)}
                className="space-y-2 mt-4"
              >
                <InputField
                  label={isEmail ? "Email Verified " : "Enter Email OTP"}
                >
                  <input
                    type="text"
                    {...registerEmailOtp("otp")}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isEmail ? "border-green-500 bg-green-50" : ""
                    }`}
                    disabled={isEmail}
                  />
                </InputField>

                {emailHint && (
                  <p className="text-gray-600 text-sm">{emailHint}</p>
                )}
                {emailErrors?.otp && (
                  <p className="text-red-500 text-sm">
                    {emailErrors.otp.message}
                  </p>
                )}
                {emailOtpError && (
                  <p className="text-red-500 text-sm">{emailOtpError}</p>
                )}

                {emailVerifySuccess && (
                  <div className="animate-fade-in px-4 py-3 rounded-xl bg-green-100 border border-green-300 text-green-700 text-center font-medium shadow-sm">
                    {emailVerifySuccess}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isEmail}>
                  {isEmail ? "Verified " : "Verify Email OTP"}
                </Button>
              </form>
            </>
          );

          //  MOBILE + EMAIL needed
          if (!isContact && !isEmail)
            return (
              <>
                {renderMobileForm()}
                {renderEmailForm()}
              </>
            );

          //  ONLY MOBILE needed
          if (!isContact && isEmail) return renderMobileForm();

          //  ONLY EMAIL needed
          if (isContact && !isEmail) return renderEmailForm();

          return null;
        })()}
      </div>
    </div>
  );
};
export default VerifyOtp;
