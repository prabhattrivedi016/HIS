import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterPopupName } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useScrollLock } from "@/hooks/useScrollLock";
import { SubCategoryListItem } from "@/screens/labInvestigationMaster/types";
import { PickMasterItem, SelectItem } from "@/types";
import { showWarning } from "@/utils/alert";
import {
  createUpdateServiceMasterFormItem,
  createUpdateServiceMasterSchema,
} from "@/validation/serviceMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import {
  CategoryItem,
  DoctorDepartmentList,
  ServiceTableItem,
  SnomedItem,
  SubCategoryItem,
  SubSubCategoryItem,
} from "../types";
import CreateUpdatePopup from "./CreateUpdatePopup";
import SnomedPopup from "./SnomedPopup";

const parseCsvIds = (value?: string) =>
  (value ?? "")
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => Number.isFinite(v) && v > 0);

const AddServiceMaster = ({
  isOpen,
  onClose,
  data,
  refreshTableData,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: ServiceTableItem | null;
  refreshTableData?: (
    categoryId?: number,
    subCategoryId?: number,
    subSubCategoryId?: number,
    nameFilter?: string
  ) => Promise<void>;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const serviceRoomTypeList = usePickMaster("ServiceRoomType")?.pickMasterValue ?? [];

  const opdConsultationVisitType = usePickMaster("OPDConsultationVisitType")?.pickMasterValue ?? [];

  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popupName, setPopupName] = useState<string>("");

  const [categoryId, setCategoryId] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [categoryTypeId, setCategoryTypeId] = useState<number>(0);

  const [selectSubCategory, setSelectSubCategory] = useState<SubCategoryItem | null>(null);
  const [selectSubCategoryValue, setSelectSubCategoryValue] = useState<SelectItem | null>(null);

  const [selectSubSubCategory, setSelectSubSubCategory] = useState<SubSubCategoryItem | null>(null);
  const [selectSubSubCategoryValue, setSubSelectSubCategoryValue] = useState<SelectItem | null>(
    null
  );

  const [renderSnomedPopup, setRenderSnomedPopup] = useState<boolean>(false);
  const [openSnomedPopup, setOpenSnomedPopup] = useState<boolean>(false);

  const [selectedRoomType, setSelectedRoomType] = useState<PickMasterItem | null>(null);
  const [snomedData, setSnomedData] = useState<SnomedItem | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedDoctorDepartments, setSelectedDoctorDepartments] = useState<SelectItem[]>([]);

  const getDoctorDepartmentList = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST,
      {},
      {},
      { component: "AddServiceMaster", silent: true }
    );
    return resp?.data ?? [];
  }, []);

  const { data: doctorDepartmentList = [] } = useQuery({
    queryKey: ["getDoctorDepartmentList"],
    queryFn: getDoctorDepartmentList,
  });

  const doctorDepartmentOptions = useMemo<readonly SelectItem[]>(
    () =>
      doctorDepartmentList.map((d: DoctorDepartmentList) => ({
        label: d?.department,
        value: d?.departmentId,
      })),
    [doctorDepartmentList]
  );

  // get categoryLists
  const getCategories = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryTypeIds: "8,2,1,4,5,10,9" } },
      { component: "ServiceMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: categoryList = [], refetch } = useQuery({
    queryKey: ["getCategoryList"],
    queryFn: getCategories,
  });

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createUpdateServiceMasterSchema),
    defaultValues: {
      serviceItemId: 0,
      categoryId: 0,
      subCategoryId: 0,
      subSubCategoryId: 0,
      name: "",
      code: "",
      roomTypeId: 0,
      roomType: "",
      isICU: 0,
      gstPer: 0,
      snomedCode: "",
      opdConsultationTypeId: 0,
      opdConsultationType: "",
      isOnlineConsultationAllow: 0,
      isTeleConsultationService: 0,
      isActive: 1,
      isRequiredSeparatePerformingDoctor: 0,
      doctorDepartmentIds: "",
    },
  });

  const isICU = Number(watch("isICU")) === 1;
  const isEdit = Boolean(watch("serviceItemId"));
  const selectedOpdTypeId = watch("opdConsultationTypeId");
  const isRequiredPerformingDoctor = Number(watch("isRequiredSeparatePerformingDoctor")) === 1;

  const buttonTitle = isEdit ? "Update" : "Create";

  //   open popup handler
  const openPopupHandler = (popupName: string) => {
    switch (popupName) {
      case ServiceMasterPopupName?.CATEGORY: {
        setPopupName(ServiceMasterPopupName?.CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }
      case ServiceMasterPopupName?.SUB_CATEGORY: {
        if (!selectedCategory?.categoryId || !categoryId) {
          showWarning("Please select category first!");
          return;
        }
        setPopupName(ServiceMasterPopupName?.SUB_CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }

      case ServiceMasterPopupName?.SUB_SUB_CATEGORY: {
        if (!selectSubCategory?.subCategoryId || !selectSubCategoryValue?.value) {
          showWarning("Please select category & sub category first!");
          return;
        }
        setPopupName(ServiceMasterPopupName?.SUB_SUB_CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }
      case ServiceMasterPopupName?.SNOMED: {
        setOpenSnomedPopup(true);
        setRenderSnomedPopup(true);
        return;
      }
      default:
        return;
    }
  };

  //   close popup handler
  const closePopupHandler = useCallback(() => {
    setOpenPopup(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setRenderPopup(false);
    }, 100);
  }, []);

  // category select handler
  const categorySelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value || value === 0) {
      setCategoryId(0);
      setSelectedCategory(null);
      setSelectSubCategory(null);
      setSelectSubCategoryValue(null);
      setCategoryTypeId(0);
      setValue("categoryId", 0);
      return;
    }
    setCategoryId(value);
    setValue("categoryId", value, { shouldValidate: true });

    const category = categoryList?.find((c: CategoryItem) => c?.categoryId === value);
    setSelectedCategory(category);
    setSelectSubCategoryValue(null);
    setCategoryTypeId(Number(category?.categoryTypeId) ?? 0);
  };

  // sub category
  const getSubCategory = async (id: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      {
        params: {
          categoryIds: id,
        },
      },
      { component: "LabInvestigationMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: subCategoryList = [], refetch: refetchSubCategory } = useQuery({
    queryKey: ["fetchSubCategory", categoryId],
    queryFn: () => getSubCategory(categoryId),
    enabled: categoryId > 0,
  });

  const subCategorySelectOption = useMemo(() => {
    return (
      subCategoryList?.map((d: SubCategoryListItem) => ({
        label: d?.subCategoryName,
        value: d?.subCategoryId,
      })) || []
    );
  }, [subCategoryList]);

  // sub category select handler
  const subCategorySelectHandler = (option: SelectItem) => {
    if (!option) {
      setValue("subCategoryId", 0);
      return;
    }
    setSelectSubCategoryValue(option);
    const selected = subCategoryList?.find(
      (s: SubCategoryItem) => s?.subCategoryId === Number(option?.value)
    );
    setSelectSubCategory(selected);
    setValue("subCategoryId", Number(option.value), { shouldValidate: true });
  };

  // sub sub category

  const getSubSubCategory = async (subCategoryIds: number) => {
    if (!subCategoryIds) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      {
        component: "LabInvestigationMaster",
      }
    );
    return resp?.data ?? [];
  };

  const { data: subSubCategoryList = [], refetch: refetchSubSubCategory } = useQuery({
    queryKey: ["getSubSubCategory", selectSubCategoryValue?.value],
    queryFn: () => getSubSubCategory(Number(selectSubCategoryValue?.value)),
    enabled: selectSubCategoryValue?.value! > 0,
  });

  const subSubCategorySelectOption = useMemo<SelectItem[]>(() => {
    return (
      subSubCategoryList?.map((d: SubSubCategoryItem) => ({
        label: d?.subSubCategoryName,
        value: d?.subSubCategoryId,
      })) || []
    );
  }, [subSubCategoryList]);

  // sub sub category select handler
  const subSubCategorySelectHandler = (option: SelectItem) => {
    if (!option) {
      setSelectSubSubCategory(null);
      setSubSelectSubCategoryValue(null);
      setValue("subSubCategoryId", 0);
      return;
    }

    setSubSelectSubCategoryValue(option);
    setValue("subSubCategoryId", Number(option.value), { shouldValidate: true });

    const selected = subSubCategoryList?.find(
      (s: SubSubCategoryItem) => s?.subSubCategoryId === Number(option?.value)
    );
    setSelectSubSubCategory(selected);
  };

  // room type select handler
  const roomTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setValue("roomType", "");
      setValue("roomTypeId", 0);
      setSelectedRoomType(null);
      return;
    }
    const selectedRoom = serviceRoomTypeList.find((r: PickMasterItem) => Number(r?.key) === value);
    setValue("roomType", selectedRoom?.value);
    setValue("roomTypeId", Number(selectedRoom?.key));
    setSelectedRoomType(selectedRoom);
  };

  // opd consultation type select handler
  const opdConsultationVisitTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setValue("opdConsultationType", "");
      setValue("opdConsultationTypeId", value);
      return;
    }
    const selectedVisit = opdConsultationVisitType.find(
      (r: PickMasterItem) => Number(r?.key) === value
    );
    setValue("opdConsultationType", selectedVisit?.value);
    setValue("opdConsultationTypeId", Number(selectedVisit?.key));
  };

  // close snomed handler

  const closeSnomedHandler = useCallback(() => {
    setOpenSnomedPopup(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setRenderSnomedPopup(false);
    }, 100);
  }, []);

  const performingDoctorChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setValue("isRequiredSeparatePerformingDoctor", value, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (value === 0) {
      setSelectedDoctorDepartments([]);
      setValue("doctorDepartmentIds", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const doctorDepartmentChangeHandler = (options: MultiValue<SelectItem>) => {
    const selectedOptions = [...options];
    setSelectedDoctorDepartments(selectedOptions);
    setValue("doctorDepartmentIds", selectedOptions.map(option => option.value).join(","), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  useEffect(() => {
    if (isRequiredPerformingDoctor) return;

    setSelectedDoctorDepartments([]);
    setValue("doctorDepartmentIds", "", {
      shouldValidate: false,
      shouldDirty: true,
    });
  }, [isRequiredPerformingDoctor, setValue]);

  useEffect(() => {
    if (
      !isOpen ||
      !data?.serviceItemId ||
      !data?.doctorDepartmentIds ||
      doctorDepartmentOptions.length === 0
    ) {
      return;
    }

    if (Number(data?.isRequiredSeparatePerformingDoctor ?? 0) !== 1) {
      return;
    }

    const idSet = new Set(parseCsvIds(data.doctorDepartmentIds));
    const selected = doctorDepartmentOptions.filter(option => idSet.has(Number(option.value)));
    setSelectedDoctorDepartments([...selected]);
    setValue("doctorDepartmentIds", data.doctorDepartmentIds, { shouldValidate: false });
  }, [
    isOpen,
    data?.serviceItemId,
    data?.doctorDepartmentIds,
    data?.isRequiredSeparatePerformingDoctor,
    doctorDepartmentOptions,
    setValue,
  ]);

  useEffect(() => {
    if (!data?.serviceItemId) return;
    if (!categoryList.length) return;

    reset({
      serviceItemId: data.serviceItemId,
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId ?? 0,
      subSubCategoryId: data.subSubCategoryId ?? 0,
      name: data.name ?? "",
      code: data.code ?? "",
      roomTypeId: data.roomTypeId ?? 0,
      roomType: data.roomType ?? "",
      isICU: data.isICU ?? 0,
      gstPer: data.gstPer ?? 0,
      snomedCode: data.snomedCode ?? "",
      opdConsultationTypeId: data.opdConsultationTypeId ?? 0,
      opdConsultationType: data.opdConsultationType ?? "",
      isOnlineConsultationAllow: data.isOnlineConsultationAllow ?? 0,
      isTeleConsultationService: data.isTeleConsultationService ?? 0,
      isActive: data.isActive ?? 1,
      isRequiredSeparatePerformingDoctor: data.isRequiredSeparatePerformingDoctor ?? 0,
      doctorDepartmentIds: data.doctorDepartmentIds ?? "",
    });

    setCategoryId(data.categoryId);

    const cat = categoryList.find(
      (c: CategoryItem) => Number(c.categoryId) === Number(data.categoryId)
    );

    if (cat) {
      setSelectedCategory(cat);
      setCategoryTypeId(Number(cat.categoryTypeId));
    }
  }, [data, categoryList]);

  // sub category

  useEffect(() => {
    if (!data?.subCategoryId) return;
    if (!subCategoryList.length) return;

    const selectedSubCategory = subCategoryList.find(
      (s: SubCategoryItem) => Number(s.subCategoryId) === Number(data.subCategoryId)
    );

    if (!selectedSubCategory) return;

    setSelectSubCategory(selectedSubCategory);

    setSelectSubCategoryValue({
      label: selectedSubCategory.subCategoryName,
      value: selectedSubCategory.subCategoryId,
    });

    setValue("subCategoryId", selectedSubCategory.subCategoryId);
  }, [subCategoryList, data?.subCategoryId]);

  // sub sub category
  useEffect(() => {
    if (!data?.subSubCategoryId) return;
    if (!subSubCategoryList.length) return;

    const selectedSubSubCategory = subSubCategoryList.find(
      (s: SubSubCategoryItem) => Number(s.subSubCategoryId) === Number(data.subSubCategoryId)
    );

    if (!selectedSubSubCategory) return;

    setSelectSubSubCategory(selectedSubSubCategory);

    setSubSelectSubCategoryValue({
      label: selectedSubSubCategory.subSubCategoryName,
      value: selectedSubSubCategory.subSubCategoryId,
    });

    setValue("subSubCategoryId", selectedSubSubCategory.subSubCategoryId);
  }, [subSubCategoryList, data?.subSubCategoryId]);

  // room type
  useEffect(() => {
    if (!data?.roomTypeId) return;
    if (!serviceRoomTypeList.length) return;

    const roomType = serviceRoomTypeList.find(
      (r: PickMasterItem) => Number(r.key) === Number(data.roomTypeId)
    );

    if (!roomType) return;

    setSelectedRoomType(roomType);

    setValue("roomTypeId", Number(roomType.key));
    setValue("roomType", roomType.value);
  }, [data?.roomTypeId, serviceRoomTypeList]);

  //opd consultation type
  useEffect(() => {
    if (!data?.opdConsultationTypeId) return;
    if (!opdConsultationVisitType.length) return;

    const visitType = opdConsultationVisitType.find(
      (o: PickMasterItem) => Number(o.key) === Number(data.opdConsultationTypeId)
    );

    if (!visitType) return;

    setValue("opdConsultationTypeId", Number(visitType.key));

    setValue("opdConsultationType", visitType.value);
  }, [data?.opdConsultationTypeId, opdConsultationVisitType]);

  const icuValue = watch("isICU");

  useEffect(() => {
    if (Number(icuValue) === 1) {
      setValue("gstPer", null);
    }
  }, [icuValue]);

  // set snomed data value
  useEffect(() => {
    if (!snomedData) return;

    setValue("name", snomedData.term, {
      shouldDirty: true,
    });

    setValue("snomedCode", snomedData.conceptId, {
      shouldDirty: true,
    });
  }, [snomedData, setValue]);

  // submit handler
  const onsubmit = async (formData: createUpdateServiceMasterFormItem) => {
    const doctorDepartmentIds =
      Number(formData.isRequiredSeparatePerformingDoctor) === 1
        ? formData.doctorDepartmentIds ||
          selectedDoctorDepartments.map(option => option.value).join(",")
        : "";

    const payload = {
      ...formData,
      isRequiredSeparatePerformingDoctor: Number(formData.isRequiredSeparatePerformingDoctor ?? 0),
      doctorDepartmentIds,
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SERVICE_ITEM_MASTER,
      payload,
      {},
      { component: "AddServiceMaster" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to update category");
      return;
    }
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    await refreshTableData?.(
      Number(payload.categoryId),
      Number(payload.subCategoryId),
      Number(payload.subSubCategoryId)
    );
    setTimeout(() => {
      setSelectedDoctorDepartments([]);
      reset({
        serviceItemId: 0,
        categoryId: 0,
        subCategoryId: 0,
        subSubCategoryId: 0,
        name: "",
        code: "",
        roomTypeId: 0,
        roomType: "",
        isICU: 0,
        gstPer: 0,
        snomedCode: "",
        opdConsultationTypeId: 0,
        opdConsultationType: "",
        isOnlineConsultationAllow: 0,
        isTeleConsultationService: 0,
        isActive: 1,
        isRequiredSeparatePerformingDoctor: 0,
        doctorDepartmentIds: "",
      });
      onClose?.();
    }, 500);
  };

  useScrollLock(isOpen);

  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div
          className={`drawer-layout drawer-bg lg:min-w-200 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="drawer-title-border">
            <h2 className="drawer-title">{buttonTitle} Service</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          {!!successMessage && <SuccessMessage text={successMessage} />}
          {!!errorMessage && <ErrorMessage text={errorMessage} />}

          <div className="card m-1">
            <form onSubmit={handleSubmit(onsubmit)}>
              <div className="form-grid-2">
                <InputField label="Category">
                  <div className="flex gap-2 items-center">
                    <select
                      {...register("categoryId")}
                      className="input-field"
                      onChange={categorySelectHandler}
                      value={categoryId}
                    >
                      <option value={0}>Select Category</option>
                      {categoryList?.map((c: CategoryItem) => (
                        <option key={c?.categoryId} value={c?.categoryId}>
                          {c?.categoryName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler(ServiceMasterPopupName?.CATEGORY)}
                    >
                      <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                    </button>
                  </div>
                  {errors.categoryId && (
                    <p className="input-field-error">{errors.categoryId.message}</p>
                  )}
                </InputField>
                <InputField label="Sub Category">
                  <div className="flex gap-2 items-center">
                    <Select
                      value={selectSubCategoryValue}
                      options={subCategorySelectOption}
                      placeholder="Select sub category"
                      isSearchable
                      isClearable
                      onChange={(option: any) => subCategorySelectHandler(option)}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler(ServiceMasterPopupName?.SUB_CATEGORY)}
                    >
                      <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                    </button>
                  </div>
                  {errors.subCategoryId && (
                    <p className="input-field-error">{errors.subCategoryId.message}</p>
                  )}
                </InputField>
                <InputField label="Sub Sub Category">
                  <div className="flex gap-2 items-center">
                    <Select
                      value={selectSubSubCategoryValue}
                      options={subSubCategorySelectOption}
                      placeholder="Select sub category"
                      isSearchable
                      isClearable
                      onChange={(option: any) => subSubCategorySelectHandler(option)}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler(ServiceMasterPopupName?.SUB_SUB_CATEGORY)}
                    >
                      <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                    </button>
                  </div>
                  {errors.subSubCategoryId && (
                    <p className="input-field-error">{errors.subSubCategoryId.message}</p>
                  )}
                </InputField>
                <InputField label="Service Name">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter service name"
                    {...register("name")}
                  />
                </InputField>
                <InputField label="Service Code">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter service code"
                    {...register("code")}
                  />
                </InputField>
                <InputField label="Snomed Code">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter snomed code"
                      {...register("snomedCode")}
                    />
                    <button
                      type="button"
                      onClick={() => openPopupHandler(ServiceMasterPopupName?.SNOMED)}
                    >
                      <i className="fa-solid fa-magnifying-glass icon-color-button"></i>
                    </button>
                  </div>
                </InputField>

                <InputField label="Required Performing Doctor">
                  <input type="hidden" {...register("isRequiredSeparatePerformingDoctor")} />
                  <select
                    className="input-field"
                    value={Number(watch("isRequiredSeparatePerformingDoctor") ?? 0)}
                    onChange={performingDoctorChangeHandler}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </InputField>

                <InputField label="Doctor Department" required={isRequiredPerformingDoctor}>
                  <input type="hidden" {...register("doctorDepartmentIds")} />
                  <div
                    className={!isRequiredPerformingDoctor ? "disabled-input-field !mb-0 !p-0" : ""}
                  >
                    <Select
                      isMulti
                      value={selectedDoctorDepartments}
                      options={doctorDepartmentOptions}
                      placeholder="Select doctor departments"
                      isSearchable
                      isClearable
                      onChange={doctorDepartmentChangeHandler}
                      components={{ Option: MultiCheckboxOption }}
                      styles={!isRequiredPerformingDoctor ? "" : SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      isDisabled={!isRequiredPerformingDoctor}
                    />
                  </div>
                  {errors.doctorDepartmentIds && (
                    <p className="input-field-error">{errors.doctorDepartmentIds.message}</p>
                  )}
                </InputField>

                {!!categoryTypeId && categoryTypeId === 1 && (
                  <>
                    <InputField label="OPD Consultation Type">
                      <select
                        value={selectedOpdTypeId!}
                        className="input-field"
                        onChange={opdConsultationVisitTypeSelectHandler}
                      >
                        <option value={0}>select</option>
                        {opdConsultationVisitType?.map((o: PickMasterItem) => (
                          <option key={o?.key} value={o?.key}>
                            {o?.value}
                          </option>
                        ))}
                      </select>
                    </InputField>

                    <InputField label="Allow Online Consultation">
                      <select className="input-field" {...register("isOnlineConsultationAllow")}>
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    </InputField>

                    <InputField label="Tele Consultation Service">
                      <select className="input-field" {...register("isTeleConsultationService")}>
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    </InputField>
                  </>
                )}

                {!!categoryTypeId && categoryTypeId === 10 && (
                  <>
                    <InputField label="ICU Type">
                      <select className="input-field" {...register("isICU")}>
                        <option value={0}>Non ICU</option>
                        <option value={1}> ICU</option>
                      </select>
                    </InputField>

                    <InputField label="Room Type">
                      <select
                        {...register("roomTypeId")}
                        className="input-field"
                        onChange={roomTypeSelectHandler}
                      >
                        <option value={0}>Select room type</option>
                        {serviceRoomTypeList?.map((s: PickMasterItem) => (
                          <option key={s?.key} value={s?.key}>
                            {s?.value}
                          </option>
                        ))}
                      </select>
                      {categoryTypeId === 10 && !selectedRoomType && (
                        <p className="input-field-error">Room type is required</p>
                      )}
                    </InputField>

                    {}

                    <InputField label="GST %">
                      <input
                        type="text"
                        className={`${isICU === true ? "disabled-input-field" : "input-field"}`}
                        placeholder="Enter gst %"
                        {...register("gstPer")}
                        disabled={isICU === true}
                      />
                    </InputField>
                  </>
                )}

                <InputField label="Status">
                  <select className="input-field" {...register("isActive")}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </InputField>
              </div>
              <div className="form-actions-responsive mt-5">
                <button type="submit" className="save-btn">
                  {buttonTitle}
                </button>
                <button type="button" className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* render popup */}
      {!!renderPopup && (
        <CreateUpdatePopup
          isOpen={openPopup}
          onClose={closePopupHandler}
          popupName={popupName}
          categoryData={selectedCategory}
          resetCategoryId={setCategoryId}
          resetCategory={setSelectedCategory}
          onCategoryUpdate={refetch}
          subCategoryData={selectSubCategory!}
          resetSubCategoryOption={setSelectSubCategoryValue}
          resetSubCategoryValue={setSelectSubCategory}
          onSubCategoryUpdate={refetchSubCategory}
          subSubCategoryData={selectSubSubCategory}
          resetSubSubCategoryOption={setSubSelectSubCategoryValue}
          resetSubSubCategory={setSelectSubSubCategory}
          onSubSubCategoryUpdate={refetchSubSubCategory}
        />
      )}

      {/* snomed popup */}
      {!!renderSnomedPopup && (
        <SnomedPopup
          isOpen={openSnomedPopup}
          onClose={closeSnomedHandler}
          setData={setSnomedData}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(AddServiceMaster);
