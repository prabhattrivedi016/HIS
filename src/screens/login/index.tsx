import { motion } from "framer-motion";
import { Building2, Lock, LogIn, User } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../../assets/svgIcons";

import { AxiosError } from "axios";
import { userLogin } from "../../api/AuthServices";
import Button from "../../components/customButton";
import Checkbox from "../../components/customCheckbox";
import Select from "../../components/customSelect";
import Input from "../../components/cutomInput";
import { ErrorMessage, SuccessMessage } from "../../components/infoText";
import AuthBackground from "../../components/layout";
import useGetBranchList from "../../hooks/useGetBranchList";
import Signup from "../signup";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import { LoginFormData } from "./type";

const Login = () => {
  const { branchList, branchListError } = useGetBranchList();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    selectedBranchId: "",
    userName: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [openSignup, setOpenSignup] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
  const [animateSignup, setAnimateSignup] = useState(false);
  const [animateForgot, setAnimateForgot] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [isContact, setIsContact] = useState("");
  const [isEmail, setIsEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!branchList) return;

    const firstBranch = branchList.data?.[0];
    if (firstBranch) {
      setFormData(prev => ({
        ...prev,
        selectedBranchId: firstBranch.branchId,
      }));
    }
  }, [branchList]);

  // Handle input + checkbox change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;

    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;

    setFormData(prev => ({
      ...prev,
      [target.name]: value,
    }));
  };

  // Branch Select Change
  const handleBranchChange = (branchId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedBranchId: branchId,
    }));
  };

  // Submit Login
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) newErrors.userName = "User ID is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        branchId: Number(formData.selectedBranchId),
        userName: formData.userName,
        password: formData.password,
        rememberMe: formData.rememberMe,
      };

      const response = await userLogin(payload);

      const { accessToken } = response?.data?.data ?? {};

      localStorage.setItem("accessToken", accessToken);

      const apiResponseData = response?.data?.data;

      console.log("api response of loginData", apiResponseData);

      setUserName(apiResponseData?.userName);
      setEmail(apiResponseData?.email);
      setContact(apiResponseData.contact);
      setIsContact(apiResponseData?.isContactVerified);
      setIsEmail(apiResponseData?.isEmailVerified);
      setUserId(apiResponseData?.userId);

      setErrorMessage("");

      if (apiResponseData?.isContactVerified && apiResponseData?.isEmailVerified) {
        setSuccessMessage(response?.data?.message);

        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setShowOtpModal(true);
      }
    } catch (error) {
      setSuccessMessage("");
      const err = error as AxiosError<{ message?: string }>;

      setErrorMessage(err.response?.data?.message ?? "Invalid Username or Password");
    } finally {
      setLoading(false);
    }
  };

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

  const onClose = () => {
    setShowOtpModal(false);
  };

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
            <div
              className="
      mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white
      w-full max-w-[300px]    /* width */
      h-[150px]               /* height */
      sm:max-w-[400px] sm:h-[200px]
      md:max-w-[400px] md:h-[200px]
    "
            >
              <img
                src="/assets/logo.jpg"
                alt="Hospital Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-indigo-600 font-medium">!! Welcome Back !!</p>
          </div>
          {branchListError && <ErrorMessage text={branchListError} />}
          {successMessage && <SuccessMessage text={successMessage} />}

          <form className="space-y-4">
            <Select
              icon={Building2}
              placeholder="Select Branch"
              value={formData.selectedBranchId}
              onChange={handleBranchChange}
              options={branchList?.data.map(branch => ({
                value: branch.branchId,
                label: branch.branchName,
              }))}
              error={errors.branch}
            />

            {errors.branch && <p className="text-sm text-red-500">{errors.branch}</p>}

            <Input
              icon={User}
              type="text"
              name="userName"
              placeholder="User Name"
              value={formData.userName}
              onChange={handleChange}
            />
            {errors.userName && <p className="text-sm text-red-500 mt-1">{errors.userName}</p>}

            <Input
              icon={Lock}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}

            <div className="flex justify-between items-center">
              <Checkbox
                label="Remember me"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => openDrawer("forgot")}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full flex justify-center gap-2 items-center"
              onClick={handleSubmit}
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
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              New User?{" "}
              <button
                type="button"
                onClick={() => openDrawer("signup")}
                className="text-indigo-600 hover:underline font-medium cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Drawer UI  */}
      {openSignup && (
        <div
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity duration-300 ${
            animateSignup ? "opacity-100" : "opacity-0"
          }`}
          onClick={e => {
            if (e.target === e.currentTarget) closeDrawer("signup");
          }}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") closeDrawer("signup");
          }}
          aria-label="Close signup drawer"
        >
          <div
            className={`bg-white w-full sm:w-1/2 h-full p-6 relative transform transition-transform duration-300 ${
              animateSignup ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              onClick={() => closeDrawer("signup")}
              className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
            >
              ✕
            </button>
            <Signup onLoginClick={() => closeDrawer("signup")} />
          </div>
        </div>
      )}

      {openForgot && (
        <div
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity duration-300 ${
            animateForgot ? "opacity-100" : "opacity-0"
          }`}
          onClick={e => {
            if (e.target === e.currentTarget) closeDrawer("forgot");
          }}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") closeDrawer("forgot");
          }}
          aria-label="Close forgot drawer"
        >
          <div
            className={`bg-white w-full sm:w-1/3 h-full p-6 relative transform transition-transform duration-300 ${
              animateForgot ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              onClick={() => closeDrawer("forgot")}
              className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
            >
              ✕
            </button>
            <ForgotPassword onClose={() => closeDrawer("forgot")} />
          </div>
        </div>
      )}

      {/* otp verification modal */}
      {showOtpModal && (
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
      )}
    </AuthBackground>
  );
};

export default Login;
