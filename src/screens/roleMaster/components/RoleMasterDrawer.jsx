import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "../../../../assets/svgIcons";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { roleMasterSchema } from "../../../validation/roleMasterSchema";

const RoleMasterDrawer = ({ isOpen, onClose, drawerTitle, buttonTitle, onCloseDrawer, roleId }) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [iconsList, setIconsList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  // Fetch single role details for Edit mode
  const fetchRoleDetails = async (roleId = "") => {
    try {
      const response = await fetchApi(
        "GET",
        ENDPOINTS.ROLE_MASTER_LIST,
        {},
        { params: { roleId } }
      );

      if (!response) return;

      const role = response.data[0];

      reset({
        roleName: role.roleName || "",
        isActive: role.isActive?.toString() || "",
        faIconId: role.faIconId || "",
        roleId: role.roleId || roleId,
      });
    } catch (err) {
      console.error("Error while loading role for edit:", err);
    }
  };

  // Load icon list once
  const loadIconList = async () => {
    const response = await fetchApi("GET", ENDPOINTS.FA_ICON_LIST);

    if (!response) {
      return;
    }

    setIconsList(response.data || []);
  };

  useEffect(() => {
    loadIconList();
  }, []);

  // Load role details only when: roleId is present AND icons are loaded
  useEffect(() => {
    if (roleId && iconsList.length > 0) {
      fetchRoleDetails(roleId);
    }

    if (!roleId) {
      reset({
        roleName: "",
        isActive: "",
        faIconId: "",
        roleId: "0",
      });
    }
  }, [roleId, iconsList, reset]);

  // Submit handler
  const onSubmit = async data => {
    const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_ROLE_MASTER, data);

    if (!response) {
      setErrorMessage(error);
      return;
    }

    setSuccessMessage(response.message || "Role saved successfully!");
    setErrorMessage("");

    onCloseDrawer?.();

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-bg-fade opacity-100 visible" onClick={onClose} />

      <div className="drawer-layout drawer-bg translate-x-0">
        <div className="drawer-title-border">
          <h2 className="drawer-title">{drawerTitle}</h2>
          <button onClick={onClose} className="drawer-close-btn">
            ×
          </button>
        </div>

        <div className="p-4">
          {/* SUCCESS / ERROR MESSAGES */}
          <div className="mb-4">
            {successMessage && <SuccessMessage text={successMessage} />}
            {errorMessage && <ErrorMessage text={errorMessage} />}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ROLE NAME */}
            <InputField label="Role Name" required>
              <input
                placeholder="Enter Role Name"
                {...register("roleName")}
                className="input-field"
              />
              {errors.roleName && (
                <p className="text-red-600 text-sm mt-1">{errors.roleName.message}</p>
              )}
            </InputField>

            {/* STATUS */}
            <InputField label="Status" required>
              <select {...register("isActive")} className="input-field">
                <option value="">Select</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
              {errors.isActive && (
                <p className="text-red-600 text-sm mt-1">{errors.isActive.message}</p>
              )}
            </InputField>

            {/* ICON SELECT */}
            <InputField label="Role Icon" required>
              <select {...register("faIconId")} className="input-field">
                <option value="">Select Icon</option>

                {iconsList.map(icon => (
                  <option key={icon.id} value={icon.id}>
                    {icon.iconName}
                  </option>
                ))}
              </select>

              {errors.faIconId && (
                <p className="text-red-600 text-sm mt-1">{errors.faIconId.message}</p>
              )}
            </InputField>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded mt-5 flex justify-center items-center font-medium active:scale-95 transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#1e6da1] hover:bg-blue-600 text-white"
              }`}
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
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </>
  );
};

export default RoleMasterDrawer;
