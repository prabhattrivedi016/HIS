import { motion } from "framer-motion";
import { Building2, Lock, LogIn, User } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo.jpg";
import { Spinner } from "../../../assets/svgIcons";

import { ErrorMessage, SuccessMessage } from "../../components/infoText";
import AuthBackground from "../../components/layout";
import { ENDPOINTS } from "../../config/defaults/index";
import useGetBranchList from "../../hooks/useGetBranchList";
import useGlobalApi from "../../hooks/useGlobalApi";
import { useAuthorizedPages } from "../../store/useAuthorizedPages";
import { useFavoriteRoles } from "../../store/useFavouriteRole";
import Signup from "../signup";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";

import { InputError, LoginFormData, PageItem, TabItem } from "./type";

const Login = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { branchList, branchListError } = useGetBranchList();
  const navigate = useNavigate();
  const { setAuthorizedPages } = useAuthorizedPages();
  const { setFavoriteRoles, clearFavorites } = useFavoriteRoles();

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
  useEffect(() => {
    if (branchList?.data?.length) {
      setFormData(prev => ({
        ...prev,
        selectedBranchId: branchList.data[0].branchId,
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
    const branchId = Number(e.target.value);
    // setBranchId(branchId);
    setFormData(prev => ({
      ...prev,
      selectedBranchId: branchId,
    }));
  };

  // handle submit

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: InputError = {};

    if (!formData.selectedBranchId) {
      newErrors.branch = "Please select a branch";
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      //login
      const loginRes = await fetchApi("POST", ENDPOINTS.LOGIN, {
        branchId: Number(formData.selectedBranchId),
        userName: formData.userName,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (!loginRes) return;

      const { accessToken, branchId, userId } = loginRes.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("branchId", String(branchId));
      localStorage.setItem("userId", String(userId));

      setUserName(loginRes.data.userName);
      setEmail(loginRes.data.email);
      setContact(loginRes.data.contact);
      setIsContact(loginRes.data.isContactVerified);
      setIsEmail(loginRes.data.isEmailVerified);
      setUserId(userId);

      // fetch user roles
      const roleId = await fetchUserAssignedRoles(branchId);

      // fetch authorized pages
      await fetchAuthorizedPages(branchId, roleId);

      // navigate to dashboard
      if (loginRes.data.isContactVerified && loginRes.data.isEmailVerified) {
        setSuccessMessage(loginRes.message);
        timerRef.current = setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setShowOtpModal(true);
      }
    } catch (err) {
      console.error("Login flow failed", err);
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

  const onClose = useCallback(() => {
    setShowOtpModal(false);
  }, []);

  // Fetch user assigned roles and set it to the store
  const fetchUserAssignedRoles = async (branchId: number) => {
    const response = await fetchApi("GET", ENDPOINTS.GET_USER_ROLES, {}, { params: { branchId } });

    const roleId = response?.data?.[0]?.roleId;
    const roleName = response?.data?.[0]?.roleName;

    if (!roleId) throw new Error("Role not found");

    // set favorite roles
    const favorites = response?.data?.filter((r: any) => r?.isFavoriteRole === 1);

    setFavoriteRoles(favorites);

    localStorage.setItem("selectedRole", roleName);

    return roleId;
  };

  const fetchAuthorizedPages = async (branchId: number, roleId: number) => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_TAB_SUB_MENU_MAPPING,
      {},
      { params: { branchId, roleId } }
    );

    const tabs = response.data?.tabs ?? [];
    const subMenus = response.data?.subMenus ?? [];
    const favoriteSubMenus = response.data?.favoriteSubMenus ?? [];

    const quickLinksTab = {
      tabName: {
        tabId: 0,
        tabName: "Quick Links",
        iconClass: "fa-solid fa-star",
      },
      pages: favoriteSubMenus.map((item: PageItem) => ({ ...item, tabId: 0 })),
      selectedRoleId: roleId,
    };

    const normalTabs = tabs.map((tab: TabItem) => ({
      tabName: {
        tabId: tab.tabId,
        tabName: tab.tabName.trim(),
        iconClass: tab.iconClass,
      },
      pages: subMenus.filter((page: PageItem) => page.tabId === tab.tabId),
      selectedRoleId: roleId,
    }));

    setAuthorizedPages([quickLinksTab, ...normalTabs]);
  };

  console.log("🧪 Zustand snapshot:", useFavoriteRoles.getState().favoriteRoles);

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
              <img src={Logo} alt="Hospital Logo" className="w-full h-full object-contain" />
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
