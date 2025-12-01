import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "../../../assets/svgIcons";
import { ENDPOINTS } from "../../config/defaults/index";
import { usePickMaster } from "../../hooks/usePickMaster";
import { formValidator } from "../../validation/formValidator";
import InputField from "../customInputField";
import CustomLoader from "../customLoader";

const FormComponent = ({
  isOpen,
  onClose,
  formConfig,
  userId = "0",
  buttonTitle,
  drawerTitle,
  setParentLoader,
  refreshData,
}) => {
  const { pickMasterValue } = usePickMaster({ fieldName: "gender" });

  const [userDepartment, setUserDepartment] = useState([]);
  const [userMasterList, setUserMasterList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [localSelectData, setLocalSelectData] = useState({});
  const [userMasterData, setUserMasterData] = useState({});

  // check for edit mode
  const isEditMode = !!userId && userId !== "0";

  //   user depaetmentlist
  const userDepartmentList = async () => {
    const response = await fetchApi("GET", ENDPOINTS.USER_DEPARTMENT_LIST);

    if (!response) {
      console.error("Failed to fetch user department list");
      return;
    }

    setUserDepartment(response?.data || []);
  };

  // user master list
  const getUserMaster = async (id = "") => {
    const options = id ? { params: { userId: id } } : {};

    const response = await fetchApi("GET", ENDPOINTS.USER_MASTER_LIST, {}, options);

    if (!response) {
      console.error("Failed to fetch user master list");
      return;
    }

    // API returns: response.data.data
    setUserMasterList(response?.data || []);
  };

  useEffect(() => {
    getUserMaster();
    if (userId) getUserMasterById();
    userDepartmentList();
  }, []);

  // fetch user by id

  const getUserMasterById = async userId => {
    try {
      const options = {
        params: { userId },
      };

      const response = await fetchApi("GET", ENDPOINTS.USER_MASTER_LIST, {}, options);

      if (!response) return;

      const apiResponse = response?.data;
      setUserMasterData(apiResponse?.[0] || null);
    } catch (error) {
      console.log("Error fetching user master by ID:", error);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm({
    defaultValues: {},
  });

  // Helper function to convert date format from DD-MM-YYYY to YYYY-MM-DD
  const convertDateFormat = dateString => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const formDataDefaultValues = formConfig?.reduce((acc, field) => {
      if (field.fieldId) {
        let fieldValue = userMasterData?.[field?.fieldId] ?? "";

        if (field?.type === "date" && fieldValue) {
          fieldValue = convertDateFormat(fieldValue);
        }

        if (field?.fieldId === "confirmPassword") {
          acc[field.fieldId] = userMasterData?.["password"] ?? "";
        } else {
          acc[field.fieldId] = fieldValue;
        }
        if (field?.type === "select") {
          setLocalSelectData(prev => {
            if (field?.fieldId === "userDepartmentId") {
              return {
                ...prev,
                [field?.fieldId]:
                  userDepartment?.find(dept => dept?.id === userMasterData?.[field?.fieldId])
                    ?.departmentName ?? `Select ${field?.label}`, // FIX: fix this
              };
            }

            return {
              ...prev,
              [field?.fieldId]: userMasterData?.[field?.fieldId] ?? `Select ${field?.label}`,
            };
          });
        }
      }
      return acc;
    }, {});
    reset(formDataDefaultValues);
  }, [formConfig, reset, userDepartment]);

  const headingField = formConfig?.find(f => f.type === "heading");
  const requiredField = formConfig?.find(f => f.type === "requiredErrorMessage");

  // submit handler
  const onSubmit = async data => {
    try {
      const payload = {
        ...data,
        userId: userId || "0",
      };

      const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_USER_MASTER, payload);

      if (!response) {
        setErrorMessage(error || "Something went wrong!");
        return;
      }

      setSuccessMessage(response?.message || "Saved successfully!");
      refreshData();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong!";
      setErrorMessage(msg);
    }
  };

  //  correct dropdown menu for gender
  const getSelectOptions = fieldId => {
    switch (fieldId) {
      case "gender":
        return (
          pickMasterValue?.data?.map(g => ({
            key: g.value,
            value: g.value,
          })) || []
        );

      case "userDepartmentId":
        return (
          userDepartment?.map(dept => ({
            key: dept.id,
            value: dept.departmentName,
          })) || []
        );

      case "isActive":
        return [
          { key: 1, value: "Active" },
          { key: 0, value: "Inactive" },
        ];

      case "reportToUserId":
        return (
          userMasterList?.map(user => ({
            key: user.id,
            value: user.userName,
          })) || []
        );
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
      case "date":
        return (
          <div key={index}>
            <InputField label={label} required={!isEditMode && component.required}>
              <input
                type={type}
                placeholder={component.placeholder || `Enter ${label}`}
                {...register(
                  fieldId,
                  isEditMode && isPassword
                    ? {}
                    : formValidator(component, getValues, formConfig).validationRules
                )}
                disabled={isEditMode && isPassword ? true : false}
                {...formValidator(component, getValues, formConfig).uiAttributes}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white 
                           focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>
            {errors[component.fieldId] && (
              <p className="text-red-500 text-sm mt-1">{errors[component.fieldId].message}</p>
            )}
          </div>
        );

      case "select":
        const options = getSelectOptions(component.fieldId);
        return (
          <div key={index}>
            <InputField label={component.label} required={component.required}>
              <select
                {...register(
                  component.fieldId,
                  formValidator(component, getValues, formConfig).validationRules
                )}
                {...formValidator(component, getValues, formConfig).uiAttributes}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white 
                           focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                <option value="">{localSelectData?.[component?.fieldId]}</option>
                {options.map((g, idx) => (
                  <option key={idx} value={g.key}>
                    {g.value}
                  </option>
                ))}
              </select>
            </InputField>
            {errors[component.fieldId] && (
              <p className="text-red-500 text-sm mt-1">{errors[component.fieldId].message}</p>
            )}
          </div>
        );

      case "textArea":
        return (
          <div key={index}>
            <InputField label={component.label} required={component.required}>
              <textarea
                placeholder={component.placeholder || `Enter ${component.label}`}
                {...register(
                  component.fieldId,
                  formValidator(component, getValues, formConfig).validationRules
                )}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white 
                           focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>
            {errors[component.fieldId] && (
              <p className="text-red-500 text-sm mt-1">{errors[component.fieldId].message}</p>
            )}
          </div>
        );

      case "button":
        return (
          <div key={index} className="col-span-2 mt-4">
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
                  <Spinner /> Loading ...
                </span>
              ) : (
                buttonTitle
              )}
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
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800">
              {headingField ? drawerTitle : "Create New User"}
            </h2>
            <p className="text-sm text-red-500 mt-1">
              {requiredField ? requiredField.label : "Fields marked with * are required"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div>
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
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
