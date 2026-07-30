import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useScrollLock } from "@/hooks/useScrollLock";
import { PickMasterItem } from "@/types";
import {
  createUpdateDoctorDepartmentFormItem,
  doctorDepartmentSchema,
} from "@/validation/serviceMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { QueryObserverResult } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DoctorDepartmentList } from "../types";

const DoctorDepartmentPopup = ({
  isOpen,
  onClose,
  data,
  refreshDepartment,
  resetDepartmentId,
  resetData,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: DoctorDepartmentList | null;
  refreshDepartment?: () => Promise<QueryObserverResult<any, Error>>;
  resetDepartmentId?: (id: number) => void;
  resetData?: (data: DoctorDepartmentList | null) => void;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const departmentTypeList = usePickMaster("DoctorDepartmentType")?.pickMasterValue ?? [];

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const buttonTitle = data ? "Update" : "Create";

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(doctorDepartmentSchema),
    defaultValues: {
      departmentId: 0,
      department: "",
      departmentTypeId: 0,
      departmentType: "",
      isActive: 1,
    },
  });

  useEffect(() => {
    reset({
      departmentId: data?.departmentId ?? 0,
      department: data?.department ?? "",
      isActive: data?.isActive ?? 1,
      departmentTypeId: data?.departmentTypeId ?? 0,
      departmentType: data?.departmentType ?? "",
    });
    const selected = departmentTypeList?.find(
      (d: PickMasterItem) => Number(d?.key) === Number(data?.departmentTypeId)
    );
  }, [data, isOpen, departmentTypeList]);

  useScrollLock(isOpen);

  const departmentTypeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;

    const selectedType = departmentTypeList.find(d => d.key === selectedKey);

    if (!selectedType) return;

    setValue("departmentTypeId", selectedType.key, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("departmentType", selectedType.value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // sub category submit handler
  const onSubmit = async (formData: createUpdateDoctorDepartmentFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_DEPARTMENT,
      formData,
      {},
      { component: "CreateUpdatePopup" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to update category");
      return;
    }
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    if (resp?.data) {
      const dataObj = Array.isArray(resp.data) ? resp.data[0] : resp.data;
      if (dataObj?.departmentId) {
        resetDepartmentId?.(Number(dataObj.departmentId));
        resetData?.(dataObj);
      }
    }
    await refreshDepartment?.();
    setTimeout(() => {
      reset({
        departmentId: 0,
        department: "",
        departmentTypeId: 0,
        departmentType: "",
        isActive: 1,
      });
      onClose();
    }, 500);
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      departmentId: 0,
      department: "",
      departmentTypeId: 0,
      departmentType: "",
      isActive: 1,
    });
  };
  return (
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">{buttonTitle} Department</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {errorMessage ? <ErrorMessage text={errorMessage} /> : <></>}
        {successMessage ? <SuccessMessage text={successMessage} /> : <></>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-1">
            <InputField label="Department" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter department name"
                {...register("department")}
              />
              {errors.department && (
                <p className="input-field-error">{errors.department.message}</p>
              )}
            </InputField>

            <InputField label="Department Type" required>
              <select
                className="input-field"
                {...register("departmentTypeId")}
                onChange={departmentTypeChangeHandler}
              >
                {departmentTypeList?.map(d => (
                  <option key={d?.key} value={d?.key}>
                    {d?.value}
                  </option>
                ))}
              </select>
              {errors.departmentTypeId && (
                <p className="input-field-error">{errors.departmentTypeId.message}</p>
              )}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field " {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default DoctorDepartmentPopup;
