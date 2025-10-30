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
import { userLogin, getActiveBranchList } from "../../api/AuthServices";
import VerifyOtp from "./VerifyOtp";

const Login = () => {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    selectedBranch: "",
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

  //  Fetch active branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const savedBranch = localStorage.getItem("selectedBranch");
        const savedBranchId = localStorage.getItem("selectedBranchId");

        const response = await getActiveBranchList();
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        setBranches(data);

        // If localStorage has a branch, persist it
        if (savedBranch && savedBranchId) {
          setFormData((prev) => ({
            ...prev,
            selectedBranch: savedBranch,
            selectedBranchId: savedBranchId,
          }));
        } else if (data.length > 0) {
          // Default select first branch
          setFormData((prev) => ({
            ...prev,
            selectedBranch: data[0].branchName,
            selectedBranchId: data[0].branchId,
          }));
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setErrors((prev) => ({
          ...prev,
          branch: "Failed to load branches. Please try again.",
        }));
      }
    };

    fetchBranches();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //  Handle branch selection
  const handleBranchChange = (e) => {
    const branchName = e.target.value;
    const selectedBranch = branches.find((b) => b.branchName === branchName);

    setFormData((prev) => ({
      ...prev,
      selectedBranch: branchName,
      selectedBranchId: selectedBranch?.branchId || "",
    }));

    localStorage.setItem("selectedBranch", branchName);
    localStorage.setItem("selectedBranchId", selectedBranch?.branchId || "");
  };

  //  Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.selectedBranchId) newErrors.branch = "Please select a branch";
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
      setSuccessMessage(response?.data?.message);
      setErrorMessage("");

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setSuccessMessage("");
      setErrorMessage(
        err?.response?.data?.message || "Invalid Username or Password"
      );
    }
  };

  // Drawer logic
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

  return (
    <AuthBackground>
      <motion.div
        initial={{ opacity: 0, y: -1000 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
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

          {/* Success & Error Messages */}
          {successMessage && (
            <div className="px-4 py-3 rounded-lg bg-green-100 border border-green-300 text-green-700 text-center mb-3">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="px-4 py-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-center mb-3">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Select
              icon={Building2}
              placeholder="Select Branch"
              value={formData.selectedBranch}
              onChange={handleBranchChange}
              options={branches.map((branch) => ({
                value: branch.branchName,
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

            <Button type="submit" className="w-full flex justify-center gap-2 ">
              <LogIn size={18} /> LOGIN
            </Button>

            {errors.credentials && (
              <p className="text-sm text-red-500 text-center mt-2">
                {errors.credentials}
              </p>
            )}
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

      {/* Signup Drawer */}
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

      {/*  Forgot Password Drawer */}
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
            ></button>
            <ForgotPassword onClose={() => closeDrawer("forgot")} />
          </div>
        </div>
      )}
      <p className="text-lg text-gray-800 drop-shadow-md flex justify-center absolute bottom-5 w-full text-center">
        Powered by Gravity Web Technologies Pvt Ltd.
      </p>
    </AuthBackground>
  );
};

export default Login;
