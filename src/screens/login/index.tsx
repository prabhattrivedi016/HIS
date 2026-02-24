import { motion } from "framer-motion";
import { Building2, Lock, LogIn, User } from "lucide-react";
import { FormEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo.jpg";
import { Spinner } from "../../../assets/svgIcons";
import { AuthContext } from "../../context/AuthContext";

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

import { getAuthStorage } from "../../utils/authStorage";
import { InputError, PageItem, TabItem } from "./type";

const Login = () => {
  const authContext = useContext(AuthContext);
  const loginFunc = authContext?.login;
  const { loading, error, fetchApi } = useGlobalApi();
  const { branchList } = useGetBranchList();

  const navigate = useNavigate();
  const { setAuthorizedPages } = useAuthorizedPages();
  const { setFavoriteRoles } = useFavoriteRoles();

  const [password, setPassword] = useState<string>("");

  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");
  const [rememberMe, setRememberMe] = useState(false);

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

  /* ---------------- auto select branch (gws-his)----------------------- */
  useEffect(() => {
    if (!branchList?.data?.length) return;

    const defaultBranch = branchList.data.find(b => b.branchId === 1) || branchList.data[0];

    setSelectedBranchId(defaultBranch.branchId);
  }, [branchList]);

  useEffect(() => {
    const savedRemember = localStorage.getItem("remember") === "true";

    if (savedRemember) {
      const savedUser = localStorage.getItem("userLogin") || "";
      const savedPass = localStorage.getItem("passLogin") || "";

      setUserName(savedUser);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);
  /* ----------------------------- handlers---------------------------------- */
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranchId(Number(e.target.value));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: InputError = {};

    if (!selectedBranchId) newErrors.branch = "Please select a branch";
    if (!userName.trim()) newErrors.userName = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";

    /*--------------------------saved to local storage-------------------- */

    if (rememberMe === true) {
      localStorage.setItem("userLogin", userName);
      localStorage.setItem("passLogin", password);
      localStorage.setItem("remember", String(rememberMe));
    } else {
      localStorage.removeItem("userLogin");
      localStorage.removeItem("passLogin");
      localStorage.removeItem("remember");
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const loginRes = await fetchApi("POST", ENDPOINTS.LOGIN, {
        branchId: Number(selectedBranchId),
        userName: userName,
        password: password,
        rememberMe: rememberMe,
      });

      if (!loginRes) return;

      const storage = rememberMe ? localStorage : sessionStorage;
      const { accessToken, branchId, userId } = loginRes.data;

      // auth data saved in storage
      if (loginFunc) {
        loginFunc({
          token: accessToken,
          user: loginRes.data,
        });
      }

      storage.setItem("accessToken", accessToken);
      storage.setItem("branchId", String(branchId));
      storage.setItem("userId", String(userId));
      storage.setItem("userDetails", JSON.stringify(loginRes.data));

      setUserName(loginRes.data.userName);
      setEmail(loginRes.data.email);
      setContact(loginRes.data.contact);
      setIsContact(loginRes.data.isContactVerified);
      setIsEmail(loginRes.data.isEmailVerified);
      setUserId(userId);

      const roleId = await fetchUserAssignedRoles(branchId);
      await fetchAuthorizedPages(branchId, roleId);

      if (loginRes.data.isContactVerified && loginRes.data.isEmailVerified) {
        setSuccessMessage(loginRes.message);
        timerRef.current = setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setShowOtpModal(true);
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  /*---------------------------------drawer logic-------------------------------------- */
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

  /*--------------------------user assign roles on page mount----------------------------------------- */
  const fetchUserAssignedRoles = async (branchId: number) => {
    const storage = getAuthStorage();
    const response = await fetchApi("GET", ENDPOINTS.GET_USER_ROLES, {}, { params: { branchId } });

    const roleId = response?.data?.[0]?.roleId;
    const roleName = response?.data?.[0]?.roleName;

    if (!roleId) throw new Error("Role not found");

    // set favorite roles
    const favorites = response?.data?.filter((r: any) => r?.isFavoriteRole === 1);

    setFavoriteRoles(favorites);

    storage.setItem("selectedRole", roleName);
    storage.setItem("roleId", roleId);

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
          {error && <ErrorMessage text={error?.message} />}
          {successMessage && <SuccessMessage text={successMessage} />}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="w-full">
              <div className="relative flex items-center border-2 rounded-lg transition border-gray-300 bg-white ">
                <div className="pl-3 text-gray-500 flex items-center">
                  <Building2 size={20} className="min-w-20px" />
                </div>

                <select
                  className="login-input-field"
                  value={selectedBranchId}
                  onChange={handleBranchChange}
                >
                  <option value="">Select</option>
                  {branchList?.data?.map(b => (
                    <option key={b.branchId} value={b.branchId}>
                      {b.branchName}
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
                  placeholder="User Name"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
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
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="login-input-field"
                />
              </div>

              {errors.password && <p className="input-field-error">{errors.password}</p>}
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
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
              className=" save-btn  w-full flex items-center justify-center gap-2 "
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
