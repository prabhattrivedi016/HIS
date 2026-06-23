import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import { Radiology, Status, labTypes } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useScrollLock } from "@/hooks/useScrollLock";
import SnomedPopup from "@/screens/serviceMaster/components/SnomedPopup";
import { SnomedItem } from "@/screens/serviceMaster/types";
import { showWarning } from "@/utils/alert";
import { handleMultiSelectWithAll } from "@/utils/multiSelectAllHandler";
import {
  AddLabInvestigationFormData,
  addLabInvestigationSchema,
} from "@/validation/labInvestigationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Select, { MultiValue, SingleValue } from "react-select";
import {
  AddLabInvestigationProps,
  DoctorDepartmentItem,
  EditablePopupData,
  PickMasterOption,
  SampleTypeItem,
  SelectItem,
  SubCategoryListItem,
  SubSubCategoryItem,
  TestMethodItem,
} from "../types";
import InterpretationPopup from "./InterpretationPopup";
import LabInvestigationPopup from "./LabInvestigationPopup";
import TemplatePopup from "./TemplatePopup";

const DEFAULT_FORM_VALUES: AddLabInvestigationFormData = {
  serviceItemId: 0,
  categoryId: 3,
  subCategoryId: 0,
  subSubCategoryId: 0,
  name: "",
  code: "",
  shortName: "",
  reportTypeId: 1,
  reportType: "",
  sampleTypeId: 0,
  sampleTypeList: "",
  isSampleRequired: 1,
  labMethodId: 1,
  forGenderId: 1,
  forGender: "",
  isDepartmentReceivingRequired: 1,
  sampleVolume: "",
  tatInMin: "",
  isOutSource: 1,
  isPrintAlone: 1,
  isActive: 1,
  investigationComment: "",
  snomedCode: "",
  isRequiredSeparatePerformingDoctor: 0,
  doctorDepartmentIds: "",
};

const parseCsvIds = (value?: string) =>
  (value ?? "")
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => Number.isFinite(v) && v > 0);

const AddLabInvestigation = ({
  isOpen,
  onClose,
  categoryName,
  categoryId,
  data = null,
  refreshTableData,
}: AddLabInvestigationProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const [testMethod, setTestMethod] = useState<TestMethodItem[]>([]);
  const [selectedTest, setSelectedTest] = useState<SelectItem | null>(null);
  const [sampleType, setSampleType] = useState<SampleTypeItem[]>([]);
  const [selectedSample, setSelectedSample] = useState<SelectItem[]>([]);
  const [selectedDefaultSampleType, setSelectedDefaultSampleType] = useState<string>("");
  const [selectedSampleVolume, setSelectedSampleVolume] = useState<string>("");

  const [subCategoryList, setSubCategoryList] = useState<SubCategoryListItem[]>([]);
  const [selectSubCategory, setSelectedSubCategory] = useState<SelectItem | null>(null);

  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);
  const [selectSubSubCategory, setSelectedSubSubCategory] = useState<SelectItem | null>(null);

  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [editType, setEditType] = useState<"subCategory" | "subSubCategory" | undefined>();
  const [editableData, setEditableData] = useState<EditablePopupData>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const disabled = selectSubCategory?.label?.toLowerCase?.() === Radiology?.RADIOLOGY;

  const [renderInterpretation, setRenderInterpretation] = useState<boolean>(false);
  const [openInterpretation, setOpenInterpretation] = useState<boolean>(false);

  const [renderTemplate, setRenderTemplate] = useState<boolean>(false);
  const [openTemplate, setOpenTemplate] = useState<boolean>(false);

  const [renderSnomedPopup, setRenderSnomedPopup] = useState<boolean>(false);
  const [openSnomedPopup, setOpenSnomedPopup] = useState<boolean>(false);
  const [snomedData, setSnomedData] = useState<SnomedItem | null>(null);

  const [selectedDoctorDepartments, setSelectedDoctorDepartments] = useState<SelectItem[]>([]);

  const {
    reset,
    setValue,
    watch,
    formState: { errors },
    register,
    handleSubmit,
  } = useForm({
    resolver: yupResolver(addLabInvestigationSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    context: { isRadiology: disabled },
  });
  const buttonTitle = data ? "Update" : "Create";
  const editRowId = data?.serviceItemId ?? null;
  const isRequiredPerformingDoctor = Number(watch("isRequiredSeparatePerformingDoctor")) === 1;

  const resetFormState = useCallback(() => {
    reset({
      ...DEFAULT_FORM_VALUES,
      categoryId: categoryId || DEFAULT_FORM_VALUES.categoryId,
    });
    setSelectedTest(null);
    setSelectedSample([]);
    setSelectedDefaultSampleType("");
    setSelectedSampleVolume("");
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);
    setSubSubCategoryList([]);
    setSelectedDoctorDepartments([]);
    setSnomedData(null);
    setOpenSnomedPopup(false);
    setRenderSnomedPopup(false);
  }, [categoryId, reset]);

  // sample volume

  const getSample = usePickMaster("testSampleVolume");
  const getSampleVolume = (getSample?.pickMasterValue ?? []) as PickMasterOption[];
  const sampleVolumeOptions = useMemo(
    () =>
      getSampleVolume.map(item => ({
        value: String(item?.key ?? ""),
        label: item?.value ?? "",
      })),
    [getSampleVolume]
  );

  const matchedSampleVolume = useMemo(
    () =>
      sampleVolumeOptions.find(
        option =>
          option.value === String(data?.sampleVolume ?? "") ||
          option.label === String(data?.sampleVolume ?? "")
      ) ?? null,
    [data?.sampleVolume, sampleVolumeOptions]
  );

  const sampleVolumeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    const matchedOption = sampleVolumeOptions.find(option => option.value === selectedKey);

    setSelectedSampleVolume(selectedKey);
    setValue("sampleVolume", matchedOption?.label ?? "", {
      shouldValidate: false,
      shouldDirty: true,
    });
  };

  // lab report type
  const labReport = usePickMaster("labReportType");
  const labReportType = (labReport?.pickMasterValue ?? []) as PickMasterOption[];

  const defaultReportType = labReport?.pickMasterValue?.find(
    l => l?.key === Radiology?.DEFAULT_REPORT_TYPE
  );

  useEffect(() => {
    if (disabled && defaultReportType?.key) {
      setValue("reportTypeId", defaultReportType.key, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [disabled, defaultReportType, setValue]);

  // test method
  const getLabMethod = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LAB_METHOD_MASTER,
      {},
      { params: { isActive: Status?.ACTIVE } },
      { component: "AddLabInvestigation" }
    );
    setTestMethod(resp?.data ?? []);
  }, []);

  useEffect(() => {
    getLabMethod();
  }, [getLabMethod]);

  const testMethodOption = useMemo(
    () =>
      testMethod.map(t => ({
        value: t?.methodId,
        label: t?.method,
      })),
    [testMethod]
  );

  const testMethodChangeHandler = (option: SingleValue<SelectItem>) => {
    setSelectedTest(option);
    setValue("labMethodId", option?.value ?? 0, {
      shouldValidate: false,
    });
  };

  const getDoctorDepartmentList = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST,
      {},
      {},
      { component: "AddLabInvestigation", silent: true }
    );
    return resp?.data ?? [];
  }, [fetchApi]);

  const { data: doctorDepartmentList = [] } = useQuery({
    queryKey: ["getDoctorDepartmentList"],
    queryFn: getDoctorDepartmentList,
  });

  const doctorDepartmentOptions = useMemo<readonly SelectItem[]>(
    () =>
      doctorDepartmentList.map((d: DoctorDepartmentItem) => ({
        label: d?.department,
        value: d?.departmentId,
      })),
    [doctorDepartmentList]
  );

  // sample type
  const getAllSampleType = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_SAMPLE_TYPE_MASTER,
      {},
      {},
      { component: "SampleType", silent: true }
    );

    setSampleType(resp?.data ?? []);
  }, []);

  useEffect(() => {
    getAllSampleType();
  }, [getAllSampleType]);

  const sampleTypeOption = useMemo<readonly SelectItem[]>(() => {
    return [
      { label: "All", value: 0 },
      ...sampleType.map(b => ({
        label: b?.sampleType,
        value: b?.sampleTypeId,
      })),
    ];
  }, [sampleType]);

  const sampleTypeChangeHandler = (options: MultiValue<SelectItem>) => {
    const normalizedOptions = [...options];
    const result = handleMultiSelectWithAll(normalizedOptions, selectedSample, sampleTypeOption);
    const selectedOptions = result?.selectedOptions || [];
    const sampleOnlyOptions = selectedOptions.filter(option => option.value !== 0);
    const nextDefaultSampleType = sampleOnlyOptions.find(
      option => String(option.value) === selectedDefaultSampleType
    )
      ? selectedDefaultSampleType
      : String(sampleOnlyOptions[0]?.value ?? "");

    setSelectedSample(selectedOptions);
    setSelectedDefaultSampleType(nextDefaultSampleType);
    setValue("sampleTypeList", sampleOnlyOptions.map(option => option.value).join(","), {
      shouldValidate: false,
    });
    setValue("sampleTypeId", Number(nextDefaultSampleType || 0), {
      shouldValidate: false,
      shouldDirty: true,
    });
  };

  const defaultSampleTypeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    setSelectedDefaultSampleType(value);
    setValue("sampleTypeId", Number(value || 0), {
      shouldValidate: false,
      shouldDirty: true,
    });
  };

  useEffect(() => {
    if (disabled) {
      // Clear UI state
      setSelectedSample([]);
      setSelectedDefaultSampleType("");

      // Clear form values
      setValue("sampleTypeList", "", {
        shouldValidate: false,
        shouldDirty: true,
      });

      setValue("sampleTypeId", 0, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [disabled, setValue]);
  // sub category
  const getSubCategory = useCallback(async (id: number) => {
    if (!id) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      {
        params: {
          categoryIds: id,
        },
      },
      { component: "LabInvestigationMaster", silent: true }
    );

    setSubCategoryList(resp?.data ?? []);
    return resp?.data ?? [];
  }, []);

  const subCategorySelectOption = useMemo<readonly SelectItem[]>(() => {
    return (
      subCategoryList?.map((d: SubCategoryListItem) => ({
        label: d?.subCategoryName,
        value: d?.subCategoryId,
      })) || []
    );
  }, [subCategoryList]);

  useEffect(() => {
    if (categoryId) {
      getSubCategory(categoryId);
    }
  }, [categoryId, getSubCategory]);

  const subCategorySelectHandler = (option: SingleValue<SelectItem>) => {
    setSelectedSubCategory(option);
    setSelectedSubSubCategory(null);
    setSubSubCategoryList([]);
    setValue("subCategoryId", option?.value ?? 0, {
      shouldValidate: false,
    });
    setValue("subSubCategoryId", 0, {
      shouldValidate: false,
      shouldDirty: true,
    });
  };

  // sub sub category
  const getSubSubCategory = useCallback(async (id: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds: id } },
      {
        component: "LabInvestigationMaster",
      }
    );

    setSubSubCategoryList(resp?.data ?? []);
    return resp?.data ?? [];
  }, []);

  useEffect(() => {
    if (selectSubCategory?.value) {
      getSubSubCategory(selectSubCategory.value);
    }
  }, [getSubSubCategory, selectSubCategory?.value]);

  const refreshSubCategory = useCallback(async () => {
    if (!categoryId) return;
    await getSubCategory(categoryId);
  }, [categoryId, getSubCategory]);

  useEffect(() => {
    if (!isOpen || !editRowId || !data?.subCategoryId) return;

    getSubSubCategory(data.subCategoryId);
  }, [data?.subCategoryId, editRowId, getSubSubCategory, isOpen]);

  const refreshSubSubCategory = useCallback(
    async (subCategoryId?: number) => {
      const targetSubCategoryId = subCategoryId ?? selectSubCategory?.value;
      if (!targetSubCategoryId) return;
      await getSubSubCategory(targetSubCategoryId);
    },
    [getSubSubCategory, selectSubCategory?.value]
  );

  const subSubCategorySelectOption = useMemo<readonly SelectItem[]>(() => {
    return (
      subSubCategoryList?.map((d: SubSubCategoryItem) => ({
        label: d?.subSubCategoryName,
        value: d?.subSubCategoryId,
      })) || []
    );
  }, [subSubCategoryList]);

  const subSubCategorySelectHandler = (option: SingleValue<SelectItem>) => {
    setSelectedSubSubCategory(option);
    setValue("subSubCategoryId", option?.value ?? 0, {
      shouldValidate: false,
    });
  };

  // sub category & sub sub category popup
  const openPopupHandler = (value: "subCategory" | "subSubCategory") => {
    setOpenPopup(true);
    setRenderPopup(true);
    if (value === "subCategory") {
      const matchedSubCategory = subCategoryList?.find(
        item => item?.subCategoryId === selectSubCategory?.value
      );

      setEditableData(
        matchedSubCategory
          ? {
              categoryId: matchedSubCategory.categoryId,
              subCategoryId: matchedSubCategory.subCategoryId,
              subCategoryName: matchedSubCategory.subCategoryName,
              labTypeId: matchedSubCategory.labTypeId,
              labType:
                labTypes?.find(item => item?.id === matchedSubCategory.labTypeId)?.name ?? "",
            }
          : {
              categoryId: categoryId ?? undefined,
            }
      );
      setEditType(value);
    } else {
      const matchedSubSubCategory = subSubCategoryList?.find(
        item => item?.subSubCategoryId === selectSubSubCategory?.value
      );

      setEditableData(
        matchedSubSubCategory
          ? {
              subCategoryId: matchedSubSubCategory.subCategoryId,
              subSubCategoryId: matchedSubSubCategory.subSubCategoryId,
              subSubCategoryName: matchedSubSubCategory.subSubCategoryName,
              subSubCategoryAlias: matchedSubSubCategory.subSubCategoryAlias,
              printOrder: matchedSubSubCategory.printOrder,
            }
          : {
              subCategoryId: selectSubCategory?.value ?? 0,
            }
      );
      setEditType(value);
    }
  };
  const closeHandler = useCallback(() => {
    setOpenPopup(false);
    setEditableData(null);
  }, []);

  const handleDrawerClose = useCallback(() => {
    resetFormState();
    setOpenPopup(false);
    setEditType(undefined);
    setEditableData(null);
    onClose();
  }, [onClose, resetFormState]);

  useEffect(() => {
    if (!isOpen) {
      resetFormState();
      setOpenPopup(false);
      setEditType(undefined);
      setEditableData(null);
    }
  }, [isOpen, resetFormState]);

  // edit handler
  useEffect(() => {
    if (!isOpen) return;

    if (!editRowId) {
      resetFormState();
      return;
    }

    reset({
      ...DEFAULT_FORM_VALUES,
      serviceItemId: data?.serviceItemId || 0,
      categoryId: data?.categoryId || categoryId || DEFAULT_FORM_VALUES.categoryId,
      subCategoryId: data?.subCategoryId ?? 0,
      subSubCategoryId: data?.subSubCategoryId ?? 0,

      name: data?.name ?? "",
      code: data?.code ?? "",
      shortName: data?.shortName ?? "",

      reportTypeId: data?.reportTypeId ?? 1,
      reportType: data?.reportType ?? "",

      sampleTypeId: data?.sampleTypeId ?? 0,
      sampleTypeList: data?.sampleTypeIdList ?? "",

      isSampleRequired: data?.isSampleRequired ?? 1,

      labMethodId: data?.labMethodId ?? 1,

      forGenderId: data?.forGenderId ?? 1,
      forGender: data?.forGender ?? "",

      isDepartmentReceivingRequired: data?.isDepartmentReceivingRequired ?? 1,

      sampleVolume: matchedSampleVolume?.label ?? String(data?.sampleVolume ?? ""),
      tatInMin:
        data?.tatInMin !== undefined && data?.tatInMin !== null ? String(data.tatInMin) : "",

      isOutSource: data?.isOutSource ?? 1,
      isPrintAlone: data?.isPrintAlone ?? 1,
      isActive: data?.isActive ?? 1,

      investigationComment: data?.investigationComment ?? "",
      snomedCode: data?.snomedCode ?? "",
      isRequiredSeparatePerformingDoctor: data?.isRequiredSeparatePerformingDoctor ?? 0,
      doctorDepartmentIds: data?.doctorDepartmentIds ?? "",
    });

    // Set sub-category
    const subCategoryValue = subCategorySelectOption?.find(s => s?.value === data?.subCategoryId);
    setValue("subCategoryId", subCategoryValue?.value ?? data?.subCategoryId ?? 0);
    setSelectedSubCategory(subCategoryValue ?? null);

    // Fetch sub-sub-category list and set value after data is loaded
    if (data?.subCategoryId) {
      getSubSubCategory(data.subCategoryId).then((subSubList: SubSubCategoryItem[] = []) => {
        setSubSubCategoryList(subSubList);
        const subSubCategoryValue = subSubList
          ?.map((d: SubSubCategoryItem) => ({
            label: d?.subSubCategoryName,
            value: d?.subSubCategoryId,
          }))
          .find(d => d.value === data?.subSubCategoryId);

        setValue("subSubCategoryId", subSubCategoryValue?.value ?? 0);
        setSelectedSubSubCategory(subSubCategoryValue ?? null);
      });
    }
    const testValue = testMethodOption?.find(t => t?.value === data?.labMethodId);
    setValue("labMethodId", testValue?.value ?? data?.labMethodId ?? 1);
    setSelectedTest(testValue ?? null);

    const sampleTypeValues = [
      data?.sampleTypeId ? Number(data.sampleTypeId) : 0,
      ...(typeof data?.sampleTypeIdList === "string"
        ? data.sampleTypeIdList
            .split(",")
            .map(value => Number(value.trim()))
            .filter(Boolean)
        : []),
    ];
    const uniqueSampleTypeValues = [...new Set(sampleTypeValues.filter(Boolean))];
    const selectedSampleTypeOptions = sampleTypeOption.filter(
      option => option.value !== 0 && uniqueSampleTypeValues.includes(option.value)
    ) as SelectItem[];

    setSelectedSample(selectedSampleTypeOptions);
    setSelectedDefaultSampleType(String(data?.sampleTypeId ?? ""));
    setSelectedSampleVolume(matchedSampleVolume?.value ?? "");
  }, [
    categoryId,
    data,
    isOpen,
    editRowId,
    getSubSubCategory,
    reset,
    resetFormState,
    setValue,
    subCategorySelectOption,
    matchedSampleVolume,
    sampleTypeOption,
    testMethodOption,
  ]);

  // gender handler
  const genderHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    const label = value === 1 ? "Both" : value === 2 ? "Male" : value === 3 ? "Female" : "";

    setValue("forGenderId", value, {
      shouldValidate: false,
    });
    setValue("forGender", label, {
      shouldValidate: false,
    });
  };

  // handle submit
  const onSubmit = async (formData: AddLabInvestigationFormData) => {
    const doctorDepartmentIds =
      Number(formData.isRequiredSeparatePerformingDoctor) === 1
        ? formData.doctorDepartmentIds ||
          selectedDoctorDepartments.map(option => option.value).join(",")
        : "";

    const payload = {
      ...formData,
      isRequiredSeparatePerformingDoctor: Number(formData.isRequiredSeparatePerformingDoctor ?? 0),
      doctorDepartmentIds,
      snomedCode: formData.snomedCode ?? "",
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_INVESTIGATION_SERVICE_ITEM_MASTER,
      payload,
      {},
      { component: "AddLabInvestigation" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed while saving data");
      return;
    }
    setSuccessMessage(resp?.message || "Data saved successfully");

    resetFormState();

    await refreshTableData?.();
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      onClose();
      setSuccessMessage("");
      closeTimerRef.current = null;
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // cancel handler
  const cancelHandler = () => {
    resetFormState();
  };

  useScrollLock(isOpen);

  // observation mapping handler
  const observationMappingHandler = () => {
    navigate("/investigation-observation-mapping", {
      state: {
        investigationData: data,
      },
    });
  };

  // interpretation popup handler
  const interpretationPopupHandler = (buttonName: "Template" | "Interpretation") => {
    switch (buttonName) {
      case "Interpretation": {
        setRenderInterpretation(true);
        setOpenInterpretation(true);
        return;
      }
      case "Template": {
        setRenderTemplate(true);
        setOpenTemplate(true);
        return;
      }
      default:
        return;
    }
  };

  // close interpretation popup
  const closeInterpretationPopup = useCallback(() => {
    setOpenInterpretation(false);
  }, []);

  const closeTemplatePopup = useCallback(() => {
    setOpenTemplate(false);
  }, []);

  const openSnomedPopupHandler = () => {
    setOpenSnomedPopup(true);
    setRenderSnomedPopup(true);
  };

  const closeSnomedHandler = useCallback(() => {
    setOpenSnomedPopup(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setRenderSnomedPopup(false);
      closeTimerRef.current = null;
    }, 100);
  }, []);

  useEffect(() => {
    if (!snomedData) return;

    setValue("name", snomedData.term, {
      shouldDirty: true,
    });

    setValue("snomedCode", snomedData.conceptId, {
      shouldDirty: true,
    });
  }, [snomedData, setValue]);

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
      !editRowId ||
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
  }, [isOpen, editRowId, data?.doctorDepartmentIds, doctorDepartmentOptions, setValue]);

  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={handleDrawerClose}
        />

        <div
          className={`drawer-layout drawer-bg lg:min-w-[1100px] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="drawer-title-border">
            <h2 className="drawer-title">Add New Lab Investigation</h2>
            <button onClick={handleDrawerClose} className="drawer-close-btn">
              ×
            </button>
          </div>
          {successMessage && <SuccessMessage text={successMessage} />}
          {error && <ErrorMessage text={error?.message} />}
          <div className="card m-1">
            <h2 className="card-title ">Investigation Details</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid-3">
                <InputField label="Category" required>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter category "
                    value={categoryName!}
                    readOnly
                  />
                </InputField>

                <InputField label="Sub Category" required>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={selectSubCategory}
                      options={subCategorySelectOption}
                      placeholder="Select sub category"
                      isSearchable
                      isClearable
                      onChange={option => subCategorySelectHandler(option)}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />

                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler("subCategory")}
                    >
                      <i className="fa-solid fa-circle-plus fa-xl active:scale-95 "></i>
                    </button>
                  </div>
                  {errors.subCategoryId && (
                    <p className="input-field-error">{errors.subCategoryId.message}</p>
                  )}
                </InputField>

                <InputField label="Sub Sub Category" required>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={selectSubSubCategory}
                      options={subSubCategorySelectOption}
                      placeholder="Select sub sub category"
                      isSearchable
                      isClearable
                      onChange={option => subSubCategorySelectHandler(option)}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                    <button type="button" onClick={() => openPopupHandler("subSubCategory")}>
                      <i className="fa-solid fa-circle-plus fa-xl active:scale-95 "></i>
                    </button>
                  </div>
                  {errors.subSubCategoryId && (
                    <p className="input-field-error">{errors.subSubCategoryId.message}</p>
                  )}
                </InputField>

                <InputField label="Investigation Name" required {...register("name")}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter investigation name "
                    {...register("name")}
                  />
                  {errors.name && <p className="input-field-error">{errors.name.message}</p>}
                </InputField>

                <InputField label="Snomed Code">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter snomed code"
                      {...register("snomedCode")}
                    />
                    <button type="button" onClick={openSnomedPopupHandler}>
                      <i className="fa-solid fa-magnifying-glass icon-color-button"></i>
                    </button>
                  </div>
                </InputField>

                <InputField label="Investigation Code" {...register("code")}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter investigation code "
                    {...register("code")}
                  />
                </InputField>

                <InputField label="Short Name" {...register("shortName")}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter short name "
                    {...register("shortName")}
                  />
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

                <InputField label="Report Type" required {...register("reportTypeId")}>
                  <select
                    {...register("reportTypeId")}
                    className={` ${disabled ? "disabled-input-field" : "input-field"}`}
                    disabled={disabled}
                    defaultValue={defaultReportType?.value}
                  >
                    {labReportType.map(l => (
                      <option key={l?.key} value={l?.key}>
                        {l?.value}
                      </option>
                    ))}
                  </select>
                  {errors.reportTypeId && (
                    <p className="input-field-error">{errors.reportTypeId.message}</p>
                  )}
                </InputField>

                <InputField label="Test Method">
                  <Select
                    value={selectedTest}
                    options={testMethodOption}
                    placeholder="Select test method"
                    isSearchable
                    isClearable
                    onChange={option => testMethodChangeHandler(option)}
                    styles={SelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </InputField>

                <InputField label="Sample Type" required>
                  <input type="hidden" {...register("sampleTypeList")} />
                  <Select
                    isMulti
                    value={selectedSample}
                    options={sampleTypeOption}
                    placeholder="Select sample type"
                    isSearchable
                    isClearable
                    onChange={sampleTypeChangeHandler}
                    components={{ Option: MultiCheckboxOption }}
                    styles={disabled ? "" : SelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isDisabled={disabled}
                  />

                  {(errors.sampleTypeList || errors.sampleTypeId) && (
                    <p className="input-field-error">
                      {errors.sampleTypeList?.message || errors.sampleTypeId?.message}
                    </p>
                  )}
                </InputField>

                <InputField label="Default Sample Type">
                  <input type="hidden" {...register("sampleTypeId")} />
                  <select
                    className={` ${disabled ? "disabled-input-field" : "input-field"}`}
                    value={selectedDefaultSampleType}
                    onChange={defaultSampleTypeChangeHandler}
                    disabled={disabled}
                    defaultValue={""}
                  >
                    <option value="">Select</option>
                    {selectedSample
                      ?.filter(s => s.value !== 0)
                      .map(s => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                  </select>
                </InputField>

                <InputField label="Gender">
                  <select
                    className="input-field"
                    {...register("forGenderId")}
                    onChange={genderHandler}
                  >
                    <option value={1}>Both</option>
                    <option value={2}>Male</option>
                    <option value={3}>Female</option>
                  </select>
                </InputField>

                <InputField label="Sample Required">
                  <select className="input-field" {...register("isSampleRequired")}>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </InputField>

                <InputField label="Department Receiving">
                  <select
                    {...register("isDepartmentReceivingRequired")}
                    className={` ${disabled ? "disabled-input-field" : "input-field"}`}
                    defaultValue={Status?.INACTIVE}
                    disabled={disabled}
                  >
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </InputField>

                <InputField label="Sample Volume">
                  <input type="hidden" {...register("sampleVolume")} />
                  <select
                    // className="input-field"
                    className={` ${disabled ? "disabled-input-field" : "input-field"}`}
                    value={selectedSampleVolume}
                    onChange={sampleVolumeChangeHandler}
                    disabled={disabled}
                  >
                    <option value="">Select</option>
                    {sampleVolumeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="TAT (in minute)" required>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter TAT minutes "
                    {...register("tatInMin")}
                  />
                  {errors.tatInMin && (
                    <p className="input-field-error">{errors.tatInMin.message}</p>
                  )}
                </InputField>

                <InputField label="Out Sourced">
                  <select className="input-field" {...register("isOutSource")}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </InputField>

                <InputField label="Print Separate">
                  <select className="input-field" {...register("isPrintAlone")}>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </InputField>

                <InputField label="Status" required>
                  <select className="input-field" {...register("isActive")}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                  {errors.isActive && (
                    <p className="input-field-error">{errors.isActive.message}</p>
                  )}
                </InputField>

                <InputField label="Investigation Comment">
                  <textarea
                    className="input-field"
                    placeholder="Enter investigation comment"
                    rows={3}
                    {...register("investigationComment")}
                  />
                </InputField>

                {!!data && (
                  <div className="flex flex-row gap-3 justify-center items-center">
                    <button
                      type="button"
                      className="save-btn"
                      onClick={() =>
                        interpretationPopupHandler(
                          Number(data?.reportTypeId) === 1 ? "Interpretation" : "Template"
                        )
                      }
                    >
                      {Number(data?.reportTypeId) === 1 ? "Interpretation" : "Template"}
                    </button>

                    {Number(data?.reportTypeId) === 1 && (
                      <button
                        type="button"
                        className="save-btn"
                        onClick={observationMappingHandler}
                      >
                        Observation Mapping
                      </button>
                    )}
                  </div>
                )}
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
        </div>
      </div>
      {/* popup */}
      {!!renderPopup && (
        <LabInvestigationPopup
          isOpen={openPopup}
          onClose={closeHandler}
          type={editType}
          data={editableData}
          categoryId={categoryId}
          refreshSubCategory={refreshSubCategory}
          refreshSubSubCategory={refreshSubSubCategory}
        />
      )}

      {/* interpretation popup */}
      {!!renderInterpretation && (
        <InterpretationPopup
          isOpen={openInterpretation}
          onClose={closeInterpretationPopup}
          data={data}
        />
      )}

      {/* template popup */}
      {!!renderTemplate && (
        <TemplatePopup isOpen={openTemplate} onClose={closeTemplatePopup} data={data} />
      )}

      {!!renderSnomedPopup && (
        <SnomedPopup
          isOpen={openSnomedPopup}
          onClose={closeSnomedHandler}
          setData={setSnomedData}
        />
      )}

      {/* loader */}
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default AddLabInvestigation;
