import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import { ErrorMessage, HintMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { mobileOtpSchema } from "../../../validation/verifyOtpSchema";
import { MobileProps } from "../type";
import ResendButton from "./ResendButton";

const MobileSection = ({ userId, userName, contact, isContact, onVerified }: MobileProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [hint, setHint] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ otp: string }>({
    resolver: yupResolver(mobileOtpSchema),
  });

  useEffect(() => {
    if (!isContact) {
      sendOtp();
    }
  }, [isContact]);

  const sendOtp = async () => {
    const res = await fetchApi("POST", ENDPOINTS.SEND_SMS_OTP, { userName, contact });
    if (res) setHint(res.message);
  };

  const verifyOtp = async ({ otp }: { otp: string }) => {
    const res = await fetchApi("POST", ENDPOINTS.VERIFY_SMS_OTP, { userId, otp });
    if (!res) return;
    setSuccess(res.message);
    onVerified();
  };

  if (isContact) {
    return <SuccessMessage text="Mobile already verified" />;
  }

  if (success) {
    return <SuccessMessage text={success} />;
  }

  return (
    <>
      <form onSubmit={handleSubmit(verifyOtp)} className="space-y-2 mt-4">
        <InputField label="Enter Mobile OTP" required>
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
          Verify Mobile OTP
        </button>
      </form>

      <ResendButton onResend={sendOtp} />
    </>
  );
};

export default React.memo(MobileSection);
