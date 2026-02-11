import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { doctorDepartmentSchema } from "@/validation/doctorMasterPopup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DepartmentPopupProps } from "../types";

const DepartmentPopup = ({
  isOpen,
  onClose,
  departmentId,
  refreshDepartment,
}: DepartmentPopupProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const dType = usePickMaster("DoctorDepartmentType");

  const departmentTypeList = dType?.pickMasterValue ?? [];

  const [successMessage, setSuccessMessage] = useState<string>("");

  const buttonTitle = departmentId ? "Update" : "Create";

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
      departmentTypeId: "",
      departmentType: "",
      isActive: 1,
    },
  });

  /*------------------department by id---------------------- */

  const getDepartmentById = async (id: number) => {
    if (!id) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST,
      {},
      { params: { departmentId: id, isActive: Status.ACTIVE } },
      { component: "DepartmentPopup" }
    );

    const dept = resp?.data?.[0];
    if (!dept) return;

    reset({
      departmentId: dept?.departmentId,
      department: dept?.department,
      departmentTypeId: dept?.departmentTypeId,
      departmentType: dept?.departmentType,
      isActive: dept?.isActive,
    });
  };

  useEffect(() => {
    if (departmentId) getDepartmentById(departmentId);
  }, [departmentId]);

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

  const onSubmit = async (data: any) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_DEPARTMENT,
      data,
      {},
      { component: "DepartmentPopup" }
    );

    if (!resp) return;

    if (resp?.result) {
      setSuccessMessage(resp?.message);
      await refreshDepartment?.();
      setTimeout(() => {
        onClose?.();
      }, 1000);
    }
  };

  return (
    <>
      <div className={`popup-bg-overlay ${isOpen ? "opacity-100 visible" : ""}`} />

      <div className={`central-popup ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">{buttonTitle} Department</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {error ? <ErrorMessage text={error?.message} /> : <></>}
        {successMessage ? <SuccessMessage text={successMessage} /> : <></>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("departmentType")} />
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

            <InputField label="Department Type" className="mt-3" required>
              <select
                className="input-field"
                {...register("departmentTypeId")}
                onChange={departmentTypeChangeHandler}
              >
                <option value="">Select</option>
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

            <InputField label="Status" className="mt-3" required>
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
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </>
  );
};

export default DepartmentPopup;
