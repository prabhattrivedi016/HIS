import React, { useEffect } from "react";
import Button from "../Atomic/Button";
import InputField from "../Atomic/InputField";
import { stopPropagationHandler } from "../../utils/utilities";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { emailOtp, mobileOtp } from "../../validation/verifyOtpSchema";
import { sendOtpApi, sendEmailOtp } from "../../api/AuthServices";

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
  //  sending automatic email and mobile otp when user mounts on this page
  useEffect(() => {
    sendEmailOtp();
    sendEmailOtp();
  }, []);

  //send mobile otp  function
  const sendMobileOtp = async (data) => {
    try {
      const response = await sendOtpApi({
        userName: data.userName,
        contact: data.contact,
      });

      console.log("otp sent successfully", response);
      setOtpSent(true);
      setHintMessage(response?.data?.message);
      setErrorMessage("");
    } catch (err) {
      const apiMessage = err?.response?.data;

      if (apiMessage) {
        setErrorMessage(apiMessage?.message);
        setContactHint(apiMessage?.contactHint);
      }
    }
  };

  // send email otp
  const sendEmailOtp = async (data) => {
    try {
      const response = await sendEmailOtp({
        userId: userId,
        email: email,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  // 1) Send Mobile Otp
  const {
    register: registerMobileOtp,
    handleSubmit: handleMobileOtpSubmit,
    formState: { errors: sendMobileOtpError },
  } = useForm({
    resolver: yupResolver(mobileOtp),
    defaultValues: { userName: "", contact: "" },
  });

  // email otp
  const {
    register: registerEmailOtp,
    handleSubmit: handleEmailOtpSubmit,
    formState: { errors: sendEmailOtpError },
  } = useForm({
    resolver: yupResolver(emailOtp),
    defaultValues: {
      userId: userId,
      otp: "",
    },
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

        {/* BOTH NOT VERIFIED */}
        {!isContact && !isEmail && (
          <>
            {/* Mobile OTP */}
            <form
              onSubmit={handleMobileOtpSubmit(sendMobileOtp)}
              className="space-y-4"
            >
              <InputField label="Enter Mobile OTP" required={true}>
                <input
                  type="text"
                  {...registerMobileOtp("otp")}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </InputField>

              {/* {mobileOtpErrors.otp && (
                <p className="text-red-500 text-sm">
                  {mobileOtpErrors.otp.message}
                </p>
              )} */}

              <Button type="submit" className="w-full">
                Verify Mobile OTP
              </Button>
            </form>

            {/* Email OTP */}
            <form
              onSubmit={handleEmailOtpSubmit(console.log)}
              className="space-y-4 mt-4"
            >
              <InputField label="Enter Email OTP" required={true}>
                <input
                  type="text"
                  {...registerEmailOtp("otp")}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </InputField>

              {/* {emailOtpErrors.otp && (
                <p className="text-red-500 text-sm">
                  {emailOtpErrors.otp.message}
                </p>
              )} */}

              <Button type="submit" className="w-full">
                Verify Email OTP
              </Button>
            </form>
          </>
        )}

        {/* ONLY CONTACT NOT VERIFIED */}
        {!isContact && isEmail && (
          <form
            onSubmit={handleMobileOtpSubmit(console.log)}
            className="space-y-4"
          >
            <InputField label="Enter Mobile OTP" required={true}>
              <input
                type="text"
                {...registerMobileOtp("otp")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </InputField>

            {/* {mobileOtpErrors.otp && (
              <p className="text-red-500 text-sm">
                {mobileOtpErrors.otp.message}
              </p>
            )} */}

            <Button type="submit" className="w-full">
              Verify Mobile OTP
            </Button>
          </form>
        )}

        {/* ONLY EMAIL NOT VERIFIED */}
        {isContact && !isEmail && (
          <form
            onSubmit={handleEmailOtpSubmit(console.log)}
            className="space-y-4"
          >
            <InputField label="Enter Email OTP" required={true}>
              <input
                type="text"
                {...registerEmailOtp("otp")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </InputField>

            {/* {emailOtpErrors.otp && (
              <p className="text-red-500 text-sm">
                {emailOtpErrors.otp.message}
              </p>
            )} */}

            <Button type="submit" className="w-full">
              Verify Email OTP
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyOtp;
