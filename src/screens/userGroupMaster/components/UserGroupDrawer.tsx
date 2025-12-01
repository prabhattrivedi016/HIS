import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "../../../../assets/svgIcons";
import Button from "../../../components/customButton";
import InputField from "../../../components/customInputField/index";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText/index";
import { ENDPOINTS } from "../../../config/defaults/index";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { userGroupSchema } from "../../../validation/userGroupSchema";
import { FormSubmitProps, UserGroupDrawerProps } from "../type";

const UserGroupDrawer = ({
  isOpen,
  onClose,
  drawerTitle,
  buttonTitle,
  onCloseDrawer,
  id,
}: UserGroupDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [successMessage, setSuccessMessage] = useState("");
  const timerRef = useRef<any>(null);

  // add new user or edit form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userGroupSchema),
    defaultValues: {
      id: "0",
      groupName: "",
      isActive: "",
    },
  });

  // create/update handle submit
  const onSubmit = async (data: FormSubmitProps) => {
    try {
      const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_USER_GROUP_MASTER, {
        ...data,
      });

      if (!response) return;
      setSuccessMessage(response?.message || "Group created successfully");
      onCloseDrawer?.();
      timerRef.current = setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error while creating updating user group master", error);
    }
  };

  // cleanup function
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  //   fetch user group by id
  const fetchUserGroupById = async (id = "") => {
    console.log("this function is called", id);

    try {
      const options = id ? { params: { id } } : {};
      console.log("options", options);

      const response = await fetchApi("GET", ENDPOINTS.USER_GROUP_LIST, {}, options);

      const userGroupData = response?.data?.[0];

      reset({
        id: userGroupData?.id || "",
        groupName: userGroupData?.groupName || "",
        isActive: userGroupData?.isActive?.toString() || "",
      });
    } catch (error) {
      console.error("Error while upating user by id", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserGroupById(id);
    }
    reset({
      id: "0",
      isActive: "",
      groupName: "",
    });
  }, [id, reset]);

  return (
    <div className="fixed inset-0 z-999">
      <div className="absolute inset-0">
        {/* background fade  */}
        <div
          className={`drawer-bg-fade
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
          onClick={onClose}
        />

        {/* right side drawer */}
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

              {error && <ErrorMessage text={error} />}
            </div>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <InputField label="Group Name" required={true}>
                <input
                  placeholder="Enter Group Name"
                  className="input-field"
                  {...register("groupName")}
                />
                {errors.groupName && (
                  <p className="input-field-error">{errors.groupName.message}</p>
                )}
              </InputField>

              <InputField label="Status" required={true}>
                <select {...register("isActive")} className="input-field">
                  <option value="">Select</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
                {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
              </InputField>

              <Button type="submit" variant="addButtons">
                {loading ? (
                  <>
                    <Spinner />
                    <span>Creating...</span>
                  </>
                ) : (
                  buttonTitle
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default UserGroupDrawer;
