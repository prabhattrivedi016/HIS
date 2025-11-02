import React, { useEffect, useState } from "react";
import Button from "../Atomic/Button";
import InputField from "../Atomic/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  SuccessMessage,
  HintMessage,
  ErrorMessage,
  ModalHeader,
} from "../../ui/InfoText";

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
import ResendButton from "./ResendButton";

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
  // STATES
  const [mobileHint, setMobileHint] = useState("");
  const [mobileVerifyError, setMobileVerifyError] = useState("");
  const [mobileVerifySuccess, setMobileVerifySuccess] = useState("");

  const [emailHint, setEmailHint] = useState("");
  const [emailVerifyError, setEmailVerifyError] = useState("");
  const [emailVerifySuccess, setEmailVerifySuccess] = useState("");

  // SEND MOBILE OTP
  const sendMobileOtp = async () => {
    try {
      const response = await sendOtpApi({ userName, contact });
      setMobileHint(response?.data?.message);
    } catch (err) {
      setMobileVerifyError(
        err?.response?.data?.message || "Something went wrong!"
      );
    }
  };

  // SEND EMAIL OTP
  const sendEmailOtpVerify = async () => {
    try {
      const res = await sendEmailOtp({ userName, email });
      setEmailHint(res?.data?.message);
    } catch (err) {
      setEmailVerifyError(
        err?.response?.data?.message || "Something went wrong!"
      );
    }
  };

  // VERIFY MOBILE OTP
  const verifyMobile = async (data) => {
    console.log("verify mobile is called");
    try {
      const response = await verifySmsOtp({ otp: data.otp, userId });
      const apiResponse = response?.data;
      setMobileVerifySuccess(apiResponse?.message);
      console.log(apiResponse?.message);
      setIsContact(apiResponse?.result ?? false);
      setMobileVerifyError("");
    } catch (err) {
      const apiError = err?.response?.data;
      setMobileVerifyError(
        apiError?.message || "Something Went Wrong, Try again!"
      );
    }
  };

  // VERIFY EMAIL OTP
  const verifyEmail = async (data) => {
    try {
      const response = await verifyEmailOtp({ userId, otp: data.otp });
      const apiResponse = response?.data;
      setEmailVerifySuccess(apiResponse?.message);
      console.log(apiResponse?.message);
      setIsEmail(apiResponse?.result);
      setEmailVerifyError("");
    } catch (err) {
      const apiError = err?.response?.data;
      setEmailVerifyError(
        apiError?.message || "Something Went Wrong, Try again!"
      );
    }
  };

  useEffect(() => {
    // AUTO CLOSE WHEN BOTH VERIFIED
    if (isContact && isEmail) {
      const timer = setTimeout(onClose, 1200);
      return () => clearTimeout(timer);
    }
  }, [isContact, isEmail]);

  useEffect(() => {
    // if mobile is already verified
    if (isContact) {
      setMobileVerifySuccess("Mobile is already verified!");
    }
    //if email is alredy verified
    if (isEmail) setEmailVerifySuccess("Email is already verified!");
  }, []);

  // AUTO SEND OTP WHEN COMPONENT OPENS
  useEffect(() => {
    if (!isContact) sendMobileOtp();
    if (!isEmail) sendEmailOtpVerify();
  }, []);

  // HOOK FOR MOBILE OTP INPUT
  const {
    register: registerMobileOtp,
    handleSubmit: handleMobileOtpSubmit,
    formState: { errors: mobileErrors },
  } = useForm({ resolver: yupResolver(mobileOtpSchema) });

  // HOOK FOR EMAIL OTP INPUT
  const {
    register: registerEmailOtp,
    handleSubmit: handleEmailOtpSubmit,
    formState: { errors: emailErrors },
  } = useForm({ resolver: yupResolver(emailOtpSchema) });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="verify-otp-modal">
        <ModalHeader text="Verify Mobile and Email OTP" />
        {
          <MobileSection
            isContact={isContact}
            mobileHint={mobileHint}
            mobileVerifySuccess={mobileVerifySuccess}
            mobileVerifyError={mobileVerifyError}
            handleMobileOtpSubmit={handleMobileOtpSubmit}
            registerMobileOtp={registerMobileOtp}
            mobileErrors={mobileErrors}
            verifyMobile={verifyMobile}
            sendMobileOtp={sendMobileOtp}
          />
        }
        {
          <EmailSection
            isEmail={isEmail}
            emailHint={emailHint}
            emailVerifySuccess={emailVerifySuccess}
            emailVerifyError={emailVerifyError}
            handleEmailOtpSubmit={handleEmailOtpSubmit}
            registerEmailOtp={registerEmailOtp}
            emailErrors={emailErrors}
            verifyEmail={verifyEmail}
            sendEmailOtpVerify={sendEmailOtpVerify}
          />
        }
        <button onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;

// MOBILE SECTION UI
export const MobileSection = ({
  isContact,
  mobileHint,
  mobileVerifySuccess,
  mobileVerifyError,
  handleMobileOtpSubmit,
  registerMobileOtp,
  mobileErrors,
  verifyMobile,
  sendMobileOtp,
}) =>
  isContact ? (
    <SuccessMessage text={mobileVerifySuccess} />
  ) : (
    <>
      <form
        onSubmit={handleMobileOtpSubmit(verifyMobile)}
        className="space-y-2 mt-4"
      >
        <InputField label="Enter Mobile OTP" required>
          <input
            type="text"
            {...registerMobileOtp("otp")}
            className="input-box"
          />
        </InputField>

        {mobileHint && <HintMessage text={mobileHint} />}
        {mobileErrors.otp ? (
          <ErrorMessage text={mobileErrors.otp.message} />
        ) : mobileVerifyError ? (
          <ErrorMessage text={mobileVerifyError} />
        ) : null}

        <Button type="submit" className="w-full">
          Verify Mobile Otp
        </Button>
      </form>
      <ResendButton onResend={sendMobileOtp} />
    </>
  );

// EMAIL SECTION UI
export const EmailSection = ({
  isEmail,
  emailHint,
  emailVerifySuccess,
  emailVerifyError,
  handleEmailOtpSubmit,
  registerEmailOtp,
  emailErrors,
  verifyEmail,
  sendEmailOtpVerify,
}) =>
  isEmail ? (
    <SuccessMessage text={emailVerifySuccess} />
  ) : (
    <>
      <form
        onSubmit={handleEmailOtpSubmit(verifyEmail)}
        className="space-y-2 mt-4"
      >
        <InputField label="Enter Email OTP" required>
          <input
            type="text"
            {...registerEmailOtp("otp")}
            className="input-box"
          />
        </InputField>

        {emailHint && <HintMessage text={emailHint} />}
        {emailErrors?.otp ? (
          <ErrorMessage text={emailErrors.otp.message} />
        ) : emailVerifyError ? (
          <ErrorMessage text={emailVerifyError} />
        ) : null}

        <Button type="submit" className="w-full">
          Verify Email Otp
        </Button>
      </form>
      <ResendButton onResend={sendEmailOtpVerify} />
    </>
  );
