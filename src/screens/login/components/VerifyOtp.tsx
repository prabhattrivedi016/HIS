import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModalHeader } from "../../../components/infoText";
import { VerifyOtpProps } from "../type";
import EmailSection from "./EmailSection";
import MobileSection from "./MobileSection";

const VerifyOtp = ({
  userId,
  userName,
  contact,
  email,
  onClose,
  setIsContact,
  setIsEmail,
  isEmail,
  isContact,
}: VerifyOtpProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isContact && isEmail) {
      setTimeout(() => {
        onClose();
        navigate("/dashboard");
      }, 1200);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="verify-otp-modal">
        <ModalHeader text="Verify Mobile & Email OTP" />

        <MobileSection
          userId={userId}
          userName={userName}
          contact={contact}
          onVerified={() => setIsContact(true)}
          isContact={isContact}
        />

        <EmailSection
          userId={userId}
          userName={userName}
          email={email}
          onVerified={() => setIsEmail(true)}
          isEmail={isEmail}
        />

        <button onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default React.memo(VerifyOtp);
