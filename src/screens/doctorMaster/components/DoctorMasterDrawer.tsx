import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { toInputDate } from "@/utils/dateConvertHandler";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { SelectStyles } from "../../../components/customSelect";
import MultiCheckboxOption from "../../../components/multiSelectCheckBox";
import { ENDPOINTS } from "../../../config/defaults";
import useGetBranchList from "../../../hooks/useGetBranchList";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { usePickMaster } from "../../../hooks/usePickMaster";
import { handleMultiSelectWithAll } from "../../../utils/multiSelectAllHandler";
import doctorMasterSchema from "../../../validation/doctorMasterSchema";
import {
  DepartmentItem,
  DoctorMasterDrawerProps,
  GenderItem,
  SelectItem,
  SpecializationItem,
  TitleItem,
} from "../types";
import DepartmentPopup from "./DepartmentPopup";
import SpecializationPopup from "./SpecializationPopup";

const DoctorMasterDrawer = ({
  isOpen,
  onClose,
  buttonTitle,
  drawerTitle,
  doctorId,
  onCloseDrawer,
}: DoctorMasterDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const titleLists = usePickMaster("title");

  const titleSelectOption = useMemo(() => titleLists?.pickMasterValue ?? [], [titleLists]);

  const genderLists = usePickMaster("gender");

  const genderSelectOption = useMemo(() => genderLists?.pickMasterValue ?? [], [genderLists]);

  const [branchIds, setBranchIds] = useState<number[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<SelectItem[]>([]);

  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([]);
  const [specializationList, setSpecializationList] = useState<SpecializationItem[]>([]);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const [selectedDepartment, setSelectedDepartment] = useState<SelectItem | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<SelectItem | null>(null);

  const [popupType, setPopupType] = useState<"specialization" | "department" | null>(null);

  const [checked, setChecked] = useState<boolean>(false);
  const [disabled, setDisabled] = useState(false);
  const [defaultTitle, setDefaultTitle] = useState();

  const today = new Date().toISOString().split("T")[0];

  /*--------------------------doctor master form------------------ */
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(doctorMasterSchema),
    defaultValues: {
      DoctorId: 0,
      Title: "",
      Name: "",
      Gender: "",
      Dob: "",
      ContactNo: "",
      EmailId: "",
      Address: "",
      SpecializationId: 0,
      Specialization: "",
      DepartmentId: 0,
      Department: "",
      ProfileSummery: "",
      RegistrationNo: "",
      IsActive: 1,
      BranchList: "",
      RoomNo: "",
      CanApproveLabReport: 0,
      CanApproveDischargeSummary: 0,
      DoctorPhotoFile: "",
      IsLogin: 0,
      UserName: "",
      Password: "",
      ConfirmPassword: "",
    },
  });

  /*---------------------branches------------------------ */
  const getBranches = useGetBranchList();
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

    setValue("BranchList", result.selectedIds.join(","), {
      shouldValidate: true,
      shouldDirty: true,
    });

    clearErrors("BranchList");
  };

  /*-------------------------------specialization------------------- */
  const getSpecializationLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_SPECIALIZATION_LIST,
      {},
      {},
      { component: "DoctorMasterDrawer", silent: true }
    );

    const data = resp?.data ?? [];
    setSpecializationList(data);
  };

  const specializationSelectOption = useMemo(() => {
    return specializationList.map(item => ({
      value: item?.specializationId,
      label: item?.specialization,
    }));
  }, [specializationList]);

  const selectSpecializationHandler = (option: SelectItem | null) => {
    setSelectedSpecialization(option);
    setValue("SpecializationId", option?.value ?? 0, {
      shouldValidate: true,
    });
    setValue("Specialization", option?.label ?? "", {
      shouldValidate: true,
    });
  };

  /*------------------------------department--------------------------- */
  const getDepartmentLists = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST, {}, {});
    const data = resp?.data ?? [];
    setDepartmentList(data);
  };

  const departmentSelectOption = useMemo(() => {
    return departmentList.map(item => ({
      value: item?.departmentId,
      label: item?.department,
    }));
  }, [departmentList]);

  const selectDepartmentHandler = (option: SelectItem | null) => {
    setSelectedDepartment(option);
    setValue("DepartmentId", option?.value ?? 0, {
      shouldValidate: true,
    });
    setValue("Department", option?.label ?? "", {
      shouldValidate: true,
    });
  };

  useEffect(() => {
    getDepartmentLists();
    getSpecializationLists();
  }, []);

  /*------------------ title ------------------ */
  useEffect(() => {
    if (!titleSelectOption.length) return;

    const dt = titleSelectOption.find((item: TitleItem) => item?.value?.includes("Dr"));
    if (dt) {
      setDefaultTitle(dt?.value);
      setValue("Title", dt?.value);
    }
  }, [titleSelectOption, setValue]);

  const handleLoginToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    setChecked(checked);
    setValue("IsLogin", checked ? 1 : 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /*------------------------checks for contact number---------------- */
  const contact = watch("ContactNo");

  useEffect(() => {
    if (contact && /^\d+$/.test(contact)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [contact]);

  /*-----------------------------submit handler--------------- */
  const onsubmit = async (rawData: any) => {
    const formData = new FormData();

    formData.append("DoctorId", String(rawData?.DoctorId ?? 0));
    formData.append("Title", rawData?.Title ?? "");
    formData.append("Name", rawData?.Name?.trim() ?? "");
    formData.append("Gender", rawData?.Gender ?? "");
    formData.append("Dob", rawData?.Dob ?? "");
    formData.append("ContactNo", rawData?.ContactNo ?? "");
    formData.append("EmailId", rawData?.EmailId ?? "");
    formData.append("Address", rawData?.Address ?? "");

    formData.append("SpecializationId", String(rawData?.SpecializationId ?? 0));
    formData.append("Specialization", rawData?.Specialization?.trim() ?? "");

    formData.append("DepartmentId", String(rawData?.DepartmentId ?? 0));
    formData.append("Department", rawData?.Department?.trim() ?? "");

    formData.append("ProfileSummery", rawData?.ProfileSummery ?? "");
    formData.append("RegistrationNo", rawData?.RegistrationNo ?? "");
    formData.append("IsActive", String(rawData?.IsActive ?? 1));

    formData.append("BranchList", rawData?.BranchList ?? "");

    formData.append("RoomNo", rawData?.RoomNo ?? "");
    formData.append("CanApproveLabReport", String(rawData?.CanApproveLabReport ?? 0));
    formData.append("CanApproveDischargeSummary", String(rawData?.CanApproveDischargeSummary ?? 0));

    formData.append("IsLogin", String(rawData?.IsLogin ?? 0));
    formData.append("UserName", rawData?.UserName ?? "");
    formData.append("Password", rawData?.Password ?? "");

    const photoFile = rawData?.DoctorPhotoFile as FileList | null;
    if (photoFile && photoFile.length > 0) {
      formData.append("DoctorPhotoFile", photoFile[0]);
    }

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_MASTER,
      formData,
      {},
      { component: "DoctorMasterTab" }
    );
    if (!resp) return;

    if (resp) {
      setSuccessMessage(resp?.message);
      onCloseDrawer?.();
      setTimeout(() => {
        onClose?.();
      }, 1000);
    }

    handleCancel();
  };

  /*-----------------------------cancel handler--------------- */
  const handleCancel = () => {
    reset();
    setSelectedBranches([]);
    setSelectedDepartment(null);
    setSelectedSpecialization(null);
    setChecked(false);

    if (defaultTitle) {
      setValue("Title", defaultTitle);
    }
  };

  const fetchDoctorMaster = async (doctorId: number) => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_DOCTOR_MASTER, {}, { params: { doctorId } });

    const doctor = resp?.data?.[0];
    if (!doctor) return;

    reset({
      DoctorId: doctor?.doctorId,
      Title: doctor?.title,
      Name: doctor?.name,
      Gender: doctor?.gender,
      Dob: toInputDate(doctor?.dob),
      ContactNo: doctor?.contactNo,
      EmailId: doctor?.emailId,
      Address: doctor?.address,
      SpecializationId: doctor?.specializationId,
      Specialization: doctor?.specialization,
      DepartmentId: doctor?.departmentId,
      Department: doctor?.department,
      ProfileSummery: doctor?.profileSummery,
      RegistrationNo: doctor?.registrationNo,
      IsActive: doctor?.isActive,
      BranchList: doctor?.branchId,
      RoomNo: doctor?.roomNo,
      CanApproveLabReport: doctor?.canApproveLabReport,
      CanApproveDischargeSummary: doctor?.canApproveDischargeSummary,
      IsLogin: doctor?.isLogin,
      UserName: doctor?.userName,
      Password: doctor?.password,
      ConfirmPassword: doctor?.password,
    });
  };

  useEffect(() => {
    const specId = watch("SpecializationId");
    const deptId = watch("DepartmentId");

    if (specializationList.length) {
      const spec = specializationList.find(s => s.specializationId === specId);

      setSelectedSpecialization(
        spec ? { value: spec.specializationId, label: spec.specialization } : null
      );
    }

    if (departmentList.length) {
      const dept = departmentList.find(d => d.departmentId === deptId);

      setSelectedDepartment(dept ? { value: dept.departmentId, label: dept.department } : null);
    }
  }, [specializationList, departmentList]);

  useEffect(() => {
    const branchListValue = watch("BranchList");
    if (!branchListValue || !branchOptions.length) return;

    const ids = branchListValue
      .split(",")
      .map((id: string) => Number(id))
      .filter(Boolean);

    const selected = branchOptions.filter(opt => ids.includes(opt.value));

    setSelectedBranches(selected);
    setBranchIds(ids);
  }, [branchOptions]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorMaster(doctorId);
    }

    if (!doctorId) {
      reset({
        DoctorId: 0,
        Title: "",
        Name: "",
        Gender: "",
        Dob: "",
        ContactNo: "",
        EmailId: "",
        Address: "",
        SpecializationId: 0,
        Specialization: "",
        DepartmentId: 0,
        Department: "",
        ProfileSummery: "",
        RegistrationNo: "",
        IsActive: 1,
        BranchList: "",
        RoomNo: "",
        CanApproveLabReport: 0,
        CanApproveDischargeSummary: 0,
        DoctorPhotoFile: "",
        IsLogin: 0,
        UserName: "",
        Password: "",
        ConfirmPassword: "",
      });

      setChecked(false);
    }
  }, [doctorId, reset]);

  const popupHandler = (type: "specialization" | "department") => {
    setPopupType(type);
  };

  const renderPopup = () => {
    if (!popupType) return null;

    if (popupType === "specialization") {
      return (
        <SpecializationPopup
          isOpen
          onClose={() => setPopupType(null)}
          specializationId={selectedSpecialization?.value}
          refreshSpec={getSpecializationLists}
        />
      );
    }

    if (popupType === "department") {
      return (
        <DepartmentPopup
          isOpen
          onClose={() => setPopupType(null)}
          departmentId={selectedDepartment?.value}
          refreshDepartment={getDepartmentLists}
        />
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-999">
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
          onClick={onClose}
        />

        <div
          className={`drawer-layout lg:min-w-[1000px] drawer-bg ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="drawer-title-border">
            <h2 className="drawer-title">{drawerTitle}</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          {successMessage ? <SuccessMessage text={successMessage} /> : <></>}
          {error ? <ErrorMessage text={error?.message} /> : <></>}

          <div className="p-2">
            <form onSubmit={handleSubmit(onsubmit)}>
              <input type="hidden" {...register("IsLogin")} />
              <input type="hidden" {...register("SpecializationId")} />
              <input type="hidden" {...register("DepartmentId")} />
              <input type="hidden" {...register("Specialization")} />
              <input type="hidden" {...register("Department")} />
              <input type="hidden" {...register("BranchList")} />
              <div className="card">
                <h2 className="card-title ">Doctor Details</h2>
                <div className="form-grid-3">
                  <InputField label="Title" required>
                    <select className="input-field" {...register("Title")}>
                      <option value="">Select</option>
                      {titleSelectOption.map((item: TitleItem) => (
                        <option key={item?.value} value={item?.value}>
                          {item.value}
                        </option>
                      ))}
                    </select>
                    {errors.Title && <p className="input-field-error">{errors.Title.message}</p>}
                  </InputField>

                  <InputField label="Doctor Name" required>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter Doctor Name.."
                      {...register("Name")}
                    />
                    {errors.Name && <p className="input-field-error">{errors.Name.message}</p>}
                  </InputField>

                  <InputField label="Gender" required>
                    <select className="input-field" {...register("Gender")}>
                      <option value="">Select</option>
                      {genderSelectOption?.map((i: GenderItem) => (
                        <option key={i?.key} value={i?.value}>
                          {i?.value}
                        </option>
                      ))}
                    </select>
                    {errors.Gender && <p className="input-field-error">{errors.Gender.message}</p>}
                  </InputField>

                  <InputField label="Contact No." required>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter Contact No.."
                      value={contact || ""}
                      {...register("ContactNo")}
                      onChange={e => {
                        const value = e.target.value;

                        // allow only digits (max 10)
                        if (/^\d{0,10}$/.test(value)) {
                          setValue("ContactNo", value, { shouldValidate: true });
                        }
                      }}
                    />
                    {errors.ContactNo && (
                      <p className="input-field-error">{errors.ContactNo.message}</p>
                    )}
                  </InputField>

                  <InputField label="Email">
                    <input
                      type="email"
                      className="input-field"
                      placeholder="Enter Email.."
                      {...register("EmailId")}
                    />
                  </InputField>

                  <InputField label="Address">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter Address.."
                      {...register("Address")}
                    />
                  </InputField>

                  <InputField label="DOB" required>
                    <input
                      type="date"
                      {...register("Dob")}
                      className="input-field input-dob"
                      min="1900-01-01"
                      max={today}
                    />
                    {errors.Dob && <p className="input-field-error">{errors.Dob.message}</p>}
                  </InputField>

                  <InputField label="Specialization" required>
                    <div className="flex gap-2 items-center">
                      <Select
                        options={specializationSelectOption}
                        value={selectedSpecialization}
                        placeholder="Select..."
                        isSearchable
                        isClearable
                        onChange={(option: any) => selectSpecializationHandler(option)}
                        styles={SelectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                      <button
                        type="button"
                        className="active:scale-95"
                        onClick={() => popupHandler("specialization")}
                      >
                        <i className="fa-solid fa-circle-plus fa-xl"></i>
                      </button>
                    </div>
                    {errors.SpecializationId && (
                      <p className="input-field-error">{errors.SpecializationId.message}</p>
                    )}
                  </InputField>

                  <InputField label="Department" required>
                    <div className="flex gap-2 items-center">
                      <Select
                        options={departmentSelectOption}
                        value={selectedDepartment}
                        placeholder="Select..."
                        isSearchable
                        isClearable
                        onChange={(option: any) => selectDepartmentHandler(option)}
                        styles={SelectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                      <button
                        type="button"
                        className="active:scale-95"
                        onClick={() => popupHandler("department")}
                      >
                        <i className="fa-solid fa-circle-plus fa-xl"></i>
                      </button>
                    </div>
                    {errors.DepartmentId && (
                      <p className="input-field-error">{errors.DepartmentId.message}</p>
                    )}
                  </InputField>

                  <InputField label="Profile Summary" required>
                    <input
                      className="input-field"
                      placeholder="Enter Profile Summary.."
                      {...register("ProfileSummery")}
                    />
                    {errors.ProfileSummery && (
                      <p className="input-field-error">{errors.ProfileSummery.message}</p>
                    )}
                  </InputField>

                  <InputField label="Registration No.">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter Registration No.."
                      {...register("RegistrationNo")}
                    />
                  </InputField>

                  <InputField label="Status" required>
                    <select className="input-field" {...register("IsActive")}>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                    {errors.IsActive && (
                      <p className="input-field-error">{errors.IsActive.message}</p>
                    )}
                  </InputField>

                  <InputField label="OPD Room">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter OPD Room No.."
                      {...register("RoomNo")}
                    />
                  </InputField>

                  <InputField label="Can Approve Lab Reports">
                    <select className="input-field" {...register("CanApproveLabReport")}>
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </InputField>

                  <InputField label="Can Approve Discharge Summary">
                    <select className="input-field" {...register("CanApproveDischargeSummary")}>
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </InputField>

                  <InputField label="Upload Doctor Photo" {...register("DoctorPhotoFile")}>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      {...register("DoctorPhotoFile")}
                      className="file-upload"
                    />
                  </InputField>

                  <InputField label="Branches" required>
                    <Select
                      isMulti
                      value={selectedBranches}
                      options={branchOptions}
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      onChange={branchChangeHandler}
                      components={{ Option: MultiCheckboxOption }}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                    />

                    {errors.BranchList && (
                      <p className="input-field-error">{errors.BranchList.message}</p>
                    )}
                  </InputField>
                </div>
              </div>

              <div className="card">
                <div className="flex gap-4">
                  <h2 className="card-title ">Create Login</h2>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-500"
                    onChange={handleLoginToggle}
                  />
                </div>
                <div className="form-grid-3">
                  <InputField label="User Name" required>
                    <input
                      type="text"
                      placeholder="Enter User Name"
                      disabled={!checked}
                      className={` input-field disabled-input-field `}
                      {...register("UserName")}
                    />
                    {errors.UserName && (
                      <p className="input-field-error">{errors.UserName.message}</p>
                    )}
                  </InputField>

                  <InputField label="Password" required>
                    <input
                      type="password"
                      placeholder="Enter Password"
                      className={` input-field disabled-input-field `}
                      disabled={!checked}
                      {...register("Password")}
                    />
                    {errors.Password && (
                      <p className="input-field-error">{errors.Password.message}</p>
                    )}
                  </InputField>

                  <InputField label="Confirm Password" required>
                    <input
                      type="password"
                      placeholder="Enter Confirm Password"
                      className={` input-field disabled-input-field `}
                      disabled={!checked}
                      {...register("ConfirmPassword")}
                    />
                    {errors.ConfirmPassword && (
                      <p className="input-field-error">{errors.ConfirmPassword.message}</p>
                    )}
                  </InputField>
                </div>
                <div className="form-actions-responsive mt-5">
                  <button type="submit" className="save-btn">
                    {buttonTitle}
                  </button>
                  <button type="button" className="cancel-button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
            {loading ? <CustomLoader isLoading={loading} /> : <></>}
          </div>
        </div>
      </div>
      {renderPopup()}
    </div>
  );
};

export default DoctorMasterDrawer;
