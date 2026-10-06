import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "../../../assets/svgIcons";
import { ENDPOINTS } from "../../config/defaults/index";
import useGlobalApi from "../../hooks/useGlobalApi";
import { usePickMaster } from "../../hooks/usePickMaster";
import { formValidator } from "../../validation/formValidator";
import InputField from "../customInputField";
import CustomLoader from "../customLoader";
import { ErrorMessage, SuccessMessage } from "../infoText/index";

const FormComponent = ({
  isOpen,
  onClose,
  formConfig,
  userId = "0",
  buttonTitle,
  drawerTitle,
  refreshData,
}) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const genderValue = usePickMaster("gender");
  const genderList = genderValue?.pickMasterValue ?? [];

  const userRolesList = usePickMaster("UserRoleForUserMaster")?.pickMasterValue ?? [];

  const [userDepartment, setUserDepartment] = useState([]);
  const [userMasterList, setUserMasterList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [localSelectData, setLocalSelectData] = useState({});
  const [userMasterData, setUserMasterData] = useState({});

  const isEditMode = !!userId && userId !== "0";

  //  fetch department
  const userDepartmentList = async () => {
    const response = await fetchApi("GET", ENDPOINTS.USER_DEPARTMENT_LIST);
    if (!response) return;
    setUserDepartment(response?.data || []);
  };

  const getUserMasterList = async () => {
    const response = await fetchApi("GET", ENDPOINTS.USER_MASTER_LIST);
    setUserMasterList(response?.data || []);
  };

  useEffect(() => {
    userDepartmentList();
    getUserMasterList();
  }, []);

  //  fetch only selected user
  const getUserMasterById = async (userId: number) => {
    try {
      const response = await fetchApi(
        "GET",
        ENDPOINTS.USER_MASTER_LIST,
        {},
        { params: { userId } }
      );

      if (!response) return;

      setUserMasterData(response?.data?.[0] || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId && userId !== "0") {
      getUserMasterById(userId);
    }
  }, [userId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {},
  });

  const convertDateFormat = dateString => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  // ✅ reset form on edit
  useEffect(() => {
    if (!userMasterData) return;

    const values = formConfig?.reduce((acc, field) => {
      if (field.fieldId) {
        let value = userMasterData[field.fieldId] ?? "";

        if (field.type === "date" && value) {
          value = convertDateFormat(value);
        }

        if (field.fieldId === "confirmPassword") {
          acc[field.fieldId] = userMasterData?.password ?? "";
        } else {
          acc[field.fieldId] = value;
        }
      }
      return acc;
    }, {});

    reset(values);
  }, [userMasterData, formConfig, reset]);

  // ✅ set select values
  useEffect(() => {
    if (!userMasterData) return;

    const selectData = {};

    formConfig?.forEach(field => {
      if (field.type === "select") {
        if (field.fieldId === "userDepartmentId") {
          selectData[field.fieldId] =
            userDepartment?.find(d => d.id === userMasterData[field.fieldId])?.departmentName ??
            `Select ${field.label}`;
        } else {
          selectData[field.fieldId] = userMasterData[field.fieldId] ?? `Select ${field.label}`;
        }
      }
    });

    setLocalSelectData(selectData);
  }, [userMasterData, userDepartment, formConfig]);

  const headingField = formConfig?.find(f => f.type === "heading");

  // submit handler
  const onSubmit = async data => {
    try {
      const payload = {
        ...data,
        userId: userId || "0",
        userRole: userRolesList.find(u => String(u?.key) === String(data?.userRoleId))?.value ?? "",
        canChangePassword: data?.canChangePassword ? 1 : 0,
        reportToUserId: Number(data?.reportToUserId) || 0,
        userDepartmentId: Number(data?.userDepartmentId) || 0,
      };

      const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_USER_MASTER, payload);

      if (!response) {
        setErrorMessage(error?.message ?? "Something went wrong!");
        return;
      }

      setSuccessMessage(response?.message || "Saved successfully!");

      setTimeout(() => {
        onClose();
      }, 1000);
      refreshData();
    } catch (err) {
      setErrorMessage("Something went wrong!");
    }
  };

  const getSelectOptions = (fieldId: string) => {
    switch (fieldId) {
      case "gender":
        return genderList.map(g => ({
          key: g.value,
          value: g.value,
        }));

      case "userDepartmentId":
        return userDepartment?.map(dept => ({
          key: dept.id,
          value: dept.departmentName,
        }));

      case "isActive":
        return [
          { key: 1, value: "Active" },
          { key: 0, value: "Inactive" },
        ];

      case "reportToUserId":
        return userMasterList?.map(user => ({
          key: user.id,
          value: user.userName,
        }));

      case "userRoleId":
        return userRolesList?.map(role => ({
          key: role.key,
          value: role.value,
        }));

      default:
        return [];
    }
  };

  const renderComponent = ({ component, index }) => {
    const { type, fieldId, label } = component ?? {};
    const isPassword = fieldId === "password" || fieldId === "confirmPassword";

    switch (type) {
      case "text":
      case "email":
      case "password":
      case "date": {
        const isDisabled = isEditMode && isPassword && !watch("canChangePassword");
        return (
          <div key={index}>
            <InputField label={label} required={!isEditMode && component.required}>
              <input
                type={type}
                placeholder={component.placeholder || `Enter ${label}`}
                {...register(
                  fieldId,
                  (isEditMode && isPassword) || isDisabled
                    ? {} // ✅ no validation
                    : formValidator(component, getValues, formConfig).validationRules
                )}
                // ✅ FIX: use readOnly instead of disabled
                disabled={isDisabled}
                readOnly={isEditMode && isPassword && isDisabled}
                {...(!isEditMode || !isPassword
                  ? formValidator(component, getValues, formConfig).uiAttributes
                  : {})}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition ${
                  isDisabled
                    ? "disabled-input-field cursor-not-allowed"
                    : "bg-white focus:ring-indigo-500 focus:border-indigo-500"
                }`}
              />
            </InputField>

            {errors[fieldId] && (
              <p className="text-red-500 text-sm mt-1">{errors[fieldId]?.message as string}</p>
            )}
          </div>
        );
      }

      case "select":
        const options = getSelectOptions(fieldId);

        return (
          <div key={index}>
            <InputField label={component.label} required={component.required}>
              <select
                {...register(
                  component.fieldId,
                  formValidator(component, getValues, formConfig).validationRules
                )}
                className="input-field"
              >
                <option value="">{localSelectData?.[component?.fieldId]}</option>
                {options.map((g, idx) => (
                  <option key={idx} value={g.key}>
                    {g.value}
                  </option>
                ))}
              </select>
            </InputField>
            {errors[fieldId] && (
              <p className="text-red-500 text-sm mt-1">{errors[fieldId]?.message as string}</p>
            )}
          </div>
        );

      case "textArea":
        return (
          <div key={index}>
            <InputField label={component.label} required={component.required}>
              <textarea
                {...register(
                  component.fieldId,
                  formValidator(component, getValues, formConfig).validationRules
                )}
                className="input-field"
              />
            </InputField>
            {errors[fieldId] && (
              <p className="text-red-500 text-sm mt-1">{errors[fieldId]?.message as string}</p>
            )}
          </div>
        );

      case "checkbox":
        if (!isEditMode) return null;
        return (
          <div key={index} className="col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register(component.fieldId, {
                  onChange: e => {
                    if (e.target.checked) {
                      setValue("password", "");
                      setValue("confirmPassword", "");
                    }
                  },
                })}
                disabled={watch(component.fieldId)}
                className={`input-checkbox ${watch(component.fieldId) ? "cursor-not-allowed opacity-50" : ""}`}
              />
              <label htmlFor={component.fieldId} className="font-bold">
                {component.label}
              </label>
            </div>
          </div>
        );

      case "button":
        return (
          <div key={index} className="col-span-2 mt-4">
            <button
              type="submit"
              className={`save-btn w-full ${loading ? "bg-gray-400 cursor-not-allowed text-white" : ""}`}
              disabled={loading}
            >
              {loading ? <Spinner /> : buttonTitle}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[700px] lg:w-[800px]
                    bg-gray-100 shadow-xl z-50 transition-transform duration-300 overflow-y-auto ${
                      isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            {headingField ? drawerTitle : "Create New User"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error?.message} />}

        <div className="card m-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid-2">
              {formConfig?.map((component, index) => renderComponent({ component, index }))}
            </div>
          </form>
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default FormComponent;
