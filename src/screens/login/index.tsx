import { motion } from "framer-motion";
import { Building2, Lock, LogIn, User } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../../assets/svgIcons";

import { ErrorMessage, SuccessMessage } from "../../components/infoText";
import AuthBackground from "../../components/layout";
import { ENDPOINTS } from "../../config/defaults/index";
import useGetBranchList from "../../hooks/useGetBranchList";
import useGlobalApi from "../../hooks/useGlobalApi";
import Signup from "../signup";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import { InputError, LoginFormData } from "./type";

const Login = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { branchList, branchListError } = useGetBranchList();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    selectedBranchId: "",
    userName: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<InputError>({});
  const [openSignup, setOpenSignup] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
  const [animateSignup, setAnimateSignup] = useState(false);
  const [animateForgot, setAnimateForgot] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [isContact, setIsContact] = useState<boolean | null>(null);
  const [isEmail, setIsEmail] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  // Auto-select first branch
  const firstBranchId = useMemo(() => {
    return branchList?.data?.[0]?.branchId;
  }, [branchList]);

  useEffect(() => {
    if (firstBranchId) {
      setFormData(prev => ({
        ...prev,
        selectedBranchId: firstBranchId,
      }));
    }
  }, [branchList]);

  // handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target as HTMLInputElement;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // handle branch change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      selectedBranchId: Number(e.target.value),
    }));
  };

  // handle submit

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) newErrors.userName = "User ID is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      branchId: Number(formData?.selectedBranchId),
      userName: formData?.userName,
      password: formData?.password,
      rememberMe: formData?.rememberMe,
    };

    const response = await fetchApi("POST", ENDPOINTS?.LOGIN, payload);

    if (!response) return;

    const { accessToken } = response?.data ?? {};

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("branchId", String(response?.data?.branchId) ?? "");
    localStorage.setItem("userId", String(response?.data?.userId) ?? "");

    setUserName(response?.data.userName ?? "");
    setEmail(response?.data?.email ?? "");
    setContact(response?.data?.contact ?? "");
    setIsContact(response?.data?.isContactVerified ?? false);
    setIsEmail(response?.data?.isEmailVerified ?? false);
    setUserId(response?.data?.userId ?? null);

    if (response?.data?.isContactVerified && response?.data?.isEmailVerified) {
      setSuccessMessage(response?.message);
      timerRef.current = setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      setShowOtpModal(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef?.current) clearTimeout(timerRef?.current);
    };
  }, []);

  // Drawer Logic
  const openDrawer = (type: string) => {
    if (type === "signup") {
      setOpenSignup(true);
      setTimeout(() => setAnimateSignup(true), 10);
    } else {
      setOpenForgot(true);
      setTimeout(() => setAnimateForgot(true), 10);
    }
  };

  const closeDrawer = (type: string) => {
    if (type === "signup") {
      setAnimateSignup(false);
      setTimeout(() => setOpenSignup(false), 300);
    } else {
      setAnimateForgot(false);
      setTimeout(() => setOpenForgot(false), 300);
    }
  };

  const onClose = useCallback(() => {
    setShowOtpModal(false);
  }, []);

  return (
    <AuthBackground>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white w-full max-[300px] h-[150px] sm:max-w-[400px] sm:h-[200px] md:max-w-[400px] md:h-[200px] ">
              <img
                src="/assets/logo.jpg"
                alt="Hospital Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="welcome">!! Welcome Back !!</p>
          </div>
          {error && <ErrorMessage text={error} />}
          {successMessage && <SuccessMessage text={successMessage} />}
          {branchListError && <ErrorMessage text={branchListError} />}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="w-full">
              <div className="relative flex items-center border-2 rounded-lg transition border-gray-300 bg-white ">
                <div className="pl-3 text-gray-500 flex items-center">
                  <Building2 size={20} className="min-w-20px" />
                </div>

                <select
                  className=" login-input-field text-sm sm:text-base appearance-none"
                  onChange={handleBranchChange}
                  value={formData.selectedBranchId}
                >
                  <option value="">Select</option>
                  {branchList?.data?.map(b => (
                    <option key={b?.branchId} value={b?.branchId}>
                      {b?.branchName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errors.branch && <p className="input-field-error">{errors.branch}</p>}

            <div className="w-full">
              <div className="relative flex items-center border-2 rounded-lg border-gray-300 bg-white">
                <div className="pl-3 text-gray-500 flex items-center">
                  <User size={20} />
                </div>

                <input
                  type="text"
                  name="userName"
                  placeholder="User Name"
                  value={formData.userName}
                  onChange={handleChange}
                  className="login-input-field"
                />
              </div>

              {errors.userName && <p className="input-field-error">{errors.userName}</p>}
            </div>

            <div className="w-full">
              <div className="relative flex items-center border-2 rounded-lg border-gray-300 bg-white">
                <div className="pl-3 text-gray-500 flex items-center">
                  <Lock size={20} />
                </div>

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className=" login-input-field"
                />
              </div>

              {errors.password && <p className="input-field-error">{errors.password}</p>}
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData?.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 accent-indigo-600"
                />
                <span>Remember Me</span>
              </label>
              <button type="button" onClick={() => openDrawer("forgot")} className="forgot-btn">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className=" login-btn  flex items-center justify-center gap-2 "
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  LOGIN
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              New User?{" "}
              <button type="button" onClick={() => openDrawer("signup")} className="forgot-btn">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Drawer UI  */}
      {openSignup && (
        <div
          className={`animate-signup ${animateSignup ? "opacity-100" : "opacity-0"}`}
          onClick={e => {
            if (e.target === e.currentTarget) closeDrawer("signup");
          }}
        >
          <div className={`animate-forgot ${animateSignup ? "translate-x-0" : "translate-x-full"}`}>
            <Signup onLoginClick={() => closeDrawer("signup")} />
          </div>
        </div>
      )}

      {openForgot && (
        <div
          className={`animate-signup ${animateForgot ? "opacity-100" : "opacity-0"}`}
          onClick={e => {
            if (e.target === e.currentTarget) closeDrawer("forgot");
          }}
        >
          <div
            className={`forgot-animate-size ${
              animateForgot ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <ForgotPassword onClose={() => closeDrawer("forgot")} />
          </div>
        </div>
      )}

      {/* otp verification modal */}
      {showOtpModal ? (
        <VerifyOtp
          userId={userId}
          userName={userName}
          contact={contact}
          email={email}
          setIsContact={setIsContact}
          setIsEmail={setIsEmail}
          isContact={isContact}
          isEmail={isEmail}
          onClose={onClose}
        />
      ) : (
        <></>
      )}
    </AuthBackground>
  );
};

export default Login;
