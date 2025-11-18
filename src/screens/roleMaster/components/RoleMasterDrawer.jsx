import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createUpdateRoleMaster, getFaIconList, getRoleMaster } from "../../../api/roleMasterApis";
import InputField from "../../../components/customInputField";
import { roleMasterSchema } from "../../../validation/roleMasterSchema";

const RoleMasterDrawer = ({ isOpen, onClose, buttonTitle, drawerTitle, onCloseDrawer, roleId }) => {
  const [iconsList, setIconsList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [localIcon, setLocalIcon] = useState({ id: "", value: "Select Icon" });

  const { register, handleSubmit, reset } = useForm({
    resolver: yupResolver(roleMasterSchema),
    defaultValues: {
      roleName: "",
      isActive: "",
      faIconId: "",
      roleId: "0",
    },
  });

  // role master  by Id
  const fetchRoleDetails = async () => {
    try {
      const response = await getRoleMaster(roleId);
      const roleData = response?.data?.data?.[0];

      reset({
        roleName: roleData?.roleName || "",
        isActive: roleData?.isActive?.toString() || "",
        faIconId: roleData?.faIconId || "",
        roleId: roleData?.roleId || roleId,
      });

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
    try {
      const response = await getFaIconList();
      const apiResponse = response?.data;
      setIconsList(apiResponse?.data || []);
    } catch (error) {
      console.log("error while fetching the icons list", error);
    }
  };

  useEffect(() => {
    getIcons();
  }, []);

  const onSubmit = async data => {
    try {
      const response = await createUpdateRoleMaster(data);
      const apiResponse = response?.data;
      setSuccessMessage(apiResponse?.message || "New Role Created Successfully!");
      setErrorMessage("");
      onCloseDrawer?.();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      const apiError = error?.response?.data;
      setErrorMessage(apiError?.message || "Something went wrong!");
    }
  };

  if (!isOpen) return;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-150 bg-gray-100 shadow-xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{drawerTitle}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black text-xl leading-none">
            ×
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            {successMessage && (
              <div className="animate-fade-in m-4 px-6 py-3 rounded-xl bg-green-100 border border-green-300 text-green-700 text-center font-medium shadow-sm">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="animate-fade-in  m-4 px-6 py-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-center font-medium shadow-sm">
                {errorMessage}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField label="Role Name" required={true}>
              <input {...register("roleName")} className="w-full px-4 py-2 border rounded-lg" />
            </InputField>

            <InputField label="Status" required={true}>
              <select
                {...register("isActive")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                <option value="">Select</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </InputField>

            <InputField label="Role Icon" required={true}>
              <div className="flex items-center gap-2">
                <select
                  {...register("faIconId")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                >
                  <option value={localIcon?.id}>{localIcon?.value}</option>
                  {iconsList.map(icon => (
                    <option key={icon.id} value={icon.id}>
                      {icon.iconName}
                    </option>
                  ))}
                </select>
              </div>
            </InputField>

            <button
              type="submit"
              className="w-full py-2 bg-[#1e6da1] text-white rounded hover:bg-blue-600 transition-colors font-medium mt-5"
            >
              {buttonTitle}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RoleMasterDrawer;
