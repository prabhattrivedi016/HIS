import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, Building2, LogIn } from "lucide-react";

import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import Input from "../Atomic/Input";
import Select from "../Atomic/Select";
import Checkbox from "../Atomic/Checkbox";
import Button from "../Atomic/Button";
import AuthBackground from "../Layout/AuthBackground";
import { userLogin } from "../../api/AuthServices";
import VerifyOtp from "./VerifyOtp";
import useGetBranchList from "../../Hook/useGetBranchList";
import { ErrorMessage, SuccessMessage } from "../../ui/InfoText";

const Login = () => {
  const { branchList, fetchBranchList, branchListError } = useGetBranchList();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  // Fetch branches
  useEffect(() => {
    fetchBranchList();
  }, []);

  // Auto-select first branch
  useEffect(() => {
    if (branchList?.data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        selectedBranchId: branchList?.data[0].branchId,
      }));
    }
  }, [branchList?.data]);

  // Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Branch Select Change
  const handleBranchChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      selectedBranchId: value,
    }));
  };

  // Submit Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.userName.trim()) newErrors.userName = "User ID is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        branchId: parseInt(formData.selectedBranchId),
        userName: formData.userName,
        password: formData.password,
        rememberMe: formData.rememberMe,
      };

      const response = await userLogin(payload);

      // console.log(response?.data?.data);

      const apiResponseData = response?.data?.data;
      setUserName(apiResponseData?.userName);
      setEmail(apiResponseData?.email);
      setContact(apiResponseData.contact);
      setIsContact(apiResponseData?.isContactVerified);
      setIsEmail(apiResponseData?.isEmailVerified);
      setUserId(apiResponseData?.userId);

      setErrorMessage("");

      if (
        apiResponseData?.isContactVerified &&
        apiResponseData?.isEmailVerified
      ) {
        setSuccessMessage(response?.data?.message);

        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setShowOtpModal(true);
      }
    } catch (err) {
      setSuccessMessage("");
      setErrorMessage(
        err?.response?.data?.message || "Invalid Username or Password"
      );
    }
  };

  // Drawer Logic (UNCHANGED)
  const openDrawer = (type) => {
    if (type === "signup") {
      setOpenSignup(true);
      setTimeout(() => setAnimateSignup(true), 10);
    } else {
      setOpenForgot(true);
      setTimeout(() => setAnimateForgot(true), 10);
    }
  };

  const closeDrawer = (type) => {
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
            <div className="w-120 h-50 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src="/assets/logo.jpg"
                alt="Hospital Logo"
                className="w-160 h-160 object-contain"
              />
            </div>
            <p className="text-indigo-600 font-medium">!! Welcome Back !!</p>
          </div>
          {branchListError && <ErrorMessage text={branchListError} />}
          {successMessage && <SuccessMessage text={successMessage} />}

          {/* {successMessage && (
            <div className="px-4 py-3 rounded-lg bg-green-100 border border-green-300 text-green-700 text-center mb-3">
              {successMessage}
            </div>
          )} */}

          {errorMessage && (
            <div className="px-4 py-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-center mb-3">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4">
            <Select
              icon={Building2}
              placeholder="Select Branch"
              value={formData.selectedBranchId}
              onChange={handleBranchChange}
              options={branchList?.data.map((branch) => ({
                value: branch.branchId,
                label: branch.branchName,
              }))}
              error={errors.branch}
            />

            {errors.branch && (
              <p className="text-sm text-red-500">{errors.branch}</p>
            )}

            <Input
              icon={User}
              type="text"
              name="userName"
              placeholder="User Name"
              value={formData.userName}
              onChange={handleChange}
            />
            {errors.userName && (
              <p className="text-sm text-red-500 mt-1">{errors.userName}</p>
            )}

            <Input
              icon={Lock}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}

            <div className="flex justify-between items-center">
              <Checkbox
                label="Remember me"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span
                onClick={() => openDrawer("forgot")}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
              >
                Forgot Password?
              </span>
            </div>

            <Button
              type="submit"
              className="w-full flex justify-center gap-2"
              onClick={handleSubmit}
            >
              <LogIn size={18} /> LOGIN
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              New User?{" "}
              <span
                onClick={() => openDrawer("signup")}
                className="text-indigo-600 hover:underline font-medium cursor-pointer"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Drawer UI remains unchanged (not removed) */}
      {openSignup && (
        <div
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity duration-300 ${
            animateSignup ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => closeDrawer("signup")}
        >
          <div
            className={`bg-white w-full sm:w-1/2 h-full p-6 relative transform transition-transform duration-300 ${
              animateSignup ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
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
          onClick={() => closeDrawer("forgot")}
        >
          <div
            className={`bg-white w-full sm:w-1/3 h-full p-6 relative transform transition-transform duration-300 ${
              animateForgot ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
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

      {/* <p className="text-lg text-gray-800 drop-shadow-md flex justify-center absolute bottom-5 w-full text-center">
        Powered by Gravity Web Technologies Pvt Ltd.
      </p> */}

      {/*  open otp verification modal */}
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
