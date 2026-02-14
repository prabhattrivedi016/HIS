import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import { useScrollLock } from "@/hooks/useScrollLock";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { SelectStyles } from "../../../components/customSelect";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { Status } from "../../../constants/constants";
import useGetBranchList from "../../../hooks/useGetBranchList";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { handleMultiSelectWithAll } from "../../../utils/multiSelectAllHandler";
import doctorUnitSchema from "../../../validation/doctorUnitSchema";
import {
  DepartmentItem,
  DoctorMasterItem,
  DoctorUnitMappingItem,
  DoctorUnitMasterProps,
  SelectItem,
  SpecializationItem,
} from "../types";

const UnitMasterDrawer = ({ isOpen, onClose }: DoctorUnitMasterProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const getBranches = useGetBranchList();

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(doctorUnitSchema),
    defaultValues: {
      doctorId: 0,
      name: "",
      specializationId: 0,
      specialization: "",
      departmentId: 0,
      department: "",
      isActive: 1,
      branchId: "",
      doctorMappings: [],
    },
  });
  useScrollLock(isOpen);

  const [unitNameList, setUnitNameList] = useState<DoctorMasterItem[]>([]);

  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);

  const [multiSelectDoctorList, setMultiSelectDoctorList] = useState<DoctorMasterItem[]>([]);

  const [specializationList, setSpecializationList] = useState<SpecializationItem[]>([]);
  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([]);

  const [selectedBranches, setSelectedBranches] = useState<SelectItem[]>([]);
  const [branchIds, setBranchIds] = useState<number[]>([]);

  const [selectedDoctors, setSelectedDoctors] = useState<SelectItem[]>([]);
  const [doctorsIds, setDoctorIds] = useState<number[]>([]);

  const [departmentId, setDepartmentId] = useState<number | null>(null);

  const [selectedSpecialization, setSelectedSpecialization] = useState<SelectItem | null>(null);

  const [selectedDepartment, setSelectedDepartment] = useState<SelectItem | null>(null);
  const [doctorDepartmentId, setDoctorDepartmentId] = useState<number | null | undefined>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const buttonTitle = editingUnitId ? "Update" : "Create";
  const drawerTitle = editingUnitId ? "Update Doctor Unit Master" : "Create Doctor Unit Master";

  /*-------------------unit Name list---------------------- */

  const doctorListForUnitMaster = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      {
        params: { isDoctorUnit: Status?.ACTIVE },
      },
      { component: "UnitMasterDrawer", silent: true }
    );
    setUnitNameList(resp?.data ?? []);
  };

  const unitChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    if (!value) {
      setDepartmentId(null);
      return;
    }

    doctorUnitEditHandler(value);
  };

  const getDoctorMappingValue = async (unitId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_UNIT_MAPPING,
      {},
      { params: { unitId } },
      { component: "UnitMasterDrawer" }
    );

    return resp?.data ?? [];
  };

  /*-----------------------unit name form handler--------------- */
  const doctorUnitEditHandler = async (departmentId: number) => {
    if (!departmentId) {
      return;
    } else {
      const editValue = unitNameList.find(u => u.departmentId === departmentId);

      if (!editValue) return;

      reset({
        doctorId: editValue?.doctorId,
        name: editValue?.name,
        specializationId: editValue?.specializationId,
        specialization: editValue?.specialization,
        departmentId: editValue?.departmentId,
        department: editValue?.department,
        isActive: editValue?.isActive,
        branchId: editValue?.branchId,
      });

      setSelectedSpecialization({
        label: editValue?.specialization,
        value: editValue?.specializationId,
      });

      setSelectedDepartment({
        label: editValue?.department,
        value: editValue?.departmentId,
      });

      if (editValue?.branchId) {
        const ids = editValue?.branchId.split(",").map(Number);
        const selected = branchOptions.filter(b => ids?.includes(b?.value));
        setSelectedBranches(selected);
      }

      if (editValue?.doctorId) {
        setEditingUnitId(editValue.doctorId);
      }

      getUnitDoctorList(editValue?.departmentId);
    }
  };

  useEffect(() => {
    const loadMapping = async () => {
      if (!editingUnitId) return;

      const doctorsValue = await getDoctorMappingValue(editingUnitId);

      const mappedDoctorIds = doctorsValue.map((item: DoctorUnitMappingItem) => item.doctorId);

      const matchedOptions = multiSelectDoctorOption.filter(option =>
        mappedDoctorIds.includes(option.value)
      );

      setSelectedDoctors(matchedOptions);
      setDoctorIds(mappedDoctorIds);

      setValue(
        "doctorMappings",
        mappedDoctorIds.map((id: number) => ({ doctorId: id })),
        { shouldValidate: true }
      );
    };

    loadMapping();
  }, [editingUnitId, multiSelectDoctorList]);

  /*-----------------------------specialization select--------------------- */
  const getSpecialization = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_SPECIALIZATION_LIST,
      {},
      {},
      { component: "UnitMasterDrawer", silent: true }
    );
    setSpecializationList(resp?.data ?? []);
  };

  const specializationOption = useMemo(() => {
    return specializationList?.map(s => ({
      label: s?.specialization,
      value: s?.specializationId,
    }));
  }, [specializationList]);

  const specializationSelectHandler = (option: SelectItem | null) => {
    setSelectedSpecialization(option);

    setValue("specializationId", option?.value ?? 0, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("specialization", option?.label ?? "");

    clearErrors("specializationId");
  };

  /*-----------------------------department select--------------------- */

  const getDepartment = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST,
      {},
      {},
      { component: "UnitMasterDrawer", silent: true }
    );
    setDepartmentList(resp?.data ?? []);
  };

  const departmentOption = useMemo(() => {
    return departmentList?.map(d => ({
      label: d?.department,
      value: d?.departmentId,
    }));
  }, [departmentList]);

  const departmentSelectHandler = (option: SelectItem | null) => {
    setSelectedDepartment(option);
    setDoctorDepartmentId(option?.value);

    setValue("departmentId", option?.value ?? 0, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("department", option?.label ?? "");

    clearErrors("departmentId");
  };

  /*---------------------branches------------------------ */
  const branchList = useMemo(() => getBranches?.branchList?.data ?? [], [getBranches]);

  const branchOptions = useMemo<readonly SelectItem[]>(() => {
    return [
      { label: "All", value: 0 },
      ...branchList.map(b => ({
        label: b?.branchName,
        value: b?.branchId,
      })),
    ];
  }, [branchList]);

  const branchChangeHandler = (options: readonly SelectItem[] | null) => {
    const result = handleMultiSelectWithAll(options, selectedBranches, branchOptions);

    setSelectedBranches(result.selectedOptions);
    setBranchIds(result.selectedIds);

    setValue("branchId", result.selectedIds.join(","), {
      shouldValidate: true,
      shouldDirty: true,
    });

    clearErrors("branchId");
  };

  useEffect(() => {
    doctorListForUnitMaster();
    getSpecialization();
    getDepartment();
  }, []);

  /*------------------unit doctor submit handler for multi select------------------------- */

  const getUnitDoctorList = useCallback(
    async (departmentId: number | null | undefined) => {
      if (!departmentId) return;

      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_DOCTOR_MASTER,
        {},
        { params: { isDoctorUnit: Status?.INACTIVE, isActive: Status?.ACTIVE, departmentId } },
        { component: "UnitMasterDrawer" }
      );

      setMultiSelectDoctorList(resp?.data ?? []);
    },
    [departmentId]
  );

  const multiSelectDoctorOption = useMemo<readonly SelectItem[]>(() => {
    if (!multiSelectDoctorList || multiSelectDoctorList?.length === 0) {
      return [];
    }
    return [
      { label: "All", value: 0 },
      ...multiSelectDoctorList.map(d => ({
        label: d?.name,
        value: d?.doctorId,
      })),
    ];
  }, [multiSelectDoctorList]);

  const multiDoctorChangeHandler = (options: readonly SelectItem[] | null) => {
    const result = handleMultiSelectWithAll(options, selectedDoctors, multiSelectDoctorOption);

    setSelectedDoctors(result.selectedOptions);
    setDoctorIds(result.selectedIds);

    setValue(
      "doctorMappings",
      result.selectedIds.map(id => ({ doctorId: id })),
      { shouldValidate: true }
    );

    clearErrors("doctorMappings");
  };

  useEffect(() => {
    getUnitDoctorList(doctorDepartmentId);
  }, [doctorDepartmentId]);

  /*-----------------submit handler------------------------ */
  const onSubmit = async (formData: any) => {
    const payload = {
      doctorId: formData?.doctorId ?? 0,
      name: formData?.name,
      specializationId: Number(formData?.specializationId),
      specialization: formData?.specialization,
      departmentId: Number(formData?.departmentId),
      department: formData?.department,
      isActive: Number(formData?.isActive),
      branchId: formData?.branchId,
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_UNIT_MASTER,
      payload,
      {},
      { component: "UnitMasterDrawer" }
    );

    if (!resp?.result) return;

    const mappingPayload = {
      unitId: resp?.data?.unitId ?? departmentId ?? 0,
      doctorMappings: formData?.doctorMappings ?? [],
    };

    const mappingResp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_UNIT_MAPPING,
      mappingPayload,
      {},
      { component: "UnitMasterDrawer" }
    );

    setSuccessMessage(mappingResp?.message ?? "Saved Successfully");

    reset({
      doctorId: 0,
      name: "",
      specializationId: 0,
      specialization: "",
      departmentId: 0,
      department: "",
      isActive: 1,
      branchId: "",
      doctorMappings: [],
    });

    setSelectedBranches([]);
    setSelectedDepartment(null);
    setSelectedSpecialization(null);
    setSelectedDoctors([]);
    setDoctorIds([]);
    setDepartmentId(null);

    setTimeout(() => {
      doctorListForUnitMaster();
      setSuccessMessage("");
      onClose?.();
    }, 1000);
  };

  /*---------------------cancel handler------------------ */
  const cancelHandler = () => {
    reset({
      doctorId: 0,
      name: "",
      specializationId: 0,
      specialization: "",
      departmentId: 0,
      department: "",
      isActive: 1,
      branchId: "",
    });

    setSelectedBranches([]);
    setSelectedDepartment(null);
    setSelectedSpecialization(null);
    setSelectedDoctors([]);
    setDoctorIds([]);
    setDepartmentId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 ">
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
          onClick={onClose}
        />

        <div
          className={`drawer-layout  drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="drawer-title-border">
            <h2 className="drawer-title">{drawerTitle}</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          <div className="card m-2">
            <div className=" form-grid-2">
              <InputField label="Unit Name" required>
                <div className="flex gap-2 items-center">
                  <select className="input-field" onChange={unitChangeHandler}>
                    <option value="">Select</option>
                    {unitNameList?.map(d => (
                      <option key={d?.doctorId} value={d?.departmentId}>
                        {d?.completeName}
                      </option>
                    ))}
                  </select>
                </div>
              </InputField>
            </div>
          </div>

          {/* ---------------unit name form---------------- */}
          <div>
            {successMessage && <SuccessMessage text={successMessage} />}
            {error && <ErrorMessage text={error?.message} />}
            <div className="card m-2">
              <h2 className="card-title ">Document Details</h2>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-grid-2 ">
                  <InputField label=" Name" required>
                    <input
                      className="input-field"
                      placeholder="Enter unit name"
                      {...register("name")}
                    />
                  </InputField>

                  <InputField label=" Specialization" required>
                    <Select
                      value={selectedSpecialization}
                      options={specializationOption}
                      placeholder="Select specialization"
                      isSearchable
                      isClearable
                      onChange={(option: any) => specializationSelectHandler(option)}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </InputField>

                  <InputField label=" Department" required>
                    <Select
                      value={selectedDepartment}
                      options={departmentOption}
                      placeholder="Select department"
                      isSearchable
                      isClearable
                      onChange={(option: any) => departmentSelectHandler(option)}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </InputField>

                  <InputField label=" Status" required>
                    <select className="input-field" {...register("isActive")}>
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </InputField>

                  <InputField label="Branches" required>
                    <Select
                      isMulti
                      value={selectedBranches}
                      options={branchOptions}
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      onChange={branchChangeHandler}
                      styles={SelectStyles}
                      components={{ Option: MultiCheckboxOption }}
                      menuPortalTarget={document.body}
                    />

                    {errors.branchId && (
                      <p className="input-field-error">{errors.branchId.message}</p>
                    )}
                  </InputField>

                  <InputField label="Unit Doctor " required>
                    <Select
                      isMulti
                      value={selectedDoctors}
                      options={multiSelectDoctorOption}
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      onChange={multiDoctorChangeHandler}
                      styles={SelectStyles}
                      components={{ Option: MultiCheckboxOption }}
                      menuPortalTarget={document.body}
                    />

                    {errors.doctorMappings && (
                      <p className="input-field-error">{errors.doctorMappings.message}</p>
                    )}
                  </InputField>
                </div>
                <div className="form-actions-responsive mt-5">
                  <button type="submit" className="save-btn">
                    {buttonTitle}
                  </button>
                  <button type="button" className="cancel-button " onClick={cancelHandler}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default UnitMasterDrawer;
