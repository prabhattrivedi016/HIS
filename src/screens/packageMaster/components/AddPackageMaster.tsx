import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import RemoveIconButton from "@/components/globalButtons/RemoveIconButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import InputFieldModal from "@/components/inputFieldModal";
import RightSideDrawer from "@/components/rightSideDrawer";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterPopupName } from "@/constants/constants";
import { AddPackageTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { SelectItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { addPackageMasterSchema } from "@/validation/packageMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import {
  CategoryItem,
  PackageDetailsItem,
  ServiceTableItem,
  SubcategoryItem as SubCategoryItem,
  SubSubCategoryItem,
} from "../types";
import CreateUpdatePopup from "./CreateUpdatePopup";

const AddPackageMaster = ({
  isOpen,
  onClose,
  itemValue,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  itemValue: ServiceTableItem | null;
  onSuccess?: () => void;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const durationTypeList = usePickMaster("DurationUnit")?.pickMasterValue ?? [];

  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [popupName, setPopupName] = useState<string>("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [categoryId, setCategoryId] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  const [selectSubCategory, setSelectSubCategory] = useState<SubCategoryItem | null>(null);
  const [selectSubCategoryValue, setSelectSubCategoryValue] = useState<SelectItem | null>(null);

  const [selectSubSubCategory, setSelectSubSubCategory] = useState<SubSubCategoryItem | null>(null);
  const [selectSubSubCategoryValue, setSubSelectSubCategoryValue] = useState<SelectItem | null>(
    null
  );

  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number>(0);
  const [selectedSearchCategoryId, setSelectedSearchCategoryId] = useState<number>(0);
  const [localPackageServices, setLocalPackageServices] = useState<PackageDetailsItem[]>([]);
  const initializedRef = useRef<boolean>(false);

  // Service search states
  const serviceInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [serviceNameList, setServiceNameList] = useState<any[]>([]);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState<string>("");
  const [selectedQty, setSelectedQty] = useState<number>(1);

  // useForm Hook setup with Yup Schema validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: yupResolver(addPackageMasterSchema),
    defaultValues: {
      packageId: 0,
      categoryId: 0,
      subCategoryId: 0,
      subSubCategoryId: 0,
      name: "",
      code: "",
      isMultipleVisitAllow: 0,
      visitDuration: 0,
      visitDurationType: "",
      validityStartsFrom: "",
      validityEndsOn: "",
      isActive: 1,
    },
  });

  // category list
  const getCategoryList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryTypeIds: "11,12" } }
    );
    return resp?.data ?? [];
  };

  const { data: categoryList = [], refetch } = useQuery({
    queryKey: ["getCategoryList"],
    queryFn: getCategoryList,
  });

  // category change handler
  const categorySelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setCategoryId(value);
    setValue("categoryId", value, { shouldValidate: true });

    const selected = categoryList?.find((c: CategoryItem) => Number(c?.categoryId) === value);
    setSelectedCategory(selected ?? null);

    // reset sub and sub sub category selections in state
    setSelectSubCategory(null);
    setSelectSubCategoryValue(null);
    setSelectSubSubCategory(null);
    setSubSelectSubCategoryValue(null);
    setSelectedSubCategoryId(0);

    // reset sub and sub sub category selections in react-hook-form
    setValue("subCategoryId", 0);
    setValue("subSubCategoryId", 0);
  };

  // sub category list
  const getSubCategory = async (id: number) => {
    if (id <= 0) return [];
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      { params: { categoryIds: id } },
      { component: "AddPackageMaster" }
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
      subCategoryList?.map((d: SubCategoryItem) => ({
        label: d?.subCategoryName,
        value: d?.subCategoryId,
      })) || []
    );
  }, [subCategoryList]);

  // sub category select handler
  const subCategorySelectHandler = (option: SelectItem | null) => {
    if (!option) {
      setSelectSubCategoryValue(null);
      setSelectSubCategory(null);
      setSelectSubSubCategory(null);
      setSubSelectSubCategoryValue(null);
      setSelectedSubCategoryId(0);

      setValue("subCategoryId", 0);
      setValue("subSubCategoryId", 0);
      return;
    }
    setSelectSubCategoryValue(option);
    setValue("subCategoryId", Number(option.value), { shouldValidate: true });

    const selected = subCategoryList?.find(
      (s: SubCategoryItem) => s?.subCategoryId === Number(option?.value)
    );
    setSelectSubCategory(selected ?? null);
    setSelectSubSubCategory(null);
    setSubSelectSubCategoryValue(null);
    setSelectedSubCategoryId(Number(option.value));

    setValue("subSubCategoryId", 0);
  };

  // sub sub category list
  const getSubSubCategory = async (subCategoryIds: number) => {
    if (!subCategoryIds) return [];
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      { component: "AddPackageMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: subSubCategoryList = [], refetch: refetchSubSubCategory } = useQuery({
    queryKey: ["fetchSubSubCategory", selectedSubCategoryId],
    queryFn: () => getSubSubCategory(selectedSubCategoryId),
    enabled: selectedSubCategoryId > 0,
  });

  const subSubCategorySelectOption = useMemo(() => {
    return (
      subSubCategoryList?.map((d: SubSubCategoryItem) => ({
        label: d?.subSubCategoryName,
        value: d?.subSubCategoryId,
      })) || []
    );
  }, [subSubCategoryList]);

  // sub sub category select handler
  const subSubCategorySelectHandler = (option: SelectItem | null) => {
    if (!option) {
      setSubSelectSubCategoryValue(null);
      setSelectSubSubCategory(null);
      setValue("subSubCategoryId", 0);
      return;
    }
    setSubSelectSubCategoryValue(option);
    setValue("subSubCategoryId", Number(option.value), { shouldValidate: true });

    const selected = subSubCategoryList?.find(
      (s: SubSubCategoryItem) => s?.subSubCategoryId === Number(option?.value)
    );
    setSelectSubSubCategory(selected ?? null);
  };

  // search category list (below)
  const getSearchCategoryByCategory = async (categoryType: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      {
        params: {
          categoryTypeIds:
            categoryType === 11 ? "1,3,4,5,8" : categoryType === 12 ? "1,2,3,4,5,8,9,10" : 0,
        },
      },
      { component: "AddPackageMaster" }
    );
    return resp?.data;
  };

  // Sync selectedCategory whenever categoryId or categoryList changes
  useEffect(() => {
    if (categoryId > 0 && categoryList.length > 0) {
      const selected = categoryList.find((c: CategoryItem) => Number(c?.categoryId) === categoryId);
      if (selected) {
        setSelectedCategory(selected);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [categoryId, categoryList]);

  const { data: searchCategoryList } = useQuery({
    queryKey: ["getSearchCategoryByCategory", selectedCategory?.categoryTypeId],
    queryFn: () => getSearchCategoryByCategory(selectedCategory?.categoryTypeId ?? 0),
    enabled: !!selectedCategory?.categoryTypeId,
  });

  // Service search input handler
  const serviceItemHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setServiceNameList([]);
      setShowPopup(false);
      setActiveServiceIndex(0);
      return;
    }
    setShowPopup(true);
    setActiveServiceIndex(0);
  };

  // Debounced API call for service search
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) return;

    const timer = setTimeout(async () => {
      try {
        const resp = await fetchApi(
          "GET",
          ENDPOINTS.GET_SERVICE_ITEM_LIST,
          {},
          {
            params: {
              serviceName: searchTerm,
              categoryId: selectedSearchCategoryId,
              isActive: 1,
            },
          },
          { component: "AddPackageMaster" }
        );

        setServiceNameList(resp?.data ?? []);
        setShowPopup(true);
        setActiveServiceIndex(0);
      } catch (err) {
        console.error(err);
        setShowPopup(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedSearchCategoryId]);

  // Keydown handler for autocomplete popups
  const serviceInputKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showPopup || serviceNameList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveServiceIndex(prev => (prev + 1) % serviceNameList.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveServiceIndex(prev => (prev - 1 + serviceNameList.length) % serviceNameList.length);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = serviceNameList[activeServiceIndex];
      if (selected) {
        selectedServiceHandler(selected);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setShowPopup(false);
      setActiveServiceIndex(0);
    }
  };

  // Selected service option click handler
  const selectedServiceHandler = (item: any) => {
    setSelectedService(item);
    setSelectedServiceName(item.name);
    setSelectedQty(1);
    setSearchTerm("");
    setServiceNameList([]);
    setShowPopup(false);
    setActiveServiceIndex(0);
  };

  // Add Item to package services list handler
  const addItemHandler = () => {
    if (!selectedService) {
      showWarning("Please search and select a service first");
      return;
    }
    if (selectedQty <= 0) {
      showWarning("Quantity must be greater than 0");
      return;
    }

    const exists = localPackageServices.some(
      p => p.packageServiceId === selectedService.serviceItemId
    );
    if (exists) {
      showWarning("Service is already added to the package");
      return;
    }

    const newItem: PackageDetailsItem = {
      packageId: 0,
      packageName: "",
      packageCode: "",
      isActive: 1,
      subSubCategoryId: 0,
      subCategoryId: 0,
      categoryId: 0,
      startsFrom: "",
      expiresOn: "",
      packageServiceNameCode: `${selectedService.name} (${selectedService.code})`,
      packageServiceName: selectedService.name,
      packageServiceId: selectedService.serviceItemId,
      qty: selectedQty,
      packageServiceCategory: selectedService.categoryName || "",
      packageServiceSubCategoryId: selectedService.subCategoryId || 0,
      packageServiceSubSubCategoryId: selectedService.subSubCategoryId || 0,
      packageServiceCode: selectedService.code || "",
      packageServiceCategoryId: selectedService.categoryId || 0,
      isMultipleVisitAllow: 0,
      visitDuration: 0,
      visitDurationType: "",
    };

    setLocalPackageServices(prev => [...prev, newItem]);
    setSelectedService(null);
    setSelectedServiceName("");
    setSelectedQty(1);
    serviceInputRef.current?.focus();
  };

  // Automatically select first category if searchCategoryList is populated
  useEffect(() => {
    if (searchCategoryList && searchCategoryList.length > 0) {
      setSelectedSearchCategoryId(Number(searchCategoryList[0].categoryId));
    } else {
      setSelectedSearchCategoryId(0);
    }
  }, [searchCategoryList]);

  // package details
  const getPackageDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PACKAGE_ALL_DETAILS,
      {},
      { params: { packageId: itemValue?.serviceItemId } },
      { component: "AddPackageMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: packageDetailsList } = useQuery({
    queryKey: ["getPackageDetails", itemValue?.serviceItemId],
    queryFn: getPackageDetails,
    enabled: !!itemValue?.serviceItemId,
  });

  // open popup handler
  const openPopupHandler = (popupName: string) => {
    switch (popupName) {
      case ServiceMasterPopupName?.CATEGORY: {
        setPopupName(ServiceMasterPopupName?.CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }
      case ServiceMasterPopupName?.SUB_CATEGORY: {
        if (!categoryId) {
          showWarning("Select category first");
          return;
        }
        setPopupName(ServiceMasterPopupName?.SUB_CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }
      case ServiceMasterPopupName?.SUB_SUB_CATEGORY: {
        if (!categoryId) {
          showWarning("Select category first");
          return;
        }
        if (!selectSubCategoryValue) {
          showWarning("Select subcategory first");
          return;
        }
        setPopupName(ServiceMasterPopupName?.SUB_SUB_CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }
      default:
        return;
    }
  };

  // close popup handler
  const closePopupHandler = () => {
    setOpenPopup(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setRenderPopup(false);
    }, 100);
  };

  // Handle Edit autofill synchronization
  useEffect(() => {
    if (!itemValue) {
      reset({
        packageId: 0,
        categoryId: 0,
        subCategoryId: 0,
        subSubCategoryId: 0,
        name: "",
        code: "",
        isMultipleVisitAllow: 0,
        visitDuration: 0,
        visitDurationType: "",
        validityStartsFrom: "",
        validityEndsOn: "",
        isActive: 1,
      });
      setCategoryId(0);
      setSelectSubCategory(null);
      setSelectSubCategoryValue(null);
      setSelectSubSubCategory(null);
      setSubSelectSubCategoryValue(null);
      return;
    }

    reset({
      packageId: itemValue.serviceItemId ?? 0,
      categoryId: itemValue.categoryId ?? 0,
      subCategoryId: itemValue.subCategoryId ?? 0,
      subSubCategoryId: itemValue.subSubCategoryId ?? 0,
      name: itemValue.name ?? "",
      code: itemValue.code ?? "",
      isActive: itemValue?.isActive ?? 1,
    });

    setCategoryId(itemValue.categoryId ?? 0);
  }, [itemValue, reset]);

  useEffect(() => {
    if (!packageDetailsList || packageDetailsList.length <= 0) return;
    const pkg = packageDetailsList[0];
    setValue("isMultipleVisitAllow", pkg.isMultipleVisitAllow ?? 0);
    setValue("visitDuration", pkg.visitDuration ?? 0);
    setValue("visitDurationType", pkg.visitDurationType ?? "");
    setValue(
      "validityStartsFrom",
      pkg.startsFrom ? formatToDDMMYYYY(pkg.startsFrom.split("T")[0]) : ""
    );
    setValue("validityEndsOn", pkg.expiresOn ? formatToDDMMYYYY(pkg.expiresOn.split("T")[0]) : "");
    setValue("isActive", pkg.isActive ?? 1);
  }, [packageDetailsList, setValue]);

  // Reset initialization status when drawer closes/opens
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      setLocalPackageServices([]);
    }
  }, [isOpen]);

  // Sync packageDetailsList into local state once on load
  useEffect(() => {
    if (packageDetailsList && !initializedRef.current) {
      setLocalPackageServices(packageDetailsList);
      initializedRef.current = true;
    }
  }, [packageDetailsList]);

  // Synchronize subCategory dropdown value when list finishes loading in edit mode
  useEffect(() => {
    if (itemValue && itemValue.subCategoryId && subCategoryList.length > 0) {
      const found = subCategoryList.find(
        (s: SubCategoryItem) => s.subCategoryId === itemValue.subCategoryId
      );
      if (found) {
        setSelectSubCategory(found);
        setSelectSubCategoryValue({
          label: found.subCategoryName,
          value: found.subCategoryId,
        });
        setSelectedSubCategoryId(found.subCategoryId);
      }
    }
  }, [subCategoryList, itemValue]);

  // Synchronize subSubCategory dropdown value when list finishes loading in edit mode
  useEffect(() => {
    if (itemValue && itemValue.subSubCategoryId && subSubCategoryList.length > 0) {
      const found = subSubCategoryList.find(
        (s: SubSubCategoryItem) => s.subSubCategoryId === itemValue.subSubCategoryId
      );
      if (found) {
        setSelectSubSubCategory(found);
        setSubSelectSubCategoryValue({
          label: found.subSubCategoryName,
          value: found.subSubCategoryId,
        });
      }
    }
  }, [subSubCategoryList, itemValue]);

  // Form submit handler
  const onSubmitHandler = async (formData: any) => {
    const payload = {
      ...formData,
      categoryId: Number(formData.categoryId),
      subCategoryId: Number(formData.subCategoryId),
      subSubCategoryId: Number(formData.subSubCategoryId),
      isMultipleVisitAllow: Number(formData.isMultipleVisitAllow ?? 0),
      visitDuration: Number(formData.visitDuration ?? 0),
      isActive: Number(formData.isActive ?? 1),
      validityStartsFrom: formatToDDMMYYYY(formData.validityStartsFrom),
      validityEndsOn: formatToDDMMYYYY(formData.validityEndsOn),
      packageServices: localPackageServices.map(l => ({
        qty: Number(l?.qty ?? 0),
        serviceItemId: Number(l?.packageServiceId ?? 0),
      })),
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_PACKAGE_MASTER,
      payload,
      {},
      { component: "AddPackageMaster" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to save package");
      return;
    }
    showSuccess(resp?.message ?? "Package saved successfully");
    onSuccess?.();
    onClose();
  };

  const isMultipleVisitAllow = Number(watch("isMultipleVisitAllow") ?? 0);

  // remove button handler
  const removeButtonHandler = (item: PackageDetailsItem) => {
    setLocalPackageServices(prev =>
      prev.filter(p => {
        if (item.packageServiceId && p.packageServiceId) {
          return p.packageServiceId !== item.packageServiceId;
        }
        return p.packageServiceCode !== item.packageServiceCode;
      })
    );
  };

  return (
    <RightSideDrawer
      isOpen={isOpen}
      onClose={onClose}
      buttonTitle={itemValue ? "Update Package" : "Add New Package"}
      className=" lg:min-w-280 p-0.5"
    >
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="card form-grid-4 m-1">
          <InputField label="Category" required>
            <div className="flex gap-2 items-center">
              <select
                className="input-field"
                value={watch("categoryId")}
                onChange={categorySelectHandler}
              >
                <option value={0}>--Select--</option>
                {categoryList?.map((item: CategoryItem) => (
                  <option key={item?.categoryId} value={item?.categoryId}>
                    {item?.categoryName}
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
            {errors.categoryId && <p className="input-field-error">{errors.categoryId.message}</p>}
          </InputField>

          <InputField label="Sub Category" required>
            <div className="flex gap-2 items-center w-full">
              <div className="flex-1">
                <Select
                  value={selectSubCategoryValue}
                  options={subCategorySelectOption}
                  placeholder="Select sub category"
                  isSearchable
                  isClearable
                  onChange={subCategorySelectHandler}
                  styles={SelectStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <button
                type="button"
                className="-mt-3"
                onClick={() => openPopupHandler(ServiceMasterPopupName?.SUB_CATEGORY)}
              >
                <i className="fa-solid fa-circle-plus add-popup-icon"></i>
              </button>
            </div>
            {errors.subCategoryId && (
              <p className="input-field-error">{errors.subCategoryId.message}</p>
            )}
          </InputField>

          <InputField label="Sub Sub Category" required>
            <div className="flex gap-2 items-center w-full">
              <div className="flex-1">
                <Select
                  value={selectSubSubCategoryValue}
                  options={subSubCategorySelectOption}
                  placeholder="Select sub sub category"
                  isSearchable
                  isClearable
                  onChange={subSubCategorySelectHandler}
                  styles={SelectStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <button
                type="button"
                className="-mt-3"
                onClick={() => openPopupHandler(ServiceMasterPopupName?.SUB_SUB_CATEGORY)}
              >
                <i className="fa-solid fa-circle-plus add-popup-icon"></i>
              </button>
            </div>
            {errors.subSubCategoryId && (
              <p className="input-field-error">{errors.subSubCategoryId.message}</p>
            )}
          </InputField>

          <InputField label="Package Name" required>
            <input className="input-field" placeholder="Enter package name" {...register("name")} />
            {errors.name && <p className="input-field-error">{errors.name.message}</p>}
          </InputField>

          <InputField label="Package Code" required>
            <input className="input-field" placeholder="Enter package code" {...register("code")} />
            {errors.code && <p className="input-field-error">{errors.code.message}</p>}
          </InputField>

          <InputField label="Status">
            <select className="input-field" {...register("isActive")} value={watch("isActive")}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </InputField>

          <InputField label="Start From">
            <Controller
              control={control}
              name="validityStartsFrom"
              render={({ field }) => (
                <CustomDateInput
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                />
              )}
            />
          </InputField>

          <InputField label="Expires On">
            <Controller
              control={control}
              name="validityEndsOn"
              render={({ field }) => (
                <CustomDateInput
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                />
              )}
            />
          </InputField>

          <InputField label="Multiple Visit Allow">
            <select
              className="input-field"
              {...register("isMultipleVisitAllow")}
              value={watch("isMultipleVisitAllow")}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </InputField>

          <div className={isMultipleVisitAllow === 1 ? "" : "hidden"}>
            <InputField label="Visit duration">
              <input
                type="number"
                className="input-field"
                placeholder="Enter visit duration"
                {...register("visitDuration")}
              />
            </InputField>
          </div>

          <div className={isMultipleVisitAllow === 1 ? "" : "hidden"}>
            <InputField label="Visit Duration Type">
              <select
                className="input-field"
                {...register("visitDurationType")}
                value={watch("visitDurationType")}
              >
                <option value="">Select Duration Type</option>
                {durationTypeList.map(d => (
                  <option key={d?.value} value={d?.value}>
                    {d?.key}
                  </option>
                ))}
              </select>
            </InputField>
          </div>
        </div>
        <div className=" card m-1 -mt-3">
          <div className=" form-grid-4 ">
            <InputField label="Search Category">
              <select
                className="input-field"
                value={selectedSearchCategoryId}
                onChange={e => setSelectedSearchCategoryId(Number(e.target.value))}
              >
                <option value={0}>--Select--</option>
                {searchCategoryList?.map((item: CategoryItem) => (
                  <option key={item?.categoryId} value={item?.categoryId}>
                    {item?.categoryName}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Search Service">
              <div className="relative w-full">
                <input
                  ref={serviceInputRef}
                  className="input-field input-field-search-right"
                  placeholder="Type to search services"
                  value={searchTerm}
                  onChange={serviceItemHandler}
                  onKeyDown={serviceInputKeyDownHandler}
                />

                <i
                  className="fa-solid fa-magnifying-glass input-search-icon input-search-icon-right"
                  aria-hidden="true"
                />

                <InputFieldModal
                  showPopup={showPopup}
                  data={serviceNameList}
                  activeIndex={activeServiceIndex}
                  setActiveIndex={setActiveServiceIndex}
                  onSelect={selectedServiceHandler}
                  getLabel={item => item.name}
                />
              </div>
            </InputField>
            <InputField label="Service Name">
              <input
                className="input-field"
                value={selectedServiceName}
                onChange={e => setSelectedServiceName(e.target.value)}
                disabled
              />
            </InputField>
            <InputField label="Qty">
              <input
                type="text"
                className="input-field"
                value={selectedQty}
                onChange={e => setSelectedQty(Number(e.target.value))}
                min={1}
                onInput={allowOnlyNumbers}
              />
            </InputField>
          </div>

          <div className="form-actions-responsive ">
            <SubmitButton type="button" label="Add Item" onClick={addItemHandler} />
          </div>
        </div>

        {/* package table */}
        {!!localPackageServices && localPackageServices.length > 0 ? (
          <div className="table-container m-1 ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-60 lg:max-h-60">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {AddPackageTableHeader.map((header, index) => (
                        <th key={index} className="table-th ">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {localPackageServices.length === 0 ? (
                      <tr>
                        <td colSpan={AddPackageTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      localPackageServices.map((item: PackageDetailsItem, idx: number) => (
                        <tr key={item?.packageServiceId} className="table-row">
                          <td className="table-td">{idx + 1}</td>
                          <td className="table-td">{item?.packageServiceCategory ?? "-"}</td>
                          <td className="table-td">{item?.packageServiceName ?? "-"}</td>
                          <td className="table-td">{item?.qty ?? 1}</td>
                          <td>
                            <RemoveIconButton onClick={() => removeButtonHandler(item)} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="form-actions-responsive">
              <SubmitButton label="Update" type="submit" />
            </div>
          </div>
        ) : (
          <></>
        )}
      </form>

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

      {!!loading && <CustomLoader isLoading={loading} />}
    </RightSideDrawer>
  );
};

export default AddPackageMaster;
