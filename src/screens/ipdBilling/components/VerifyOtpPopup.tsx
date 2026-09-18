import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { HintMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import ResendButton from "@/screens/login/components/ResendButton";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useState } from "react";

const VerifyOtpPopup = ({
  isOpen,
  onClose,
  setIsVerifiedOtp,
  setOtpVerifiedDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  setIsVerifiedOtp: React.Dispatch<React.SetStateAction<boolean>>;
  setOtpVerifiedDate: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [contactNumber, setContactNumber] = useState<string>("");
  const [hint, setHint] = useState("");
  const [otpValue, setOtpValue] = useState<string>("");

  const sendOtp = async (): Promise<boolean> => {
    const payload = { mobileNumber: contactNumber };
    if (!payload.mobileNumber || payload.mobileNumber.trim().length !== 10) {
      showWarning("Please enter valid mobile number");
      return false;
    }
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SEND_MOBILE_VERIFICATION_OTP,
      payload,
      {},
      { component: "VerifyOtpPopup" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Failed to send OTP");
      setHint("");
      setIsVerifiedOtp(false);
      return false;
    }
    setHint(resp?.message ?? "OTP sent successfully");
    setIsVerifiedOtp(true);
    setOtpVerifiedDate(new Date().toLocaleString());
    return true;
  };

  // verify otp
  const verifyOtp = async () => {
    const payload = {
      mobileNumber: contactNumber,
      otp: otpValue,
    };
    if (!payload.mobileNumber || payload.mobileNumber.trim().length !== 10) {
      showWarning("Please enter valid mobile number");
      return;
    }
    if (!payload.otp || payload.otp.trim().length !== 6) {
      showWarning("Please enter valid otp");
      return;
    }
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.VERIFY_MOBILE_VERIFICATION_OTP,
      payload,
      {},
      { component: "VerifyOtpPopup" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Failed to verify OTP");
      setIsVerifiedOtp(false);
      return;
    }
    showSuccess(resp?.message ?? "OTP verified successfully");
    setIsVerifiedOtp(true);
    onClose?.();
  };

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Verify OTP">
      <div className="from-grid-1">
        <InputField label="Mobile Number" required>
          <div className="flex w-full flex-col">
            <input
              type="text"
              className="input-field"
              placeholder="Enter mobile number "
              onChange={e => setContactNumber(e.target.value)}
              value={contactNumber}
              onInput={allowOnlyNumbers}
              maxLength={10}
              inputMode="numeric"
            />

            <div className="flex justify-end">
              <ResendButton onResend={sendOtp} />
            </div>
            {hint && <HintMessage text={hint} />}
          </div>
        </InputField>
        <InputField label="OTP" required>
          <input
            type="text"
            className="input-field"
            placeholder="Enter otp"
            onChange={e => setOtpValue(e.target.value.trim())}
            onInput={allowOnlyNumbers}
            maxLength={6}
            inputMode="numeric"
            value={otpValue}
          />
        </InputField>
        <div className="flex justify-end">
          <button className="save-btn" onClick={verifyOtp}>
            Verify OTP
          </button>
        </div>
        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default VerifyOtpPopup;
