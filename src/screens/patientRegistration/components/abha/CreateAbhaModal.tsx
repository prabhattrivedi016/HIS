import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ABDM_ENDPOINTS } from "@/config/abdmEndpoints";
import useAbdmCoreApi from "@/hooks/useAbdmCoreApi";
import { showError, showInfo, showSuccess } from "@/utils/alert";
import { allowOnlyNumbers, allowOnlyText } from "@/utils/inputValidationHandler";
import { useState } from "react";
import AadhaarSplitInput from "./AadhaarSplitInput";
import { mapAbhaProfileToPatientDetails } from "./abhaFieldMapper";
import AbhaCardPanel from "./AbhaCardPanel";
import AbhaProfileSummary from "./AbhaProfileSummary";
import {
  AbdmCallResult,
  AbdmProfile,
  AbhaAccountDto,
  OtpRequestResultDto,
  PhrSuggestionsResultDto,
} from "./abhaTypes";
import OtpResendBadge from "./OtpResendBadge";
import useOtpResendTimer from "./useOtpResendTimer";

type Step = "consent" | "otp" | "linkMobile" | "detail" | "newAddress";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBindPatient: (mapped: Record<string, unknown>) => void;
};

const CONSENT_ITEMS = [
  'I am voluntarily sharing my Aadhaar Number/Virtual ID issued by UIDAI, and my demographic information for the purpose of creating an Ayushman Bharat Health Account number ("ABHA number") and ABHA Address. I authorize NHA to use my Aadhaar for Aadhaar based authentication with UIDAI as per Aadhaar Act, 2016. I understand that UIDAI will share my e-KYC details upon successful authentication.',
  "I intend to create an ABHA number and ABHA address using document other than Aadhaar.",
  "I consent to usage of my ABHA address and ABHA number for linking of my legacy (past) government health records and records generated during this encounter.",
  "I authorize the sharing of all my health records with healthcare provider(s) for the purpose of providing healthcare services to me during this encounter.",
  "I consent to the anonymization and use of my health records for public health purposes.",
  "The beneficiary has been informed and explained about the above consents, and I have been explained about the consent and hereby provide my consent.",
];

const validateNewAddress = (val: string): string | null => {
  if (val.length < 8 || val.length > 18) return "Length must be 8-18 characters.";
  if (!/^[a-zA-Z0-9._]+$/.test(val))
    return "Only letters, numbers, dot(.), underscore(_) are allowed.";
  if (/^[._]|[._]$/.test(val)) return "Cannot start or end with . or _";
  if (/\.{2,}|_{2,}/.test(val)) return "Consecutive special characters not allowed.";
  return null;
};

const CreateAbhaModal = ({ isOpen, onClose, onBindPatient }: Props) => {
  const { loading, fetchAbdm } = useAbdmCoreApi();
  const aadhaarOtpTimer = useOtpResendTimer(2);
  const linkOtpTimer = useOtpResendTimer(2);

  const [step, setStep] = useState<Step>("consent");

  // Step 1: consent
  const [aadhaar, setAadhaar] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [consents, setConsents] = useState<boolean[]>(Array(CONSENT_ITEMS.length).fill(false));

  // Step 2: aadhaar OTP
  const [txnId, setTxnId] = useState("");
  const [otp, setOtp] = useState("");
  const [commMobile, setCommMobile] = useState("");

  // Step 3: mobile linking
  const [linkMobileNo, setLinkMobileNo] = useState("");
  const [linkTxnId, setLinkTxnId] = useState("");
  const [linkOtp, setLinkOtp] = useState("");

  // Result
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<AbdmProfile | null>(null);
  const [binding, setBinding] = useState(false);

  // New address step
  const [newAddress, setNewAddress] = useState("");
  const [newAddressError, setNewAddressError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const allConsentsChecked = consents.every(Boolean);
  const canProceed = allConsentsChecked && beneficiaryName.trim().length > 0;

  const toggleConsent = (idx: number) => {
    setConsents(prev => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const toggleAll = () => {
    const next = !allConsentsChecked;
    setConsents(Array(CONSENT_ITEMS.length).fill(next));
  };

  const resetAll = () => {
    setStep("consent");
    setAadhaar("");
    setBeneficiaryName("");
    setConsents(Array(CONSENT_ITEMS.length).fill(false));
    setTxnId("");
    setOtp("");
    setCommMobile("");
    setLinkMobileNo("");
    setLinkTxnId("");
    setLinkOtp("");
    setToken("");
    setProfile(null);
    setNewAddress("");
    setNewAddressError(null);
    setSuggestions([]);
    aadhaarOtpTimer.reset();
    linkOtpTimer.reset();
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  /**
   * The full demographic profile now arrives bundled in the enrol/byAadhaar response itself
   * (ABDMCore's AbhaEnrollmentService.MapAbhaAccount flattens it into AbhaAccountDto.raw --
   * see the backend fix), exactly like the legacy _ABHACreationVerificationView.cshtml's
   * $submitAadharOTP never made a separate "get profile" call either: it used r.ABHAProfile
   * directly. A separate GET /abha/profile call is only needed for the *login/verify* flow
   * (VerifyAbhaModal), where ABDM genuinely returns just a token and nothing else.
   */
  const finalizeVerification = (account: AbhaAccountDto) => {
    if (account.token) setToken(account.token);

    if (account.isNew) showSuccess("Aadhaar Verified Successfully! New ABHA account created.");
    else
      showInfo(
        `ABHA account already exists${account.healthIdNumber ? ` (ABHA No: ${account.healthIdNumber})` : ""}. Please review and bind the details.`
      );
    setStep("detail");
  };

  // -------------------------------------------------------------- STEP 1
  const handleGenerateOtp = async (isResend = false) => {
    if (!isResend) {
      if (aadhaar.length !== 12) {
        showError("Please enter a valid 12-digit Aadhaar number.");
        return;
      }
      if (!canProceed) {
        showError("Please accept all consents and enter your name to proceed.");
        return;
      }
    }

    const resp = await fetchAbdm<AbdmCallResult<OtpRequestResultDto>>(
      "POST",
      ABDM_ENDPOINTS.ENROLLMENT_AADHAAR_OTP,
      {
        aadhaarNo: aadhaar,
        consentBeneficiaryName: beneficiaryName.trim(),
        consentUserId: 0,
      }
    );

    if (!resp.result || !resp.data?.txnId) {
      showError(resp.message || resp.data?.message || "Failed to send OTP.");
      return;
    }

    setTxnId(resp.data.txnId);
    setOtp("");
    setStep("otp");
    if (isResend) aadhaarOtpTimer.registerResend();
    aadhaarOtpTimer.start();
    showSuccess(resp.data.message || "OTP sent to your Aadhaar-linked mobile.");
  };

  // -------------------------------------------------------------- STEP 2
  const handleGenerateLinkOtp = async (
    mobileNo: string,
    currentTxnId: string,
    isResend = false
  ) => {
    const resp = await fetchAbdm<AbdmCallResult<OtpRequestResultDto>>(
      "POST",
      ABDM_ENDPOINTS.ENROLLMENT_MOBILE_CHECK_AND_GENERATE_OTP,
      { mobileNo, txnId: currentTxnId }
    );

    if (!resp.result || !resp.data?.txnId) {
      showError(resp.message || resp.data?.message || "Failed to send OTP.");
      return;
    }

    setLinkTxnId(resp.data.txnId);
    setLinkOtp("");
    if (isResend) linkOtpTimer.registerResend();
    linkOtpTimer.start();
    showSuccess(resp.data.message || "OTP sent.");
  };

  const handleSubmitAadhaarOtp = async () => {
    if (otp.trim().length !== 6) {
      showError("OTP must be 6 digits.");
      return;
    }
    if (!/^[6-9][0-9]{9}$/.test(commMobile.trim())) {
      showError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const resp = await fetchAbdm<AbdmCallResult<AbhaAccountDto>>(
      "POST",
      ABDM_ENDPOINTS.ENROLLMENT_AADHAAR_VERIFY,
      {
        txnId,
        otp: otp.trim(),
        mobileNo: commMobile.trim(),
      }
    );

    if (!resp.result || !resp.data) {
      showError(resp.message || resp.data?.message || "OTP verification failed.");
      return;
    }

    const account = resp.data;
    const rawProfile = (account.raw as AbdmProfile) ?? {};
    setProfile({ ...rawProfile, mobile: rawProfile.mobile ?? account.mobile ?? undefined });
    if (account.txnId) setTxnId(account.txnId);
    if (account.token) setToken(account.token);

    const mobileInProfile = account.mobile?.trim();
    if (!mobileInProfile || mobileInProfile !== commMobile.trim()) {
      const activeTxnId = account.txnId || txnId;
      setLinkMobileNo(commMobile.trim());
      setStep("linkMobile");
      await handleGenerateLinkOtp(commMobile.trim(), activeTxnId);
    } else {
      finalizeVerification(account);
    }
  };

  // -------------------------------------------------------------- STEP 3
  const handleVerifyLinkOtp = async () => {
    if (linkOtp.trim().length !== 6) {
      showError("Please enter the 6-digit OTP.");
      return;
    }

    const resp = await fetchAbdm<AbdmCallResult<AbhaAccountDto>>(
      "POST",
      ABDM_ENDPOINTS.ENROLLMENT_MOBILE_VERIFY,
      {
        txnId: linkTxnId,
        otp: linkOtp.trim(),
      }
    );

    if (!resp.result || !resp.data) {
      showError(resp.message || resp.data?.message || "OTP verification failed. Please try again.");
      return;
    }

    showSuccess(resp.message || "Mobile number linked successfully!");
    setProfile(prev => (prev ? { ...prev, mobile: linkMobileNo } : { mobile: linkMobileNo }));
    finalizeVerification(resp.data);
  };

  // -------------------------------------------------------------- NEW ADDRESS
  const openNewAddressStep = async () => {
    setNewAddress("");
    setNewAddressError(null);
    setSuggestions([]);
    setStep("newAddress");

    const resp = await fetchAbdm<AbdmCallResult<PhrSuggestionsResultDto>>(
      "GET",
      ABDM_ENDPOINTS.ENROLLMENT_PHR_SUGGESTIONS,
      {},
      { params: { txnId } }
    );
    if (resp.result && resp.data) {
      setSuggestions(resp.data.abhaAddressList || []);
      if (resp.data.txnId) setTxnId(resp.data.txnId);
    } else {
      showError(resp.message || "Could not fetch suggestions.");
    }
  };

  const handleNewAddressChange = (val: string) => {
    setNewAddress(val);
    setNewAddressError(val ? validateNewAddress(val.trim()) : null);
  };

  const handleCreateNewAddress = async () => {
    const value = newAddress.trim();
    const err = validateNewAddress(value);
    if (err) {
      showError(err);
      return;
    }

    const resp = await fetchAbdm<AbdmCallResult<AbhaAccountDto>>(
      "POST",
      ABDM_ENDPOINTS.ENROLLMENT_PHR_ADDRESS,
      {
        txnId,
        phrAddress: value,
      }
    );

    if (!resp.result || !resp.data) {
      showError(resp.message || resp.data?.message || "Failed to create ABHA Address.");
      return;
    }

    const account = resp.data;
    const updatedRaw = (account.raw as AbdmProfile) ?? {};
    setProfile(prev => ({
      ...(prev ?? {}),
      ...updatedRaw,
      preferredAbhaAddress: updatedRaw.preferredAbhaAddress || value,
    }));
    showSuccess(resp.message || "ABHA Address created!");
    setStep("detail");
  };

  // -------------------------------------------------------------- BIND
  const handleBind = () => {
    if (!profile) return;
    setBinding(true);
    onBindPatient(mapAbhaProfileToPatientDetails(profile));
    showSuccess("ABHA details bound to patient registration successfully!");
    setBinding(false);
    handleClose();
  };

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={handleClose}
      title="Create ABHA"
      className="w-[92vw] lg:min-w-5xl"
    >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
    <div className="min-w-0 flex-1">
      {step === "consent" && (
        <div>
          <label className="mb-1 block text-sm font-bold text-[#003366]">Aadhaar Number *</label>
          <div className="mb-3">
            <AadhaarSplitInput value={aadhaar} onChange={setAadhaar} />
          </div>
          <div className="info-box-purple mb-3 rounded bg-[#f7f0ff] p-2 text-xs text-gray-700">
            Please ensure that mobile number is linked with Aadhaar as it will be required for OTP
            authentication.
          </div>

          <label className="mb-1.5 block text-xs font-bold text-[#003366]">
            I hereby declare that:
          </label>
          <div
            className="mb-2 flex cursor-pointer items-center gap-2 rounded border border-[#d0b8f5] bg-[#f0e8ff] px-2.5 py-1.5"
            onClick={toggleAll}
          >
            <input type="checkbox" checked={allConsentsChecked} readOnly />
            <label className="cursor-pointer text-xs font-bold text-[#5a2d9a]">Select All</label>
          </div>

          <div className="mb-2 rounded border border-[#d0b8f5] bg-gray-50 p-3">
            {CONSENT_ITEMS.map((text, idx) => (
              <div
                key={idx}
                className="mb-1.5 flex items-start gap-2 border-b border-dashed border-[#e0d0f5] pb-1.5 text-xs text-gray-700 last:mb-0 last:border-b-0"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0"
                  checked={consents[idx]}
                  onChange={() => toggleConsent(idx)}
                />
                <span>{text}</span>
              </div>
            ))}
            <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-700">
              I,
              <input
                type="text"
                className="input-field"
                style={{ width: 160, height: 28, padding: "2px 8px" }}
                placeholder="Your Name"
                maxLength={100}
                value={beneficiaryName}
                onChange={e => setBeneficiaryName(e.target.value)}
                onInput={allowOnlyText}
              />
              , have been explained about the consent and hereby provide my consent.
            </div>
          </div>
          <div className="mb-2 text-[11px] text-red-600">
            *Please select all checkboxes and enter your name to proceed
          </div>

          <div className="text-center">
            <button
              type="button"
              className="save-btn"
              disabled={!canProceed}
              onClick={() => handleGenerateOtp(false)}
            >
              Accept &amp; Proceed
            </button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div>
          <div className="abha-success-banner mb-3 rounded border border-[#00c0ef] bg-[#e8f4fd] px-3 py-2 text-sm text-[#004a70]">
            OTP sent to your Aadhaar-linked mobile number.
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <InputField label="Aadhaar OTP" className="w-32">
              <input
                type="text"
                className="input-field"
                placeholder="Enter OTP"
                value={otp}
                maxLength={6}
                onChange={e => setOtp(e.target.value)}
                onInput={allowOnlyNumbers}
              />
            </InputField>
            <InputField label="Mobile for Communication" className="w-52">
              <input
                type="text"
                className="input-field"
                placeholder="Enter Mobile No."
                value={commMobile}
                maxLength={10}
                onChange={e => setCommMobile(e.target.value)}
                onInput={allowOnlyNumbers}
              />
            </InputField>
            <button type="button" className="save-btn" onClick={handleSubmitAadhaarOtp}>
              Submit OTP
            </button>
            <OtpResendBadge {...aadhaarOtpTimer} onResend={() => handleGenerateOtp(true)} />
          </div>
        </div>
      )}

      {step === "linkMobile" && (
        <div className="create-detail-card rounded-lg border border-[#cde8f8]">
          <div className="rounded-t-lg bg-gradient-to-r from-[#003366] to-[#0055a5] px-4 py-2.5 text-sm font-bold text-white">
            Link Mobile Number
          </div>
          <div className="p-4">
            <div className="info-box-blue mb-3 rounded bg-[#e8f4fd] p-2 text-xs text-[#004a70]">
              Your mobile number is not linked to Aadhaar. Please link it to continue.
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <InputField label="Mobile No." className="w-44">
                <input type="text" className="input-field" value={linkMobileNo} disabled />
              </InputField>
              <InputField label="OTP" className="w-32">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter OTP"
                  value={linkOtp}
                  maxLength={6}
                  onChange={e => setLinkOtp(e.target.value)}
                  onInput={allowOnlyNumbers}
                />
              </InputField>
              <button type="button" className="save-btn" onClick={handleVerifyLinkOtp}>
                Verify OTP
              </button>
              <OtpResendBadge
                {...linkOtpTimer}
                onResend={() => handleGenerateLinkOtp(linkMobileNo, txnId, true)}
              />
            </div>
          </div>
        </div>
      )}

      {step === "detail" && profile && (
        <div>
          <AbhaProfileSummary profile={profile} onBind={handleBind} binding={binding} />
          <button
            type="button"
            className="btn-create-new-addr mt-2 w-full rounded-lg py-2.5 text-sm font-bold text-white"
            style={{ background: "linear-gradient(90deg,#0055a5,#00c0ef)" }}
            onClick={openNewAddressStep}
          >
            + Create New ABHA Address
          </button>
        </div>
      )}

      {step === "newAddress" && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <button type="button" className="cancel-btn" onClick={() => setStep("detail")}>
              ← Back
            </button>
            <h4 className="m-0 text-sm font-bold text-[#00a65a]">+ Create New ABHA Address</h4>
          </div>
          <InputField label="New ABHA Address *" className="mb-2 w-72">
            <input
              type="text"
              className="input-field"
              placeholder="e.g. yourname.123"
              maxLength={18}
              value={newAddress}
              onChange={e => handleNewAddressChange(e.target.value)}
            />
          </InputField>
          {newAddressError ? (
            <p className="mb-2 text-xs font-bold text-red-600">❌ {newAddressError}</p>
          ) : newAddress ? (
            <p className="mb-2 text-xs font-bold text-green-600">✔ Valid ABHA Address</p>
          ) : (
            <ul className="mb-2 list-disc pl-5 text-[11px] text-gray-500">
              <li>Minimum length - 8 characters</li>
              <li>Maximum length - 18 characters</li>
              <li>Special characters allowed - 1 dot (.) and/or 1 underscore (_)</li>
              <li>Special characters cannot be in the beginning or at the end</li>
              <li>
                Alphanumeric - only numbers, only letters or any combination of numbers and letters
                is allowed
              </li>
            </ul>
          )}
          {suggestions.length > 0 && (
            <select
              className="input-field mb-2"
              style={{ borderColor: "#f39c12", background: "#fffaf0" }}
              onChange={e => e.target.value && handleNewAddressChange(e.target.value)}
              defaultValue=""
            >
              <option value="">-- Select a Suggestion --</option>
              {suggestions.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              className="save-btn"
              disabled={!newAddress || !!newAddressError}
              onClick={handleCreateNewAddress}
            >
              Create &amp; Proceed
            </button>
          </div>
        </div>
      )}

    </div>

      <AbhaCardPanel token={token || null} />
    </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default CreateAbhaModal;
