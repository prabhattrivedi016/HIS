import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
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
import Select from "react-select";
import { CategoryItem, ServiceTableItem, SubCategoryItem, SubSubCategoryItem } from "../types";
import CreateUpdatePopup from "./CreateUpdatePopup";

const AddServiceMaster = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: ServiceTableItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const serviceRoomTypeList = usePickMaster("ServiceRoomType")?.pickMasterValue ?? [];

  const opdConsultationVisitType = usePickMaster("OPDConsultationVisitType")?.pickMasterValue ?? [];

  const buttonTitle = data?.serviceItemId ? "Update" : "Create";
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
    },
  });

  const isICU = Number(watch("isICU")) === 1;

  useEffect(() => {}, [data]);

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
      return;
    }
    const selectedRoom = serviceRoomTypeList.find((r: PickMasterItem) => Number(r?.key) === value);
    setValue("roomType", selectedRoom?.value);
    setValue("roomTypeId", Number(selectedRoom?.key));
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

  // snomed code lists
  // const getSnomedCode = async () => {
  //   try {
  //     const resp = await axios.get(
  //       "https://snomedbrowser.org/snowstorm/snomed-ct/browser/MAIN/2026-06-01/descriptions?&limit=25&term=allergy&active=true&conceptActive=true&lang=english&groupByConcept=true",
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Accept: "application/json",
  //         },
  //       }
  //     );

  //     console.log("resp of snomed code", resp?.data);
  //     return resp?.data;
  //   } catch (error) {
  //     console.error(error, "failed to fetch snomed code");
  //   }
  // };

  const getSnomedCode = async () => {
    try {
      const params = new URLSearchParams({
        limit: "25",
        term: "allergy",
        active: "true",
        conceptActive: "true",
        lang: "english",
        groupByConcept: "true",
      });

      const response = await fetch(
        `https://snomedbrowser.org/snowstorm/snomed-ct/browser/MAIN/2026-06-01/descriptions?${params}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      console.log("snomed code", response.json());
      return await response.json();
    } catch (error) {
      console.error("failed to fetch snomed code", error);
      return [];
    }
  };

  const { data: snomedCode } = useQuery({
    queryKey: ["getSnomedCode"],
    queryFn: getSnomedCode,
  });

  // submit handler
  const onsubmit = async (formData: createUpdateServiceMasterFormItem) => {
    console.log("formData", formData);
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
          <div className="card m-1">
            <form onSubmit={handleSubmit(onsubmit)}>
              <div className="form-grid-2">
                <InputField label="Category">
                  <div className="flex gap-2 items-center">
                    <select
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
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter snomed code"
                    {...register("snomedCode")}
                  />
                </InputField>

                {!!categoryTypeId && categoryTypeId === 1 && (
                  <>
                    <InputField label="OPD Consultation Type">
                      <select
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
                      <select className="input-field" onChange={roomTypeSelectHandler}>
                        <option value={0}>Select room type</option>
                        {serviceRoomTypeList?.map((s: PickMasterItem) => (
                          <option key={s?.key} value={s?.key}>
                            {s?.value}
                          </option>
                        ))}
                      </select>
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
                  Save
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

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(AddServiceMaster);
