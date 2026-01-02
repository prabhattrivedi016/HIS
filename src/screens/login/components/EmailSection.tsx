import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import { ErrorMessage, HintMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { emailOtpSchema } from "../../../validation/verifyOtpSchema";
import { EmailProps } from "../type";
import ResendButton from "./ResendButton";

const EmailSection = ({ userId, userName, email, isEmail, onVerified }: EmailProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [hint, setHint] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ otp: string }>({
    resolver: yupResolver(emailOtpSchema),
  });

  useEffect(() => {
    if (!isEmail) {
      sendOtp();
    }
  }, [isEmail]);

  const sendOtp = async () => {
    const res = await fetchApi("POST", ENDPOINTS.SEND_EMAIL_OTP, { userName, email });
    if (res) setHint(res.message);
  };

  const verifyOtp = async ({ otp }: { otp: string }) => {
    const res = await fetchApi("POST", ENDPOINTS.VERIFY_EMAIL_OTP, { userId, otp });
    if (!res) return;
    setSuccess(res.message);
    onVerified();
  };

  if (isEmail) {
    return <SuccessMessage text="Email already verified" />;
  }

  if (success) {
    return <SuccessMessage text={success} />;
  }

  return (
    <>
      <form onSubmit={handleSubmit(verifyOtp)} className="space-y-2 mt-4">
        <InputField label="Enter Email OTP" required>
          <input {...register("otp")} className="input-box" />
        </InputField>

        {hint && <HintMessage text={hint} />}
        {errors.otp && <ErrorMessage text={errors.otp.message} />}
        {error && <ErrorMessage text={error} />}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg button-primary"
        >
          Verify Email OTP
        </button>
      </form>

      <ResendButton onResend={sendOtp} />
    </>
  );
};

export default React.memo(EmailSection);
