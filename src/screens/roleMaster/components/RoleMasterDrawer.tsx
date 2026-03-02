import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

import { LOGOS } from "../../../assets/logos";

import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { SelectStyles } from "../../../components/customSelect";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";

import { useScrollLock } from "@/hooks/useScrollLock";
import { roleMasterSchema } from "@/validation/roleMasterSchema";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { Payload, RoleMasterProps } from "../type";

const RoleMasterDrawer = ({ isOpen, onClose, onCloseDrawer, roleId }: RoleMasterProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const title = !!roleId ? "Update" : "Create";

  const [successMessage, setSuccessMessage] = useState<string>("");

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
      isActive: 1,
      faIconId: "0",
      roleId: 0,
      imagePath: "",
    },
  });

  useScrollLock(isOpen);

  const fetchRoleDetails = async (id: number) => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.ROLE_MASTER_LIST,
      {},
      { params: { roleId: id } },
      { component: "ROleMasterDrawer" }
    );

    if (!response) return;

    const role = response?.data?.[0];

    reset({
      roleName: role?.roleName || "",
      isActive: role?.isActive || 1,
      faIconId: role?.faIconId || 0,
      roleId: role?.roleId || id,
      imagePath: role?.imagePath || "",
    });
  };

  useEffect(() => {
    if (roleId) {
      fetchRoleDetails(roleId);
    }

    if (!roleId) {
      reset({
        roleName: "",
        isActive: 1,
        faIconId: "0",
        roleId: 0,
        imagePath: "",
      });
    }
  }, [roleId, reset]);

  const onSubmit = async (data: Payload) => {
    const response = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_ROLE_MASTER,
      data,
      {},
      { component: "RoleMasterDrawer" }
    );

    if (!response) {
      return;
    }

    const msg = roleId ? "Updated successfully" : "Created successfully";

    setSuccessMessage(response?.message || msg);
    window.dispatchEvent(new CustomEvent("role-master-updated"));

    onCloseDrawer?.();

    setTimeout(onClose, 1000);
  };

  const iconOptions = LOGOS.map(icon => ({
    value: icon.id,
    label: icon.label,
    iconPath: icon.value,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999">
      <div className="absolute inset-0">
        {/* BACKDROP */}
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
          onClick={onClose}
        />

        {/* RIGHT DRAWER */}
        <div className={`drawer-layout drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="drawer-title-border">
            <h2 className="drawer-title">{title} Role Master</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          {successMessage && <SuccessMessage text={successMessage} />}
          {error && <ErrorMessage text={error?.message} />}

          <div className="card m-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid-2">
                {/* Role Name */}
                <InputField label="Role Name" required>
                  <input
                    {...register("roleName")}
                    className="input-field"
                    placeholder="Enter role name"
                  />
                  {errors.roleName && (
                    <p className="input-field-error">{errors.roleName.message}</p>
                  )}
                </InputField>

                {/* Status */}
                <InputField label="Status" required>
                  <select {...register("isActive")} className="input-field">
                    <option value="">Select</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                  {errors.isActive && (
                    <p className="input-field-error">{errors.isActive.message}</p>
                  )}
                </InputField>

                {/* Icon */}
                <InputField label="Role Icon" required>
                  <Controller
                    name="imagePath"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={iconOptions}
                        placeholder="Select icon"
                        isSearchable
                        isClearable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={SelectStyles}
                        value={iconOptions.find(opt => opt.iconPath === field.value) || null}
                        onChange={opt => field.onChange(opt ? opt.iconPath : "")}
                        formatOptionLabel={opt => (
                          <div className="flex items-center justify-between gap-4 px-2">
                            <span>{opt.label}</span>
                            <img src={opt.iconPath} className="h-8 w-8 object-contain" />
                          </div>
                        )}
                      />
                    )}
                  />
                  {errors.imagePath && (
                    <p className="input-field-error">{errors.imagePath.message}</p>
                  )}
                </InputField>
              </div>

              <div className="form-actions-responsive mt-5">
                <button type="submit" className="save-btn">
                  {title}
                </button>
                <button type="button" className="cancel-button ">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default RoleMasterDrawer;
