import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createUpdateUserMaster,
  getUserDepartmentList,
  getUserMasterList,
} from "../../api/userMasterApis";
import { usePickMaster } from "../../hooks/usePickMaster";
import { formValidator } from "../../validation/formValidator";
import InputField from "../customInputField";

const userMasterData = {
  id: 6,
  firstName: "xyz",
  midelName: "",
  lastName: "",
  dob: "06-11-2025",
  gender: "Female",
  userName: "admin1",
  password: "PE5wEEM4Z908b#5vhjP31QecdNt@hwdbgT",
  address: "vns",
  contact: "1234567890",
  email: "admin@gamil.com",
  isActive: 1,
  employeeID: "002",
  createdBy: "GWS   (GWS)",
  createdOn: "14-11-2025 06:13 PM",
  lastModifiedBy: "Rohit   (Rohit)",
  lastModifiedOn: null,
  reportToUserId: 1,
  userDepartmentId: 2,
};

const FormComponent = ({ open, onClose, formConfig }) => {
  const { pickMasterValue, getPickMasterValue } = usePickMaster();
  const [userDepartment, setUserDepartment] = useState([]);
  const [userMasterList, setUserMasterList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [localSelectData, setLocalSelectData] = useState({});

  // Fetch gender picklist
  useEffect(() => {
    getPickMasterValue("gender");
  }, []);

  //   user depaetmentlist
  const userDepartmentList = async () => {
    try {
      const response = await getUserDepartmentList();
      const apiResponse = response?.data;
      //   console.log("response of user department", apiResponse?.data);
      setUserDepartment(apiResponse?.data);
    } catch (error) {
      console.log("error while fetching the user department list", error?.message);
    }
  };

  useEffect(() => {
    userDepartmentList();
  }, []);

  //   user master list
  const getUserMaster = async () => {
    try {
      const response = await getUserMasterList();
      //   console.log("user master list", response?.data?.data);
      const apiResponse = response?.data;
      setUserMasterList(apiResponse?.data);
    } catch (error) {
      console.log("error while fetching the user master list", error?.message);
    }
  };

  useEffect(() => {
    getUserMaster();
  }, []);

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

        acc[field.fieldId] = fieldValue;

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
  }, [userMasterData, formConfig, reset, userDepartment]);

  const headingField = formConfig?.find(f => f.type === "heading");
  const requiredField = formConfig?.find(f => f.type === "requiredErrorMessage");

  // handle submit
  const onSubmit = async data => {
    try {
      const response = await createUpdateUserMaster(data);
      console.log(response?.data);
      const apiResponse = response?.data;
      setSuccessMessage(apiResponse?.message);
      setErrorMessage("");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      const apiError = error?.response?.data;
      console.log("api error is:", apiError?.message);
      setErrorMessage(apiError?.message);
    }
  };

  console.log("error message is:", errorMessage);

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
    const { type } = component ?? {};

    switch (type) {
      case "text":
      case "email":
      case "password":
      case "date":
        return (
          <div key={index}>
            <InputField label={component.label} required={component.required}>
              <input
                type={component.type}
                placeholder={component.placeholder || `Enter ${component.label}`}
                {...register(
                  component.fieldId,
                  formValidator(component, getValues, formConfig).validationRules
                )}
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
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                         transition duration-200 font-medium"
            >
              {component.label}
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
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[700px] lg:w-[800px]
                    bg-gray-100 shadow-xl z-50 transition-transform duration-300 overflow-y-auto ${
                      open ? "translate-x-0" : "translate-x-full"
                    }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800">
              {headingField ? headingField.label : "Create New User"}
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
    </>
  );
};

export default FormComponent;
