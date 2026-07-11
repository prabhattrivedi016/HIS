import CustomLoader from "@/components/customLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import { ErrorMessage, HintMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { isVerifiedFlag } from "../../../utils/authVerification";
import { emailOtpSchema } from "../../../validation/verifyOtpSchema";
import { EmailProps } from "../type";
import ResendButton from "./ResendButton";

const EmailSection = ({ userId, userName, email, isEmail, onVerified }: EmailProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const [hint, setHint] = useState("");
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ otp: string }>({
    resolver: yupResolver(emailOtpSchema),
  });

  useEffect(() => {
    if (!isVerifiedFlag(isEmail)) {
      sendOtp();
    }
  }, [isEmail]);

  const sendOtp = async () => {
    const res = await fetchApi("POST", ENDPOINTS.SEND_EMAIL_OTP, { userName, email });
    if (res) setHint(res.message);
  };

  const verifyOtp = async ({ otp }: { otp: string }) => {
    const res = await fetchApi("POST", ENDPOINTS.VERIFY_EMAIL_OTP, { userId, otp });
    if (!res?.result) {
      setErrorMessage(res?.message ?? "Failed to verify email OTP");
      return;
    }
    setSuccess(res?.message ?? "Email OTP verified successfully");
    setErrorMessage("");
    onVerified();
  };

  if (isVerifiedFlag(isEmail)) {
    return <SuccessMessage text="Email already verified" />;
  }

  if (success) {
    return <SuccessMessage text={success} />;
  }

  return (
    <>
      {errorMessage && <ErrorMessage text={errorMessage} />}
      {success && <SuccessMessage text={success} />}

      <form onSubmit={handleSubmit(verifyOtp)} className="space-y-2 mt-4">
        <InputField label="Enter Email OTP" required>
          <input {...register("otp")} className="input-field" maxLength={6} minLength={6} />
        </InputField>

        {hint && <HintMessage text={hint} />}

        <button type="submit" disabled={loading} className="save-btn w-full">
          Verify Email OTP
        </button>
      </form>

      <ResendButton onResend={sendOtp} />

      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default React.memo(EmailSection);
