import { ChangeEvent, useEffect, useMemo, useState } from "react";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { usePickMaster } from "../../../hooks/usePickMaster";
import { DepartmentItem, SpecializationItem } from "../types";

interface DoctorMasterPopupProps {
  isOpenTab: boolean;
  headerName: string;
  onCloseTab: () => void;
  type: "department" | "specialization";
  data: DepartmentItem | SpecializationItem | null;
  onSuccess?: () => void;
}

const DoctorMasterPopup = ({
  isOpenTab,
  headerName,
  onCloseTab,
  type,
  data,
  onSuccess,
}: DoctorMasterPopupProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departmentType = usePickMaster({ fieldName: "DoctorDepartmentType" });
  const doctorDepartmentType = useMemo(() => {
    const val: any = departmentType?.pickMasterValue;
    return Array.isArray(val) ? val : [];
  }, [departmentType]);

  console.log("doctorDepartmentType", doctorDepartmentType);

  const [formData, setFormData] = useState({
    departmentId: 0,
    department: "",
    departmentTypeId: 0,
    departmentType: "",
    isActive: "",
  });

  const [specializationFormData, setSpecializationFormData] = useState({
    specializationId: 0,
    specialization: "",
    isActive: "",
  });

  useEffect(() => {
    // Prefill on update, reset on create or close
    if (type === "department") {
      if (data) {
        const d = data as DepartmentItem;
        setFormData({
          departmentId: d?.departmentId || 0,
          department: d?.department || "",
          departmentTypeId: d?.departmentTypeId || 0,
          departmentType: d?.departmentType || "",
          isActive: d.isActive?.toString() || "",
        });
      } else {
        setFormData({
          departmentId: 0,
          department: "",
          departmentTypeId: 0,
          departmentType: "",
          isActive: "",
        });
      }
    } else {
      if (data) {
        const s = data as SpecializationItem;
        setSpecializationFormData({
          specializationId: s?.specializationId || 0,
          specialization: s?.specialization || "",
          isActive: s?.isActive?.toString() || "",
        });
      } else {
        setSpecializationFormData({ specializationId: 0, specialization: "", isActive: "" });
      }
    }
  }, [data, isOpenTab, type]);

  useEffect(() => {
    if (error) setErrorMessage(error);
  }, [error]);

  const inputHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (type === "department") {
      if (name === "departmentTypeId") {
        const id = Number(value) || 0;
        const selected = doctorDepartmentType?.find((it: any) => it.id === id);
        setFormData(prev => ({
          ...prev,
          departmentTypeId: id,
          departmentType: selected?.name || "",
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setSpecializationFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    if (type === "department") {
      const isNameValid = formData.department.trim() !== "";
      const isDeptTypeValid = Number(formData.departmentTypeId) > 0;
      const isStatusValid = formData.isActive !== "";
      if (!isNameValid || !isDeptTypeValid || !isStatusValid) return;

      try {
        const payload = {
          departmentId: formData?.departmentId || 0,
          department: formData?.department.trim(),
          departmentTypeId: Number(formData?.departmentTypeId) || 0,
          departmentType: formData?.departmentType || "",
          isActive: Number(formData?.isActive),
        };

        const resp = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_DOCTOR_DEPARTMENT, payload);
        if (resp) {
          setSuccessMessage(resp?.message || "Saved successfully");
          setTimeout(() => {
            onSuccess?.();
            onCloseTab();
          }, 900);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const isNameValid = specializationFormData.specialization.trim() !== "";
      const isStatusValid = specializationFormData.isActive !== "";
      if (!isNameValid || !isStatusValid) return;

      try {
        const payload = {
          specializationId: specializationFormData.specializationId || 0,
          specialization: specializationFormData.specialization.trim(),
          isActive: Number(specializationFormData.isActive),
        };

        const resp = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_DOCTOR_SPECIALIZATION, payload);
        if (resp) {
          setSuccessMessage(resp?.message || "Saved successfully");
          setTimeout(() => {
            onSuccess?.();
            onCloseTab();
          }, 900);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpenTab) return null;

  return (
    <>
      <div className="drawer-bg-overlay opacity-100 visible" onClick={onCloseTab} />

      <div className="central-drawer opacity-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{headerName}</h2>
          <button
            onClick={onCloseTab}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {errorMessage && <ErrorMessage text={errorMessage} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "department" ? (
            <>
              <InputField label="Department Name" required>
                <input
                  type="text"
                  name="department"
                  className="input-field w-full"
                  value={formData.department}
                  onChange={inputHandler}
                />
                {formData.department.trim() === "" && !!isSubmitting && (
                  <p className="input-field-error">Department Name is required</p>
                )}
              </InputField>

              <InputField label="Department Type" required>
                <select
                  name="departmentTypeId"
                  className="input-field w-full"
                  value={formData.departmentTypeId || ""}
                  onChange={inputHandler}
                >
                  <option value="">Select</option>
                  {doctorDepartmentType?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {Number(formData.departmentTypeId) === 0 && !!isSubmitting && (
                  <p className="input-field-error">Department Type is required</p>
                )}
              </InputField>
            </>
          ) : (
            <InputField label="Specialization Name" required>
              <input
                type="text"
                name="specialization"
                className="input-field w-full"
                value={specializationFormData.specialization}
                onChange={inputHandler}
              />
              {specializationFormData.specialization.trim() === "" && !!isSubmitting && (
                <p className="input-field-error">Specialization Name is required</p>
              )}
            </InputField>
          )}

          <InputField label="Status" required>
            <select
              name="isActive"
              className="input-field w-full"
              value={
                type === "department"
                  ? formData.isActive || ""
                  : specializationFormData.isActive || ""
              }
              onChange={inputHandler}
            >
              <option value="">Select</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
            {(type === "department"
              ? formData.isActive === ""
              : specializationFormData.isActive === "") &&
              !!isSubmitting && <p className="input-field-error">Status is required</p>}
          </InputField>

          <div className="flex gap-3 mt-6">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (data ? "Updating..." : "Saving...") : data ? "Update" : "Save"}
            </button>
            <button type="button" className="cancel-btn" onClick={onCloseTab} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </>
  );
};

export default DoctorMasterPopup;
