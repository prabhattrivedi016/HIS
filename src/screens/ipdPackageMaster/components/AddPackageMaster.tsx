import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import CancelButton from "@/components/globalButtons/CancelButton";
import EditIconButton from "@/components/globalButtons/EditIconButton";
import RemoveIconButton from "@/components/globalButtons/RemoveIconButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import InputFieldModal from "@/components/inputFieldModal";
import RightSideDrawer from "@/components/rightSideDrawer";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterPopupName } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SubCategoryItem } from "@/screens/opdBilling/types";
import { SelectItem, SubSubCategoryItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { ipdAddPackageMasterSchema } from "@/validation/packageMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import {
  CategoryItem,
  PackageDetailsItem,
  PackageSetupItem,
  packageSetupStateValue,
  SearchServiceItem,
  ServiceTableItem,
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

  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [popupName, setPopupName] = useState<string>("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [categoryId, setCategoryId] = useState<number>(12);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  const [selectSubCategory, setSelectSubCategory] = useState<SubCategoryItem | null>(null);
  const [selectSubCategoryValue, setSelectSubCategoryValue] = useState<SelectItem | null>(null);

  const [selectSubSubCategory, setSelectSubSubCategory] = useState<SubSubCategoryItem | null>(null);
  const [selectSubSubCategoryValue, setSubSelectSubCategoryValue] = useState<SelectItem | null>(
    null
  );

  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number>(0);

  // package category

  const [selectedSearchCategoryId, setSelectedSearchCategoryId] = useState<number>(0);
  const [selectedSearchCategoryValue, setSelectedSearchCategoryValue] = useState<string>("");

  const [packageSelectSubCategoryId, setPackageSelectSubCategoryId] = useState<number>(0);
  const [packageSelectSubCategoryValue, setPackageSelectSubCategoryValue] =
    useState<SelectItem | null>(null);

  const [packageSelectSubSubCategoryId, setPackageSelectSubSubCategoryId] = useState<number>(0);
  const [packageSelectSubSubCategoryValue, setPackageSelectSubSubCategoryValue] =
    useState<SelectItem | null>(null);

  const [localPackageServices, setLocalPackageServices] = useState<PackageSetupItem[]>([]);

  const [limitTypeId, setLimitTypeId] = useState<number>(1);
  const [limitTypeValue, setLimitTypeValue] = useState<string>("Amount Wise");
  const [limitInputValue, setLimitInputValue] = useState<string>("");

  // Service search states
  const serviceInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [serviceNameList, setServiceNameList] = useState<any[]>([]);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState<string>("");
  const [selectedQty, setSelectedQty] = useState<string>("");

  const [packageDetailsList, setPackageDetailsList] = useState<PackageDetailsItem[]>([]);

  const [copyServiceNameList, setCopyServiceNameList] = useState<ServiceTableItem[]>([]);

  const [packageSetupDetails, setPackageSetupDetails] = useState<packageSetupStateValue>({
    category: { label: "", value: 0 },
    subCategory: { label: "", value: 0 },
    subSubCategory: { label: "", value: 0 },
    limitTypeId: 1,
    limitType: "Amount Wise",
    limit: "",
    serviceItemId: 0,
    serviceQty: "",
    serviceName: "",
  });

  console.log("packageSetupDetails", packageSetupDetails);

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
    resolver: yupResolver(ipdAddPackageMasterSchema),
    defaultValues: {
      packageId: 0,
      categoryId: 12,
      subCategoryId: 0,
      subSubCategoryId: 0,
      name: "",
      code: "",
      packageDurationDays: "",
      validityStartsFrom: "",
      validityEndsOn: "",
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("packageId"));
  const buttonTitle = isEdit ? "Update" : "Create";

  // category list
  const getCategoryList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryTypeIds: "12" } }
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
          categoryTypeIds: "2,3,4,5,8,10",
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

  // Service search input handler in package
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
              subCategoryId: packageSelectSubCategoryId,
              subSubCategoryId: packageSelectSubSubCategoryId,
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
  }, [
    searchTerm,
    selectedSearchCategoryId,
    packageSelectSubCategoryId,
    packageSelectSubSubCategoryId,
  ]);

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
  const selectedServiceHandler = (item: SearchServiceItem) => {
    // Update the package setup details object
    setPackageSetupDetails((prev: packageSetupStateValue) => ({
      ...prev,
      category: { label: item?.categoryName ?? "", value: item?.categoryId ?? 0 },
      subCategory: { label: item?.subCategoryName ?? "", value: item?.subCategoryId ?? 0 },
      subSubCategory: {
        label: item?.subSubCategoryName ?? "",
        value: item?.subSubCategoryId ?? 0,
      },
      serviceItemId: Number(item?.serviceItemId ?? 0),
      serviceName: item?.name ?? "",
      serviceQty: "",
      limit: "",
      limitType: "Amount Wise",
      limitTypeId: 1,
    }));

    // Auto-bind to the UI select inputs
    if (item.categoryId) {
      setSelectedSearchCategoryId(Number(item.categoryId));
      setSelectedSearchCategoryValue(item.categoryName);
    }

    if (item.subCategoryId) {
      setPackageSelectSubCategoryId(Number(item.subCategoryId));
      setPackageSelectSubCategoryValue({
        label: item.subCategoryName,
        value: Number(item.subCategoryId),
      });
      setSelectedSubCategoryId(Number(item.subCategoryId));
    }

    if (item.subSubCategoryId) {
      setPackageSelectSubSubCategoryId(Number(item.subSubCategoryId));
      setPackageSelectSubSubCategoryValue({
        label: item.subSubCategoryName,
        value: Number(item.subSubCategoryId),
      });
    }

    setSelectedService(item);
    setSelectedServiceName(item.name);
    setSelectedQty("");
    setSearchTerm("");
    setServiceNameList([]);
    setShowPopup(false);
    setActiveServiceIndex(0);
  };

  // Automatically select first category if searchCategoryList is populated
  useEffect(() => {
    if (searchCategoryList && searchCategoryList.length > 0) {
      setSelectedSearchCategoryId(Number(searchCategoryList[0].categoryId));
      setPackageSetupDetails({
        ...packageSetupDetails,
        category: {
          label: searchCategoryList[0].categoryName,
          value: searchCategoryList[0].categoryId,
        },
      });
    } else {
      setSelectedSearchCategoryId(0);
      setPackageSetupDetails({
        ...packageSetupDetails,
        category: {
          label: "",
          value: 0,
        },
      });
    }
  }, [searchCategoryList]);

  // package details
  const getPackageDetails = async (packageId: number = 0) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_PACKAGE_SETUP_MAPPING,
      {},
      { params: { packageId: packageId > 0 ? packageId : itemValue?.serviceItemId } },
      { component: "AddPackageMaster" }
    );

    setPackageDetailsList(resp?.data ?? []);
  };

  useEffect(() => {
    if (itemValue?.serviceItemId && itemValue?.serviceItemId > 0) {
      getPackageDetails();
    }
  }, [itemValue?.serviceItemId]);

  useEffect(() => {
    if (!packageDetailsList) {
      setLocalPackageServices([]);
      return;
    }

    setLocalPackageServices(
      packageDetailsList.map((p: PackageDetailsItem) => ({
        categoryId: Number(p?.CategoryId ?? 0),
        subCategoryId: Number(p?.SubCategoryId ?? 0),
        subSubCategoryId: Number(p?.SubSubCategoryId ?? 0),
        serviceItemId: Number(p?.ServiceItemId ?? 0),

        limitTypeId: Number(p?.LimitTypeId ?? 0),
        limitType: p?.LimitType ?? "",
        limit: Number(p?.Limit ?? 0),
        serviceQty: Number(p?.ServiceQty ?? 0),

        serviceName: String(p?.ServiceItemName ?? ""),
        categoryName: String(p?.CategoryName ?? ""),
        subCategoryName: String(p?.SubCategoryName ?? ""),
        subSubCategoryName: String(p?.SubSubCategoryName ?? "-"),

        qty: String(p?.ServiceQty ?? ""),
      }))
    );
  }, [packageDetailsList]);

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
        categoryId: 12,
        subCategoryId: 0,
        subSubCategoryId: 0,
        name: "",
        code: "",
        packageDurationDays: "",
        validityStartsFrom: "",
        validityEndsOn: "",
        isActive: 1,
      });
      setCategoryId(12);
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
      packageDurationDays: itemValue?.packageDurationDays
        ? String(itemValue.packageDurationDays)
        : "",
      validityStartsFrom: itemValue?.startsFrom
        ? formatToDDMMYYYY(itemValue.startsFrom.split("T")[0])
        : "",
      validityEndsOn: itemValue?.expiresOn
        ? formatToDDMMYYYY(itemValue.expiresOn.split("T")[0])
        : "",
      isActive: itemValue?.isActive ?? 1,
    });

    setCategoryId(itemValue.categoryId ?? 0);
    if (itemValue.subCategoryId && itemValue.subCategoryName) {
      setSelectSubCategoryValue({
        label: itemValue.subCategoryName,
        value: Number(itemValue.subCategoryId),
      });
      setSelectedSubCategoryId(itemValue.subCategoryId);
    } else {
      setSelectSubCategoryValue(null);
      setSelectedSubCategoryId(0);
    }

    if (itemValue.subSubCategoryId && itemValue.subSubCategoryName) {
      setSubSelectSubCategoryValue({
        label: itemValue.subSubCategoryName,
        value: Number(itemValue.subSubCategoryId),
      });
    } else {
      setSubSelectSubCategoryValue(null);
    }
  }, [itemValue, reset]);

  // Form submit handler
  const onSubmitHandler = async (formData: any) => {
    const payload = {
      ...formData,
      packageSetups: localPackageServices?.map((p: PackageSetupItem) => ({
        categoryId: p.categoryId,
        subCategoryId: p.subCategoryId,
        subSubCategoryId: p.subSubCategoryId,
        serviceItemId: p.serviceItemId,
        limitTypeId: p.limitTypeId,
        limitType: p.limitType,
        limit: p.limit,
        serviceQty: p.serviceQty,
      })),
    };

    if (localPackageServices.length <= 0) {
      showWarning("Please Add atleast one Package Setup!");
      return;
    }

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_IPD_PACKAGE_MASTER,
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

  // remove button handler
  const removeButtonHandler = (indexToRemove: number) => {
    setLocalPackageServices(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // edit button handler
  const editItemHandler = (indexToEdit: number) => {
    const item = localPackageServices[indexToEdit];

    // Bind to UI states
    setSelectedSearchCategoryId(item.categoryId);
    setSelectedSearchCategoryValue(String(item.categoryName));

    setPackageSelectSubCategoryId(item.subCategoryId);
    if (item.subCategoryId) {
      setPackageSelectSubCategoryValue({
        label: String(item.subCategoryName),
        value: item.subCategoryId,
      });
      setSelectedSubCategoryId(item.subCategoryId);
    } else {
      setPackageSelectSubCategoryValue(null);
      setSelectedSubCategoryId(0);
    }

    setPackageSelectSubSubCategoryId(item.subSubCategoryId);
    if (item.subSubCategoryId) {
      setPackageSelectSubSubCategoryValue({
        label: String(item.subSubCategoryName),
        value: item.subSubCategoryId,
      });
    } else {
      setPackageSelectSubSubCategoryValue(null);
    }

    if (item.serviceItemId) {
      setSelectedService({
        serviceItemId: item.serviceItemId,
        name: item.serviceName,
        rate: item.rate,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        subCategoryId: item.subCategoryId,
        subCategoryName: item.subCategoryName,
        subSubCategoryId: item.subSubCategoryId,
        subSubCategoryName: item.subSubCategoryName,
      });
    } else {
      setSelectedService(null);
    }

    setSelectedServiceName(String(item.serviceName));
    setSelectedQty(String(item.qty || item.serviceQty || ""));
    setLimitTypeId(item.limitTypeId);
    setLimitTypeValue(item.limitType);
    setLimitInputValue(String(item.limit));

    // Bind to packageSetupDetails
    setPackageSetupDetails({
      category: { label: String(item.categoryName), value: item.categoryId },
      subCategory: { label: String(item.subCategoryName), value: item.subCategoryId },
      subSubCategory: { label: String(item.subSubCategoryName), value: item.subSubCategoryId },
      limitTypeId: item.limitTypeId,
      limitType: item.limitType,
      limit: String(item.limit),
      serviceItemId: item.serviceItemId,
      serviceQty: String(item.qty || item.serviceQty || ""),
      serviceName: String(item.serviceName),
    });

    // Remove item from table
    removeButtonHandler(indexToEdit);
  };

  // package
  const searchCategorySelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSearchCategoryId(Number(e.target.value));
    setPackageSelectSubCategoryId(0);
    setPackageSelectSubCategoryValue(null);
    setPackageSelectSubSubCategoryId(0);
    setPackageSelectSubSubCategoryValue(null);
    const selected = searchCategoryList.find(
      (c: CategoryItem) => Number(c.categoryId) === Number(e.target.value)
    );
    setPackageSetupDetails(prev => ({
      ...prev,
      category: {
        label: selected?.categoryName ?? "",
        value: selected?.categoryId ?? 0,
      },
      subCategory: { label: "", value: 0 },
      subSubCategory: { label: "", value: 0 },
    }));

    setSelectedSearchCategoryValue(selected?.categoryName);
  };

  // search sub category list
  const getSearchSubCategory = async (id: number) => {
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

  const { data: searchSubCategoryList = [] } = useQuery({
    queryKey: ["fetchSearchSubCategory", selectedSearchCategoryId],
    queryFn: () => getSearchSubCategory(selectedSearchCategoryId),
    enabled: selectedSearchCategoryId > 0,
  });

  const searchSubCategorySelectOption = useMemo(() => {
    return (
      searchSubCategoryList?.map((d: SubCategoryItem) => ({
        label: d?.subCategoryName,
        value: d?.subCategoryId,
      })) || []
    );
  }, [searchSubCategoryList]);

  // sub sub category list
  const getSearchSubSubCategory = async (subCategoryIds: number) => {
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

  const { data: searchSubSubCategoryList = [] } = useQuery({
    queryKey: ["fetchSearchSubSubCategory", packageSelectSubCategoryId],
    queryFn: () => getSearchSubSubCategory(packageSelectSubCategoryId),
    enabled: packageSelectSubCategoryId > 0,
  });

  const searchSubSubCategorySelectOption = useMemo(() => {
    return (
      searchSubSubCategoryList?.map((d: SubSubCategoryItem) => ({
        label: d?.subSubCategoryName,
        value: d?.subSubCategoryId,
      })) || []
    );
  }, [searchSubSubCategoryList]);

  // package sub category
  const packageSubCategorySelectHandler = (option: SelectItem | null) => {
    if (!option) {
      setPackageSelectSubCategoryValue(null);
      setPackageSelectSubSubCategoryId(0);
      setPackageSelectSubCategoryId(0);
      setPackageSetupDetails(prev => ({
        ...prev,
        subCategory: { label: "", value: 0 },
        subSubCategory: { label: "", value: 0 },
      }));
      return;
    }
    setPackageSelectSubCategoryValue(option);

    const selected = searchSubCategoryList?.find(
      (s: SubCategoryItem) => s?.subCategoryId === Number(option?.value)
    );
    setSelectSubCategory(selected ?? null);
    setSelectSubSubCategory(null);
    setSubSelectSubCategoryValue(null);
    setSelectedSubCategoryId(Number(option.value));
    setPackageSelectSubCategoryId(Number(option.value));

    setPackageSetupDetails(prev => ({
      ...prev,
      subCategory: { label: selected?.subCategoryName ?? "", value: Number(option.value) },
      subSubCategory: { label: "", value: 0 },
    }));
  };

  //package sub sub category select handler
  const packageSubSubCategorySelectHandler = (option: SelectItem | null) => {
    if (!option) {
      setPackageSelectSubSubCategoryValue(null);
      setPackageSelectSubSubCategoryId(0);
      setPackageSetupDetails(prev => ({
        ...prev,
        subSubCategory: { label: "", value: 0 },
      }));
      return;
    }
    setPackageSelectSubSubCategoryValue(option);
    setPackageSelectSubSubCategoryId(Number(option.value));

    setPackageSetupDetails(prev => ({
      ...prev,
      subSubCategory: { label: option.label ?? "", value: Number(option.value) },
    }));
  };

  // Add Item to package services list handler
  const addItemHandler = () => {
    const {
      category,
      subCategory,
      subSubCategory,
      serviceItemId,
      limitTypeId,
      limitType,
      limit,
      serviceQty,
      serviceName,
    } = packageSetupDetails;

    if (!category.value) {
      showWarning("Please select a search category first");
      return;
    }
    if (!limitTypeId || !limitType) {
      showWarning("Please select a limit type");
      return;
    }
    if (Number(limit) <= 0) {
      showWarning("Please enter a valid limit value");
      return;
    }

    const exists = localPackageServices.some(
      p =>
        p?.categoryId === Number(category.value) &&
        p?.subCategoryId === Number(subCategory.value) &&
        p?.subSubCategoryId === Number(subSubCategory.value) &&
        p?.serviceItemId === Number(serviceItemId)
    );

    if (exists) {
      showWarning("This setup is already added to the package");
      return;
    }

    const newItem: PackageSetupItem = {
      categoryId: Number(category.value),
      subCategoryId: Number(subCategory.value),
      subSubCategoryId: Number(subSubCategory.value),
      serviceItemId: Number(serviceItemId),
      limitTypeId: Number(limitTypeId),
      limitType: String(limitType),
      limit: Number(limit),
      serviceQty: Number(serviceQty) || Number(selectedQty),
      serviceName: String(serviceName),
      categoryName: String(category.label),
      subCategoryName: String(subCategory.label || "-"),
      subSubCategoryName: subSubCategory.label || "-",
      rate: selectedService?.rate ?? 0,
      qty: String(serviceQty || selectedQty),
    };

    setLocalPackageServices(prev => [...prev, newItem]);
    resetPackageSetup();
  };

  const resetPackageSetup = () => {
    setSelectedSearchCategoryId(selectedSearchCategoryId);
    setSelectedSearchCategoryValue(selectedSearchCategoryValue);
    setPackageSelectSubCategoryId(0);
    setPackageSelectSubCategoryValue(null);
    setSelectedSubCategoryId(0);
    setPackageSelectSubSubCategoryId(0);
    setPackageSelectSubSubCategoryValue(null);
    setSelectedService(null);
    setSelectedServiceName("");
    setSearchTerm("");
    setSelectedQty("");
    setLimitTypeId(1);
    setLimitTypeValue("Amount Wise");
    setLimitInputValue("");

    setPackageSetupDetails({
      category: { label: "", value: 0 },
      subCategory: { label: "", value: 0 },
      subSubCategory: { label: "", value: 0 },
      limitTypeId: 1,
      limitType: "Amount Wise",
      limit: "",
      serviceItemId: 0,
      serviceQty: "",
      serviceName: "",
    });
  };

  // limit type select handler
  const limitTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    // Reset limit whenever limit type changes
    setLimitInputValue("");
    setPackageSetupDetails(prev => ({ ...prev, limit: "" }));

    if (value === 1) {
      setLimitTypeId(1);
      setLimitTypeValue("Amount Wise");
      setPackageSetupDetails(prev => ({ ...prev, limitType: "Amount Wise", limitTypeId: 1 }));
    } else if (value === 2) {
      setLimitTypeId(2);
      setLimitTypeValue("Percentage Wise");
      setPackageSetupDetails(prev => ({ ...prev, limitType: "Percentage Wise", limitTypeId: 2 }));
    } else {
      setLimitTypeId(0);
      setLimitTypeValue("");
      setPackageSetupDetails(prev => ({ ...prev, limitType: "", limitTypeId: 0 }));
    }
  };

  const limitInputValueHandler = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Allow only numbers
    value = value.replace(/\D/g, "");

    // Empty value
    if (value === "") {
      setLimitInputValue("");
      setPackageSetupDetails(prev => ({ ...prev, limit: "" }));
      return;
    }

    const numericValue = Number(value);

    // Percentage Wise
    if (Number(limitTypeId) === 2 && numericValue > 100) {
      setLimitInputValue("");
      setPackageSetupDetails(prev => ({ ...prev, limit: "" }));
      showWarning("Percentage limit cannot be greater than 100");
      return;
    }

    setLimitInputValue(value);
    setPackageSetupDetails(prev => ({ ...prev, limit: value }));
  };
  // service item list
  const getServiceItemList = async (
    categoryId: number,
    subCategoryId: number,
    subSubCategoryId: number,
    serviceName: string
  ) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      {
        params: {
          categoryId,
          subCategoryId,
          subSubCategoryId,
          serviceName,
          categoryTypeId: "12",
          isActive: 1,
        },
      },
      { component: "IpdPackageMaster" }
    );
    setCopyServiceNameList(resp?.data ?? []);
  };

  useEffect(() => {
    getServiceItemList(0, 0, 0, "");
  }, []);

  // copy package select handler
  const copyPackageSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) return;
    getPackageDetails(value);
  };

  return (
    <RightSideDrawer
      isOpen={isOpen}
      onClose={onClose}
      buttonTitle={itemValue ? "Update Package" : "Add New Package"}
      className=" lg:min-w-300 "
      isLoading={loading}
    >
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="card form-grid-4 m-1">
          <InputField label="Category" required>
            <div className="flex gap-2 items-center">
              <select className="input-field" value={categoryId} onChange={categorySelectHandler}>
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
            {errors.validityStartsFrom && (
              <p className="input-field-error">{errors.validityStartsFrom.message}</p>
            )}
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
            {errors.validityEndsOn && (
              <p className="input-field-error">{errors.validityEndsOn.message}</p>
            )}
          </InputField>

          <InputField label="Package Duration Days">
            <input
              type="text"
              className="input-field"
              {...register("packageDurationDays")}
              placeholder="Enter package duration days"
              onInput={allowOnlyNumbers}
            />
            {errors.packageDurationDays && (
              <p className="input-field-error">{errors.packageDurationDays.message}</p>
            )}
          </InputField>
          <InputField label="Status">
            <select className="input-field" {...register("isActive")}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </InputField>
        </div>
        {/* search package */}
        <div className=" card m-1 -mt-3">
          {!isEdit ? (
            <div className="flex items-start justify-between gap-4 ">
              <h4 className="text-lg font-medium"> Package Setup</h4>

              {/* Copy Package */}
              <div className="w-70">
                <InputField>
                  <select className="input-field" onChange={copyPackageSelectHandler}>
                    <option value={0}>-- Select package to Copy --</option>
                    {copyServiceNameList.map(item => (
                      <option value={item.serviceItemId}>{item?.name}</option>
                    ))}
                  </select>
                </InputField>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className=" form-grid-4 ">
            <InputField label="Category" required>
              <select
                className="input-field"
                value={selectedSearchCategoryId}
                onChange={searchCategorySelectHandler}
              >
                <option value={0}>--Select--</option>
                {searchCategoryList?.map((item: CategoryItem) => (
                  <option key={item?.categoryId} value={item?.categoryId}>
                    {item?.categoryName}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Sub Category">
              <Select
                value={packageSelectSubCategoryValue}
                options={searchSubCategorySelectOption}
                placeholder="Select sub category"
                isSearchable
                isClearable
                onChange={packageSubCategorySelectHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Sub Sub Category">
              <Select
                value={packageSelectSubSubCategoryValue}
                options={searchSubSubCategorySelectOption}
                placeholder="Select sub sub category"
                isSearchable
                isClearable
                onChange={packageSubSubCategorySelectHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
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

            <InputField label="Limit Type" required>
              <select className="input-field" value={limitTypeId} onChange={limitTypeSelectHandler}>
                <option>--Select--</option>
                <option value={1}>Amount Wise</option>
                <option value={2}>Percentage Wise</option>
              </select>
            </InputField>

            <InputField label="Limit" required>
              <input
                className="input-field"
                placeholder="Enter limit value"
                onInput={allowOnlyNumbers}
                value={limitInputValue}
                onChange={limitInputValueHandler}
                maxLength={limitTypeId === 2 ? 3 : 10}
              />
            </InputField>
            <InputField label="Service Quantity">
              <input
                type="text"
                className="input-field"
                value={selectedQty}
                onChange={e => {
                  setSelectedQty(e.target.value);
                  setPackageSetupDetails(prev => ({ ...prev, serviceQty: e.target.value }));
                }}
                onInput={allowOnlyNumbers}
                maxLength={2}
              />
            </InputField>
          </div>

          <div className="form-actions-responsive ">
            <SubmitButton type="button" label="Add Item" onClick={addItemHandler} />
            <CancelButton type="button" label="Cancel" onClick={resetPackageSetup} />
          </div>
        </div>

        {/* package table */}

        <div className="table-container m-1 ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Category</th>
                    <th className="table-th">Sub Category</th>
                    <th className="table-th">Sub Sub Category</th>
                    <th className="table-th">Service Name</th>

                    <th className="table-th">Quantity</th>

                    <th className="table-th">Limit Type</th>
                    <th className="table-th">Limit</th>
                    <th className="table-th">Edit</th>

                    <th className="table-th">Remove</th>
                  </tr>
                </thead>

                <tbody>
                  {localPackageServices.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    localPackageServices.map((item: PackageSetupItem, idx: number) => (
                      <tr key={item?.serviceItemId + idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.categoryName ?? "-"}</td>
                        <td className="table-td">{item?.subCategoryName ?? "-"}</td>
                        <td className="table-td">{item?.subSubCategoryName ?? "-"}</td>
                        <td className="table-td mt-5">{item?.serviceName ?? "-"}</td>

                        <td className="table-td ml-5">{item?.serviceQty ?? "-"}</td>
                        <td className="table-td">{item?.limitType ?? "-"}</td>
                        <td className="table-td">{item?.limit ?? 0}</td>
                        <td>
                          <EditIconButton onClick={() => editItemHandler(idx)} />
                        </td>
                        <td>
                          <RemoveIconButton onClick={() => removeButtonHandler(idx)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="form-actions-responsive mt-2">
            <button type="submit" className="save-btn mr-3 lg:min-w-30">
              {buttonTitle}
            </button>
          </div>
        </div>
      </form>

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
    </RightSideDrawer>
  );
};

export default AddPackageMaster;
