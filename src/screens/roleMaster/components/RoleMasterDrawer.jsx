import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { Spinner } from "../../../../assets/svgIcons";
import { LOGOS } from "../../../assets/logos";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { SelectStyles } from "../../../components/customSelect";
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
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(roleMasterSchema),
    defaultValues: {
      roleName: "",
      isActive: "",
      faIconId: "0",
      roleId: "0",
      imagePath: "",
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

      const role = response?.data[0];

      reset({
        roleName: role.roleName || "",
        isActive: role.isActive?.toString() || "",
        faIconId: role.faIconId || 0,
        roleId: role.roleId || roleId,
        imagePath: role?.imagePath || "",
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

  // role icon select options

  const roleIconsSelectOption = LOGOS.map(icon => ({
    value: icon.id,
    label: icon.label,
    iconPath: icon.value,
  }));

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
              {errors.roleName && <p className="input-field-error">{errors.roleName.message}</p>}
            </InputField>

            {/* STATUS */}
            <InputField label="Status" required>
              <select {...register("isActive")} className="input-field">
                <option value="">Select</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>

            {/* ICON SELECT */}

            <InputField label="Role Icon" required>
              <Controller
                name="imagePath"
                control={control}
                render={({ field }) => (
                  <Select
                    options={roleIconsSelectOption}
                    placeholder="Select role icon"
                    isSearchable
                    isClearable
                    getOptionLabel={option => option?.label}
                    getOptionValue={option => option?.iconPath}
                    formatOptionLabel={option => (
                      <div className="flex items-center justify-between gap-4 mx-4">
                        <span>{option?.label}</span>
                        <img
                          src={option?.iconPath}
                          alt={option?.label}
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                    )}
                    /* map value back to option */
                    value={roleIconsSelectOption.find(opt => opt.iconPath === field.value) || null}
                    onChange={option => {
                      field.onChange(option ? option?.iconPath : "");
                      // setValue("faIconId", 0);
                    }}
                    classNames={SelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                )}
              />

              {errors.imagePath && <p className="input-field-error">{errors.imagePath.message}</p>}
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
