import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { changePasswordSchema } from "@/validation/userSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";

const UserReset = ({ isOpenTab, onCloseTab }) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const headerName = "User Profile Details";

  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const userId = user?.userId;

  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      name: "",
      gender: "",
      dob: "",
      contactNo: "",
      email: "",
      userName: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const getUSerById = async (userId: number) => {
    const res = await fetchApi(
      "GET",
      ENDPOINTS.USER_MASTER_LIST,
      {},
      { params: { userId } },
      { component: "UserReset" }
    );
    reset({
      name: res?.data?.[0]?.userName ?? "",
      gender: res?.data?.[0]?.gender ?? "",
      dob: res?.data?.[0]?.dob ?? "",
      contactNo: res?.data?.[0]?.contact ?? "",
      email: res?.data?.[0]?.email ?? "",
      userName: res?.data?.[0]?.userName ?? "",
    });
  };
  useEffect(() => {
    if (userId) {
      getUSerById(userId);
    }
  }, [userId]);

  useScrollLock(isOpenTab);

  /*-------------------submit handler-------------- */
  const onsubmit = async data => {
    const payload = {
      userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword,
    };

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_PASSWORD,
      payload,
      {},
      { component: "UserReset" }
    );

    if (resp?.result) {
      setSuccessMessage(resp?.message ?? "Password updated successfully");
    }
  };

  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpenTab ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpenTab ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-250 ${isOpenTab ? "opacity-full" : ""}`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">{headerName}</h2>
          <button onClick={onCloseTab} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        {successMessage ? <SuccessMessage text={successMessage} /> : null}
        {error?.message ? <ErrorMessage text={error?.message} /> : <></>}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit(onsubmit)}>
            <div className="form-grid-3">
              <InputField label="Name">
                <input
                  type="text"
                  className="disabled-input-field"
                  {...register("name")}
                  readOnly
                />
              </InputField>

              <InputField label="Gender">
                <input className="disabled-input-field" {...register("gender")} readOnly />
              </InputField>

              <InputField label="DOB">
                <input type="text" className="disabled-input-field" {...register("dob")} readOnly />
              </InputField>

              <InputField label="Contact No">
                <input
                  type="text"
                  className="disabled-input-field"
                  {...register("contactNo")}
                  readOnly
                />
              </InputField>

              <InputField label="Email">
                <input
                  type="text"
                  className="disabled-input-field"
                  {...register("email")}
                  readOnly
                />
              </InputField>

              <InputField label="User Name">
                <input
                  type="text"
                  className="disabled-input-field"
                  {...register("userName")}
                  readOnly
                />
              </InputField>

              <InputField label="Current Password" required>
                <input type="password" className="input-field" {...register("currentPassword")} />
                {errors.currentPassword && (
                  <p className="input-field-error">{errors.currentPassword.message}</p>
                )}
              </InputField>

              <InputField label="New Password" required>
                <input type="password" className="input-field" {...register("newPassword")} />
                {errors.newPassword && (
                  <p className="input-field-error">{errors.newPassword.message}</p>
                )}
              </InputField>

              <InputField label="Confirm Password" required>
                <input
                  type="password"
                  className="input-field"
                  {...register("confirmNewPassword")}
                />
                {errors.confirmNewPassword && (
                  <p className="input-field-error">{errors.confirmNewPassword.message}</p>
                )}
              </InputField>
            </div>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                Update
              </button>
              <button type="button" className="cancel-button" onClick={onCloseTab}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>,
    document.body
  );
};

export default UserReset;
