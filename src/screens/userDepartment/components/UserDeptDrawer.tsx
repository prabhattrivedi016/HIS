import { SubmitHandler, useForm } from "react-hook-form";
import { Spinner } from "../../../../assets/svgIcons";
import InputField from "../../../components/customInputField/index";
import CustomLoader from "../../../components/customLoader";
import useGlobalApi from "../../../hooks/useGlobalApi";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText/index";
import { userDepartmentSchema } from "../../../validation/UserDepartmentSchema";

import Button from "../../../components/customButton";
import { ENDPOINTS } from "../../../config/defaults";
import { Payload, UserDeptDrawerProps } from "./types";
const UserDeptDrawer = ({
  isOpen,
  onClose,
  buttonTitle,
  drawerTitle,
  deptId,
}: UserDeptDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [sucessMessage, setSuccessMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  //   add new or update department
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Payload>({
    resolver: yupResolver(userDepartmentSchema) as any,
    defaultValues: {
      id: "0",
      departmentName: "",
      isActive: "",
    },
  });

  //   create update  handle submit
  const onSubmit: SubmitHandler<Payload> = async (payload: Payload) => {
    try {
      const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_USER_DEPARTMENT, payload);

      if (!response) return;
      setSuccessMessage(response?.message || "Department created successfully");
      timerRef.current = setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      console.error("Error while creating new department", error);
    }
  };
  //   cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  //   fetch uber department by id:
  const fetchDepartmentById = async (deptId: number) => {
    try {
      const response = await fetchApi(
        "GET",
        ENDPOINTS.GET_DEPARTMENT_LIST,
        {},
        {
          params: { id: deptId },
        }
      );
      if (!response) return;

      const userDept = response?.data?.[0];

      reset({
        id: userDept?.id || "",
        departmentName: userDept?.departmentName || "",
        isActive: userDept?.isActive?.toString() || "",
      });
    } catch (error) {
      console.error("Error while fetching the user department by id", error);
    }
  };

  useEffect(() => {
    if (deptId) {
      fetchDepartmentById(deptId);
    }
    reset({
      id: "0",
      isActive: "",
      departmentName: "",
    });
  }, [deptId, reset]);

  return (
    <div className="fixed inset-0 z-999">
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
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
              {sucessMessage ? <SuccessMessage text={sucessMessage} /> : <></>}
              {error ? <ErrorMessage text={error} /> : <></>}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <InputField label="Department Name" required={true}>
                <input
                  placeholder="Enter Department Name"
                  className="input-field"
                  {...register("departmentName")}
                />
                {errors.departmentName && (
                  <p className="input-field-error">{errors.departmentName.message}</p>
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

export default UserDeptDrawer;
