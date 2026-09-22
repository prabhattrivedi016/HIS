import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ABDM_ENDPOINTS } from "@/config/abdmEndpoints";
import useAbdmCoreApi from "@/hooks/useAbdmCoreApi";
import { showError, showSuccess } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useState } from "react";
import AadhaarSplitInput from "./AadhaarSplitInput";
import AbhaCardPanel from "./AbhaCardPanel";
import { mapAbhaProfileToPatientDetails } from "./abhaFieldMapper";
import AbhaProfileSummary from "./AbhaProfileSummary";
import {
  AbdmCallResult,
  AbdmProfile,
  AbhaAddressSearchResult,
  LoginAuthMethod,
  LoginIdentifierType,
  MobileSearchAccount,
  MobileSearchResult,
  OtpRequestResultDto,
  OtpVerifyResultDto,
} from "./abhaTypes";
import OtpResendBadge from "./OtpResendBadge";
import useOtpResendTimer from "./useOtpResendTimer";

type VerifyMethod = "MOBILE" | "AADHAAR" | "ABHA_ADDRESS" | "ABHA_NUMBER";
type Step = "input" | "mobileAccounts" | "addressFound" | "otp" | "profile";
type OtpMethod = "MOBILE_OTP" | "AADHAAR_OTP";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBindPatient: (mapped: Record<string, unknown>) => void;
};

const identifierTypeFor = (method: VerifyMethod) => {
  switch (method) {
    case "MOBILE":
      return LoginIdentifierType.Mobile;
    case "AADHAAR":
      return LoginIdentifierType.Aadhaar;
    case "ABHA_ADDRESS":
      return LoginIdentifierType.AbhaAddress;
    case "ABHA_NUMBER":
      return LoginIdentifierType.AbhaNumber;
  }
};

const VerifyAbhaModal = ({ isOpen, onClose, onBindPatient }: Props) => {
  const { loading, fetchAbdm } = useAbdmCoreApi();
  const otpTimer = useOtpResendTimer(2);

  const [method, setMethod] = useState<VerifyMethod>("MOBILE");
  const [otpOn, setOtpOn] = useState<OtpMethod>("MOBILE_OTP");
  const [loginId, setLoginId] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [profile, setProfile] = useState<AbdmProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [binding, setBinding] = useState(false);

  // ABHA Address method: search-first result (see searchAbhaAddress below)
  const [addressInfo, setAddressInfo] = useState<AbhaAddressSearchResult | null>(null);
  const [allowedOtpMethods, setAllowedOtpMethods] = useState<OtpMethod[]>([]);

  const [mobileSearchTxnId, setMobileSearchTxnId] = useState("");
  const [mobileAccounts, setMobileAccounts] = useState<MobileSearchAccount[]>([]);
  const [selectedMobileIndex, setSelectedMobileIndex] = useState("");

  const identifierType = identifierTypeFor(method);
  const currentLoginId = method === "AADHAAR" ? aadhaar : loginId;

  const resetAll = () => {
    setMethod("MOBILE");
    setOtpOn("MOBILE_OTP");
    setLoginId("");
    setAadhaar("");
    setOtp("");
    setTxnId("");
    setStep("input");
    setProfile(null);
    setToken(null);
    setAddressInfo(null);
    setAllowedOtpMethods([]);
    setMobileSearchTxnId("");
    setMobileAccounts([]);
    setSelectedMobileIndex("");
    otpTimer.reset();
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleMethodChange = (next: VerifyMethod) => {
    setMethod(next);
    setLoginId("");
    setAadhaar("");
    setOtp("");
    setTxnId("");
    setStep("input");
    setProfile(null);
    setToken(null);
    setAddressInfo(null);
    setAllowedOtpMethods([]);
    setMobileSearchTxnId("");
    setMobileAccounts([]);
    setSelectedMobileIndex("");
    otpTimer.reset();
  };

  const validateLoginId = (): boolean => {
    if (method === "AADHAAR") {
      if (aadhaar.length !== 12) {
        showError("Please enter a valid 12-digit Aadhaar number.");
        return false;
      }
      return true;
    }
    if (method === "MOBILE" && !/^[6-9][0-9]{9}$/.test(loginId.trim())) {
      showError("Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (!loginId.trim()) {
      showError(
        method === "ABHA_ADDRESS" ? "Please enter ABHA Address." : "Please enter ABHA Number."
      );
      return false;
    }
    return true;
  };

  const resolveAuthMethod = () =>
    method === "AADHAAR"
      ? LoginAuthMethod.AadhaarOtp
      : method === "MOBILE"
        ? LoginAuthMethod.MobileOtp
        : otpOn === "AADHAAR_OTP"
          ? LoginAuthMethod.AadhaarOtp
          : LoginAuthMethod.MobileOtp;

  /**
   * ABHA Address verify must search the address first -- ABDM's phr/web/login/abha/search
   * tells us whether the address exists/is active, which OTP methods are actually allowed for
   * it (authMethods minus blockedAuthMethods), and whether it's non-KYC (no healthIdNumber).
   * Jumping straight to OTP request (what this used to do) skips all of that and can request
   * an OTP method ABDM will reject for this specific address. Mirrors the legacy
   * $searchAbhaAddress flow in _ABHACreationVerificationView.cshtml.
   */
  const searchAbhaAddress = async () => {
    const address = loginId.trim();
    if (!address) {
      showError("Please enter ABHA Address.");
      return;
    }

    const resp = await fetchAbdm<AbdmCallResult<AbhaAddressSearchResult>>(
      "GET",
      ABDM_ENDPOINTS.SEARCH_BY_ABHA_ADDRESS,
      {},
      { params: { abhaAddress: address } }
    );

    if (!resp.result || !resp.data) {
      showError(
        (resp.message || "ABHA Address not found.") +
          " Try the Mobile Number or ABHA Number method instead."
      );
      return;
    }

    const blocked = new Set(resp.data.blockedAuthMethods ?? []);
    const allowed = (resp.data.authMethods ?? []).filter(
      (m): m is OtpMethod => (m === "MOBILE_OTP" || m === "AADHAAR_OTP") && !blocked.has(m)
    );

    if (allowed.length === 0) {
      showError("All authentication methods are blocked for this ABHA Address.");
      return;
    }

    setAddressInfo(resp.data);
    setAllowedOtpMethods(allowed);
    setOtpOn(allowed[0]);
    setStep("addressFound");
  };

  /**
   * Mobile verify must search for linked ABHA accounts first, not request an OTP straight off
   * the mobile number -- a mobile number can be linked to more than one ABHA account. Mirrors
   * the legacy $searchABHAByMobileForVerify (SearchABHA.searchABHAByMobile) in
   * _ABHACreationVerificationView.cshtml: search returns a txnId plus the list of accounts
   * (each with an "index"), the user picks one, and only then is an OTP requested -- keyed by
   * that index and the search's txnId, not by the mobile number itself
   * (see sendMobileAccountOtp below).
   */
  const searchAbhaByMobile = async () => {
    if (!validateLoginId()) return;

    const resp = await fetchAbdm<AbdmCallResult<MobileSearchResult[]>>(
      "GET",
      ABDM_ENDPOINTS.SEARCH_BY_MOBILE,
      {},
      { params: { mobileNo: loginId.trim() } }
    );

    const first = resp.data?.[0];
    if (!resp.result || !first || !first.ABHA?.length) {
      showError(
        (first?.message || resp.message || "No ABHA accounts found for this mobile number.") +
          " You can Create ABHA instead."
      );
      return;
    }

    // ABDM sends index as a JSON number; normalize to string here so every downstream use
    // (radio value/checked comparison, the request-otp payload) is consistently a string --
    // the backend's Index field is a string and rejects a bare number with a 400.
    const accounts = first.ABHA.map(a => ({ ...a, index: String(a.index) }));

    setMobileSearchTxnId(first.txnId);
    setMobileAccounts(accounts);
    setSelectedMobileIndex(accounts[0].index);
    setStep("mobileAccounts");
  };

  const sendMobileAccountOtp = async (isResend = false) => {
    if (!selectedMobileIndex) {
      showError("Please select an ABHA account.");
      return;
    }

    const resp = await fetchAbdm<AbdmCallResult<OtpRequestResultDto>>(
      "POST",
      ABDM_ENDPOINTS.LOGIN_REQUEST_OTP_MOBILE_ACCOUNT,
      { index: selectedMobileIndex, searchTxnId: mobileSearchTxnId }
    );

    if (!resp.result || !resp.data?.txnId) {
      showError(resp.message || resp.data?.message || "Failed to send OTP.");
      return;
    }

    setTxnId(resp.data.txnId);
    setOtp("");
    setStep("otp");
    if (isResend) otpTimer.registerResend();
    otpTimer.start();
    showSuccess(resp.data.message || "OTP sent successfully.");
  };

  const requestOtp = async (isResend: boolean) => {
    if (!isResend && !validateLoginId()) return;

    const resp = await fetchAbdm<AbdmCallResult<OtpRequestResultDto>>(
      "POST",
      ABDM_ENDPOINTS.LOGIN_REQUEST_OTP,
      { identifierType, loginId: currentLoginId, authMethod: resolveAuthMethod() }
    );

    if (!resp.result || !resp.data?.txnId) {
      showError(resp.message || resp.data?.message || "Failed to send OTP.");
      return;
    }

    setTxnId(resp.data.txnId);
    setOtp("");
    setStep("otp");
    if (isResend) otpTimer.registerResend();
    otpTimer.start();
    showSuccess(resp.data.message || "OTP sent successfully.");
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      showError("Please enter the 6-digit OTP.");
      return;
    }

    const resp = await fetchAbdm<AbdmCallResult<OtpVerifyResultDto>>(
      "POST",
      ABDM_ENDPOINTS.LOGIN_VERIFY_OTP,
      { identifierType, txnId, otp: otp.trim(), authMethod: resolveAuthMethod() }
    );

    if (!resp.result || !resp.data?.token) {
      showError(resp.message || resp.data?.message || "Incorrect OTP. Please try again.");
      return;
    }

    showSuccess(resp.data.message || "OTP verified successfully!");
    setToken(resp.data.token);
    await loadProfile(resp.data.token);
  };

  const loadProfile = async (token: string) => {
    const profileEndpoint =
      identifierType === LoginIdentifierType.AbhaAddress
        ? ABDM_ENDPOINTS.PROFILE_BY_ABHA_ID
        : ABDM_ENDPOINTS.PROFILE;

    const resp = await fetchAbdm<AbdmCallResult<AbdmProfile>>(
      "GET",
      profileEndpoint,
      {},
      {
        headers: { "X-Token": token },
      }
    );

    if (!resp.result || !resp.data) {
      showError(resp.message || "Failed to fetch ABHA profile.");
      return;
    }

    setProfile(resp.data);
    setStep("profile");
  };

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
      title="Verify ABHA"
      className="w-[92vw] lg:min-w-5xl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {step === "input" && (
            <div className="mb-4 text-center">
              <label className="mb-1 block text-sm font-bold text-[#003366]">
                Choose Verification Method
              </label>
              <select
                className="input-field mx-auto"
                style={{ width: 280, border: "2px solid #00c0ef" }}
                value={method}
                onChange={e => handleMethodChange(e.target.value as VerifyMethod)}
              >
                <option value="MOBILE">Mobile Number</option>
                <option value="AADHAAR">Aadhaar Number</option>
                <option value="ABHA_ADDRESS">ABHA Address</option>
                <option value="ABHA_NUMBER">ABHA Number (14 Digit)</option>
              </select>
            </div>
          )}

          {step === "input" && method === "MOBILE" && (
            <div>
              <div className="flex items-end gap-2">
                <InputField label="Mobile No. (ABHA-linked)" className="w-64">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter 10-digit Mobile No."
                    value={loginId}
                    maxLength={10}
                    onChange={e => setLoginId(e.target.value)}
                    onInput={allowOnlyNumbers}
                  />
                </InputField>
                <button type="button" className="save-btn" onClick={searchAbhaByMobile}>
                  Search ABHA
                </button>
              </div>
              <div className="info-box-blue mt-2 rounded bg-[#e8f4fd] p-2 text-xs text-gray-700">
                Enter the mobile number linked to your ABHA account to search and verify.
              </div>
            </div>
          )}

          {step === "mobileAccounts" && (
            <div>
              <div className="abha-success-banner mb-3 rounded border border-[#00c0ef] bg-[#e8f4fd] px-3 py-2 text-sm text-[#004a70]">
                {mobileAccounts.length} ABHA account(s) found. Select one and click Send OTP.
              </div>
              <table className="mb-3 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#bde3f5] text-left text-xs text-gray-500">
                    <th className="w-10 py-1">Select</th>
                    <th className="py-1">Name</th>
                    <th className="py-1">ABHA Number</th>
                    <th className="py-1">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {mobileAccounts.map(a => (
                    <tr key={a.index} className="border-b border-[#e8f5fd]">
                      <td className="py-1 text-center">
                        <input
                          type="radio"
                          name="mobileAccount"
                          checked={selectedMobileIndex === String(a.index)}
                          onChange={() => setSelectedMobileIndex(String(a.index))}
                        />
                      </td>
                      <td className="py-1">{a.name || ""}</td>
                      <td className="py-1">{a.ABHANumber || ""}</td>
                      <td className="py-1">
                        {a.gender === "M" ? "Male" : a.gender === "F" ? "Female" : a.gender || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-2">
                <button type="button" className="cancel-btn" onClick={() => setStep("input")}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={() => sendMobileAccountOtp(false)}
                >
                  Send Login OTP
                </button>
              </div>
            </div>
          )}

          {step === "input" && method === "AADHAAR" && (
            <div>
              <label className="mb-1 block text-sm font-bold text-[#003366]">
                Aadhaar Number *
              </label>
              <div className="mb-2 flex items-center gap-2">
                <AadhaarSplitInput value={aadhaar} onChange={setAadhaar} />
                <button type="button" className="save-btn" onClick={() => requestOtp(false)}>
                  Generate OTP
                </button>
              </div>
              <div className="info-box-purple rounded bg-[#f7f0ff] p-2 text-xs text-gray-700">
                Please ensure your mobile number is linked with Aadhaar for OTP authentication.
              </div>
            </div>
          )}

          {step === "input" && method === "ABHA_ADDRESS" && (
            <div className="flex items-end gap-2">
              <InputField label="ABHA Address" className="w-64">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. name@sbx"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                />
              </InputField>
              <button type="button" className="save-btn" onClick={searchAbhaAddress}>
                Search
              </button>
            </div>
          )}

          {step === "addressFound" && addressInfo && (
            <div>
              <div className="abha-success-banner mb-3 rounded border border-[#00c0ef] bg-[#e8f4fd] px-3 py-2 text-sm text-[#004a70]">
                <div className="font-bold">{addressInfo.fullName || addressInfo.abhaAddress}</div>
                <div>ABHA Address: {addressInfo.abhaAddress || loginId.trim()}</div>
                <div>
                  ABHA Number:{" "}
                  {addressInfo.healthIdNumber || (
                    <span className="text-[#b45309]">Not linked (non-KYC)</span>
                  )}
                </div>
                {addressInfo.mobile && <div>Mobile: {addressInfo.mobile}</div>}
                <div>
                  Status:{" "}
                  <span
                    className={addressInfo.status === "ACTIVE" ? "text-green-700" : "text-red-700"}
                  >
                    {addressInfo.status || "UNKNOWN"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <InputField label="Send OTP Via" className="w-40">
                  <select
                    className="input-field"
                    value={otpOn}
                    onChange={e => setOtpOn(e.target.value as OtpMethod)}
                  >
                    {allowedOtpMethods.map(m => (
                      <option key={m} value={m}>
                        {m === "MOBILE_OTP" ? "Mobile OTP" : "Aadhaar OTP"}
                      </option>
                    ))}
                  </select>
                </InputField>
                <button type="button" className="save-btn" onClick={() => requestOtp(false)}>
                  Send OTP
                </button>
              </div>
              <div className="mt-2">
                <button type="button" className="cancel-btn" onClick={() => setStep("input")}>
                  ← Back
                </button>
              </div>
            </div>
          )}

          {step === "input" && method === "ABHA_NUMBER" && (
            <div className="flex items-end gap-2">
              <InputField label="ABHA Number (14 Digit)" className="w-64">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 12345678901234"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                />
              </InputField>
              <InputField label="Send OTP Via" className="w-40">
                <select
                  className="input-field"
                  value={otpOn}
                  onChange={e => setOtpOn(e.target.value as OtpMethod)}
                >
                  <option value="MOBILE_OTP">Mobile OTP</option>
                  <option value="AADHAAR_OTP">Aadhaar OTP</option>
                </select>
              </InputField>
              <button type="button" className="save-btn" onClick={() => requestOtp(false)}>
                Send OTP
              </button>
            </div>
          )}

          {step === "otp" && (
            <div>
              <div className="abha-success-banner mb-3 rounded border border-[#00c0ef] bg-[#e8f4fd] px-3 py-2 text-sm text-[#004a70]">
                OTP sent. Please enter it below.
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <InputField label="OTP" className="w-32">
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
                <button type="button" className="save-btn" onClick={handleVerifyOtp}>
                  Verify OTP
                </button>
                <OtpResendBadge
                  {...otpTimer}
                  onResend={() =>
                    method === "MOBILE" ? sendMobileAccountOtp(true) : requestOtp(true)
                  }
                />
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setStep(
                      method === "ABHA_ADDRESS" && addressInfo
                        ? "addressFound"
                        : method === "MOBILE" && mobileAccounts.length
                          ? "mobileAccounts"
                          : "input"
                    )
                  }
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {step === "profile" && profile && (
            <AbhaProfileSummary profile={profile} onBind={handleBind} binding={binding} />
          )}
        </div>

        <AbhaCardPanel
          token={token}
          byAbhaId={identifierType === LoginIdentifierType.AbhaAddress}
        />
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default VerifyAbhaModal;
