import CustomLoader from "@/components/customLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import { ErrorMessage, HintMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { isVerifiedFlag } from "../../../utils/authVerification";
import { mobileOtpSchema } from "../../../validation/verifyOtpSchema";
import { MobileProps } from "../type";
import ResendButton from "./ResendButton";

const MobileSection = ({ userId, userName, contact, isContact, onVerified }: MobileProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [hint, setHint] = useState("");
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ otp: string }>({
    resolver: yupResolver(mobileOtpSchema),
  });

  useEffect(() => {
    if (!isVerifiedFlag(isContact)) {
      sendOtp();
    }
  }, [isContact]);

  const sendOtp = async () => {
    const res = await fetchApi("POST", ENDPOINTS.SEND_SMS_OTP, { userName, contact });
    if (res) setHint(res.message);
  };

  const verifyOtp = async ({ otp }: { otp: string }) => {
    const res = await fetchApi("POST", ENDPOINTS.VERIFY_SMS_OTP, { userId, otp });
    if (!res?.result) {
      setErrorMessage(res?.message ?? "Failed to verify mobile OTP");
      return;
    }
    setSuccess(res?.message ?? "Mobile OTP verified successfully");
    setErrorMessage("");
    onVerified();
  };

  return (
    <>
      {errorMessage && <ErrorMessage text={errorMessage} />}
      {success && <SuccessMessage text={success} />}

      <form onSubmit={handleSubmit(verifyOtp)} className="space-y-2 mt-4">
        <InputField label="Enter Mobile OTP" required>
          <input {...register("otp")} className="input-field" minLength={6} maxLength={6} />
        </InputField>

        {hint && <HintMessage text={hint} />}
        <button type="submit" disabled={loading} className="save-btn w-full">
          Verify Mobile OTP
        </button>
      </form>

      <ResendButton onResend={sendOtp} />

      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default React.memo(MobileSection);
