import React, { useEffect } from "react";
import { ModalHeader } from "../../../components/infoText";
import { isVerifiedFlag } from "../../../utils/authVerification";
import { VerifyOtpProps } from "../type";
import EmailSection from "./EmailSection";
import MobileSection from "./MobileSection";

const VerifyOtp = ({
  userId,
  userName,
  contact,
  email,
  onClose,
  onVerificationComplete,
  setIsContact,
  setIsEmail,
  isEmail,
  isContact,
}: VerifyOtpProps) => {
  useEffect(() => {
    if (isVerifiedFlag(isContact) && isVerifiedFlag(isEmail)) {
      onVerificationComplete();
    }
  }, [isContact, isEmail, onVerificationComplete]);

  return (
    <div className="verify-otp-overlay">
      <div className="verify-otp-modal">
        <ModalHeader text="Verify Mobile & Email OTP" />

        <div className="verify-otp-section">
          <MobileSection
            userId={userId}
            userName={userName}
            contact={contact}
            onVerified={() => setIsContact(true)}
            isContact={isContact}
          />
        </div>

        <div className="verify-otp-section">
          <EmailSection
            userId={userId}
            userName={userName}
            email={email}
            onVerified={() => setIsEmail(true)}
            isEmail={isEmail}
          />
        </div>

        <div className="verify-otp-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VerifyOtp);
