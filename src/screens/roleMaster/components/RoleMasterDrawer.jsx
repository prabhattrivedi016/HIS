import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "../../../../assets/svgIcons";
import InputField from "../../../components/customInputField";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText/index";
import { ENDPOINTS } from "../../../config/defaults/index";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { roleMasterSchema } from "../../../validation/roleMasterSchema";

const RoleMasterDrawer = ({ isOpen, onClose, buttonTitle, drawerTitle, onCloseDrawer, roleId }) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [iconsList, setIconsList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [localIcon, setLocalIcon] = useState({ id: "", value: "Select Icon" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(roleMasterSchema),
    defaultValues: {
      roleName: "",
      isActive: "",
      faIconId: "",
      roleId: "0",
    },
  });

  // role master by Id
  const fetchRoleDetails = async (roleId = "") => {
    try {
      const options = roleId ? { params: { roleId } } : {};

      const response = await fetchApi("GET", ENDPOINTS.ROLE_MASTER_LIST, {}, options);

      if (!response) return;

      const roleData = response?.data?.[0];

      reset({
        roleName: roleData?.roleName || "",
        isActive: roleData?.isActive?.toString() || "",
        faIconId: roleData?.faIconId || "",
        roleId: roleData?.roleId || roleId,
      });

      // Handle icon selection
      if (iconsList.length > 0) {
        const foundIcon = iconsList.find(icon => icon.id === roleData?.faIconId);

        setLocalIcon(
          foundIcon
            ? { id: foundIcon.id, value: foundIcon.iconName }
            : { id: "", value: "Select Icon" }
        );
      }
    } catch (error) {
      console.log("Error while loading role for edit:", error);
    }
  };

  // reset value when coponent mounts
  useEffect(() => {
    if (!roleId) {
      reset({
        roleName: "",
        isActive: "",
        faIconId: "",
        roleId: "0",
      });
      setLocalIcon({ id: "", value: "Select Icon" });
      return;
    }

    fetchRoleDetails();
  }, [roleId, iconsList, reset]);

  //icons list
  const getIcons = async () => {
    const response = await fetchApi("GET", ENDPOINTS.FA_ICON_LIST);

    if (!response) {
      console.error("Error fetching icon list:", error);
      return;
    }

    const iconArray = response.data || [];

    setIconsList(iconArray);
  };

  useEffect(() => {
    getIcons();
  }, []);

  const onSubmit = async data => {
    const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_ROLE_MASTER, data);

    if (!response) {
      setErrorMessage(error || "Something went wrong!");
      return;
    }

    const apiResponse = response;

    setSuccessMessage(apiResponse?.message || "New Role Created Successfully!");
    setErrorMessage("");

    onCloseDrawer?.();

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return;

  return (
    <>
      <div
        className={`drawer-bg-fade ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      />
      <div className={`drawer-layout drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="drawer-title-border">
          <h2 className="drawer-title">{drawerTitle}</h2>
          <button onClick={onClose} className="drawer-close-btn">
            ×
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            {successMessage && <SuccessMessage text={successMessage} />}

            {errorMessage && <ErrorMessage text={errorMessage} />}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField label="Role Name" required={true}>
              <input
                placeholder="Enter Role Name"
                {...register("roleName")}
                className="input-field"
              />
              {errors.roleName && (
                <p className="text-red-600 text-sm mt-1">{errors.roleName.message}</p>
              )}
            </InputField>

            <InputField label="Status" required={true}>
              <select {...register("isActive")} className="input-field">
                <option value="">Select</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
              {errors.isActive && (
                <p className="text-red-600 text-sm mt-1">{errors.isActive.message}</p>
              )}
            </InputField>

            <InputField label="Role Icon" required={true}>
              <div className="flex items-center gap-2">
                <select {...register("faIconId")} className="input-field">
                  <option value={localIcon?.id}>{localIcon?.value}</option>
                  {iconsList.map(icon => (
                    <option key={icon.id} value={icon.id}>
                      {icon.iconName}
                    </option>
                  ))}
                </select>
              </div>
              {errors.faIconId && (
                <p className="text-red-600 text-sm mt-1">{errors.faIconId.message}</p>
              )}
            </InputField>

            <button
              type="submit"
              className={`w-full py-2 rounded transition-colors font-medium mt-5 flex justify-center items-center active:scale-95 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#1e6da1] hover:bg-blue-600 text-white"
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Loading...
                </span>
              ) : (
                buttonTitle
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RoleMasterDrawer;
