import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import InputFieldModal from "@/components/inputFieldModal";
import { ENDPOINTS } from "@/config/defaults";
import { OpdBillingServiceTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SelectItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
  CategoryItem,
  DoctorItem,
  IpdPatientItem,
  ServiceItemList,
  SubCategoryItem,
  SubSubCategoryItem,
} from "../types";

const IpdBillingComponent = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number>(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SelectItem | null>(null);
  const [selectedSubSubCategoryId, setSelectedSubSubCategoryId] = useState<number>(0);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<SelectItem | null>(null);

  const currentDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [fromDate, setFromDate] = useState<string>(currentDate);
  const [toDate, setToDate] = useState<string>(currentDate);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [serviceNameList, setServiceNameList] = useState<ServiceItemList[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(0);
  const [serviceDataTableItem, setServiceDataTableItem] = useState<any[]>([]);

  //   doctor
  const getDoctorByBranchId = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID,
      {},
      { params: { branchId: patient?.BranchId, isDoctorUnit: 0 } },
      { component: "IpdBillingComponent" }
    );
    return resp?.data ?? [];
  };

  const { data: doctorLists } = useQuery({
    queryKey: ["doctor-lists"],
    queryFn: getDoctorByBranchId,
    enabled: !!patient?.BranchId,
  });

  const doctorSelectOption = useMemo(() => {
    return doctorLists?.map((doctor: DoctorItem) => ({
      value: doctor.doctorId,
      label: doctor.name,
    }));
  }, [doctorLists]);

  //   category lists
  const getCategoryLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryTypeIds: "1,3,4,5,8,9,10,11,12" } },
      { component: "IpdBillingComponent" }
    );
    return resp?.data ?? [];
  };

  const { data: categoryLists = [] } = useQuery({
    queryKey: ["category-lists"],
    queryFn: getCategoryLists,
  });

  //   category change handler
  const categoryChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedCategoryId(value);
    setSelectedSubCategoryId(0);
    setSelectedSubCategory(null);
    setSelectedSubSubCategoryId(0);
    setSelectedSubSubCategory(null);
  };

  //   sub category
  const getSubCategoryByCategoryId = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      { params: { categoryIds: selectedCategoryId } },
      { component: "IpdBillingComponent" }
    );
    return resp?.data ?? [];
  };

  const { data: subCategoryLists } = useQuery({
    queryKey: ["sub-category-lists", selectedCategoryId],
    queryFn: getSubCategoryByCategoryId,
    enabled: !!selectedCategoryId,
  });

  const subCategorySelectOption = useMemo(() => {
    return subCategoryLists?.map((subCategory: SubCategoryItem) => ({
      value: subCategory.subCategoryId,
      label: subCategory.subCategoryName,
    }));
  }, [subCategoryLists]);

  //   sub category select handler
  const subCategoryChangeHandler = (option: SelectItem | null) => {
    if (option) {
      setSelectedSubCategoryId(Number(option.value));
      setSelectedSubCategory(option);
    } else {
      setSelectedSubCategoryId(0);
      setSelectedSubCategory(null);
    }
    setSelectedSubSubCategoryId(0);
    setSelectedSubSubCategory(null);
  };

  //   sub sub category
  const getSubSubCategoryList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds: selectedSubCategoryId } },
      { component: "IpdBillingComponent" }
    );
    return resp?.data ?? [];
  };

  const { data: subSubCategoryLists } = useQuery({
    queryKey: ["sub-sub-category-lists", selectedSubCategoryId],
    queryFn: getSubSubCategoryList,
    enabled: !!selectedSubCategoryId,
  });

  const subSubCategorySelectOption = useMemo(() => {
    return subSubCategoryLists?.map((subSubCategory: SubSubCategoryItem) => ({
      value: subSubCategory.subSubCategoryId,
      label: subSubCategory.subSubCategoryName,
    }));
  }, [subSubCategoryLists]);

  //   sub sub category select handler
  const subSubCategoryChangeHandler = (option: SelectItem | null) => {
    if (option) {
      setSelectedSubSubCategoryId(Number(option.value));
      setSelectedSubSubCategory(option);
    } else {
      setSelectedSubSubCategoryId(0);
      setSelectedSubSubCategory(null);
    }
  };

  //   service item select handler
  const serviceItemHandler = async (e: ChangeEvent<HTMLInputElement>) => {
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

  // debounced api call
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
              categoryId: selectedCategoryId || 0,
              subCategoryId: selectedSubCategoryId || 0,
              subSubCategoryId: selectedSubSubCategoryId || 0,
              isActive: 1,
            },
          },
          { component: "IpdBillingComponent" }
        );

        setServiceNameList(resp?.data ?? []);
        setShowPopup(true);
        setActiveServiceIndex(0);
      } catch (err) {
        console.error(err);
        setShowPopup(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategoryId, selectedSubCategoryId, selectedSubSubCategoryId]);

  const serviceInputKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      const selectedService = serviceNameList[activeServiceIndex];
      if (selectedService) {
        selectedServiceHandler(selectedService);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setShowPopup(false);
      setActiveServiceIndex(0);
    }
  };

  const selectedServiceHandler = async (item: ServiceItemList) => {
    setShowPopup(false);
    setSearchTerm("");

    const isAlreadyAdded = serviceDataTableItem.some(s => s?.serviceItemId === item?.serviceItemId);
    if (isAlreadyAdded) {
      alert("Service is already added, Please select another service");
      return;
    }

    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING,
        {},
        {
          params: {
            branchId: patient?.BranchId,
            corporateId: patient?.CorporateId || 0,
            doctorId: patient?.PrimaryDoctorId || 0,
            serviceItemId: item?.serviceItemId,
            categoryId: item?.categoryId,
            subCategoryId: item?.subCategoryId,
            subSubCategoryId: item?.subSubCategoryId,
            bedTypeId: 0,
          },
        },
        { component: "IpdBillingComponent" }
      );

      if (resp?.data) {
        const data = resp.data;
        const newRow = {
          rate: Number(data.rate ?? 0),
          rateListId: Number(data.rateListId ?? 0),
          isRateEditable: Number(data.isRateEditable ?? 0),
          serviceName: data.serviceName || item.name,
          code: data.code || item.code,
          corporateAlias: data.corporateAlias || "",
          corporateCode: data.corporateCode || "",
          validityDays: Number(data.validityDays ?? 0),
          discountPer: 0,
          discountReason: "",
          isNonPayable: Number(data.isNonPayable ?? 0),
          serviceItemId: item.serviceItemId,
          corporateId: patient?.CorporateId || 0,
          categoryTypeId: Number(data.categoryTypeId ?? item.categoryTypeId),
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId,
          subSubCategoryId: item.subSubCategoryId,
          isCorporateDiscount: Number(data.isCorporateDiscount ?? 0),
          gstPer: Number(data.gstPer ?? 0),
          sampleTypeId: Number(data.sampleTypeId ?? 0),
          reportTypeId: Number(data.reportTypeId ?? 0),
          doctorDepartmentIds: data.doctorDepartmentIds || "",
          isRequiredSeparatePerformingDoctor: Number(data.isRequiredSeparatePerformingDoctor ?? 0),
          doctorId: Number(patient?.PrimaryDoctorId || 0),
          doctorName: patient?.PrimaryDoctor || "",
          qty: 1,
          dis: 0,
          netAmount: Number(data.rate ?? 0),
          isUrgent: 0,
          isUnderPackage: 0,
          remarks: "",
        };

        setServiceDataTableItem(prev => [...prev, newRow]);
      }
    } catch (error) {
      console.error("Failed to load service details:", error);
    }
  };

  const deleteHandler = (index: number) => {
    setServiceDataTableItem(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="form-grid-4">
        <InputField label="Doctor">
          <Select
            options={doctorSelectOption}
            name="doctorId"
            value={
              patient?.PrimaryDoctorId
                ? doctorSelectOption?.find(
                    (opt: any) => Number(opt.value) === Number(patient.PrimaryDoctorId)
                  ) || null
                : null
            }
            // onChange={handleDoctorChange}
            placeholder="Select Doctor"
            styles={SelectStyles as any}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Service Category" required>
          <select className="input-field" onChange={categoryChangeHandler}>
            <option value={0}>All Category</option>
            {categoryLists.map((c: CategoryItem) => (
              <option key={c?.categoryId} value={c?.categoryId}>
                {c?.categoryName}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Service Sub Category" required>
          <Select
            options={subCategorySelectOption}
            name="subCategoryId"
            value={
              selectedSubCategoryId
                ? subCategorySelectOption?.find(
                    (opt: any) => Number(opt.value) === Number(selectedSubCategoryId)
                  ) || null
                : null
            }
            onChange={subCategoryChangeHandler}
            placeholder="Select Sub Category"
            styles={SelectStyles as any}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Service Sub Sub Category" required>
          <Select
            options={subSubCategorySelectOption}
            name="subSubCategoryId"
            value={
              selectedSubSubCategoryId
                ? subSubCategorySelectOption?.find(
                    (opt: any) => Number(opt.value) === Number(selectedSubSubCategoryId)
                  ) || null
                : null
            }
            onChange={subSubCategoryChangeHandler}
            placeholder="Select Sub Sub Category"
            styles={SelectStyles as any}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>
        <InputField label="From Date">
          <CustomDateInput value={fromDate} onChange={setFromDate} />
        </InputField>
        <InputField label="To Date">
          <CustomDateInput value={toDate} onChange={setToDate} />
        </InputField>
        <InputField label="Search Service">
          <div className="relative">
            <input
              type="text"
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
      </div>
      <div className="m-1">
        {/* table */}
        <div className="w-full ">
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-6 px-3 py-2 text-md justify-between">
              <div className="flex items-center gap-1 text-orange-500">
                <span className="w-3 h-3 rounded-full opd-zero-rate border border-orange-300"></span>
                Rate Not Set
              </div>

              {/* <div className="flex items-center gap-1 text-purple-500">
                <span className="w-3 h-3 rounded-full opd-package border border-purple-300"></span>
                Consultation Under Package
              </div> */}

              <div className="flex items-center gap-1 text-blue-500">
                <span className="w-3 h-3 rounded-full opd-non-payable border border-blue-300"></span>
                Corporate Non-Payable
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <span className="w-3 h-3 rounded-full opd-corporate-discount border border-gray-300"></span>
                Corporate Wise Discount
              </div>

              <div className="flex items-center gap-1 text-pink-400">
                <span className="w-3 h-3 rounded-full opd-privileged-card-discount border border-pink-300"></span>
                Privileged Card Discount
                <span className="text-red-500 ml-1">ⓘ</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="table-container ">
                <div className="table-scroll-wrapper ">
                  <div className="table-size lg:min-h-80 lg:max-h-80 w-full">
                    <table className="base-table ">
                      <thead className="table-head">
                        <tr>
                          {OpdBillingServiceTableHeader.map((h, index) => (
                            <th key={index} className="table-th ">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {serviceDataTableItem?.length === 0 && (
                          <tr>
                            <td
                              colSpan={OpdBillingServiceTableHeader.length}
                              className="table-empty"
                            >
                              No records found
                            </td>
                          </tr>
                        )}

                        {serviceDataTableItem.map((item, idx: number) => {
                          const isQtyFixed = [1, 3, 11].includes(Number(item?.categoryTypeId));
                          const isDiscountLocked = Number(item?.isDiscountLocked ?? 0) === 1;

                          return (
                            <tr
                              key={idx}
                              className={`table-row`}
                              onDoubleClick={() => {
                                deleteHandler(idx);
                              }}
                            >
                              <td className="table-td">{idx + 1}</td>
                              <td className="table-td ">
                                <div className="flex items-center justify-between ">
                                  <span>{item?.serviceName || "-"}</span>
                                </div>
                              </td>
                              <td className="table-td">{item?.code || "-"}</td>
                              <td className="table-td max-w-35">{item?.doctorName || "-"}</td>
                              <td className="table-td">
                                <input
                                  className={`max-w-20 max-h-10 ${
                                    isQtyFixed
                                      ? "disabled-input-field cursor-not-allowed"
                                      : "input-field"
                                  }`}
                                  value={item?.qty ?? 1}
                                  //   onChange={e => qtyChangeHandler(idx, e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") {
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  disabled={isQtyFixed}
                                  readOnly={isQtyFixed}
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  value={item?.rate ?? 0}
                                  //   onChange={e => rateChangeHandler(idx, e.target.value)}
                                  className={`max-w-20 max-h-10 ${
                                    item?.isRateEditable === 1
                                      ? "input-field "
                                      : "disabled-input-field cursor-not-allowed"
                                  }`}
                                  disabled={item?.isRateEditable !== 1}
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  className={`${
                                    item?.discountPer === 1 || isDiscountLocked
                                      ? "disabled-input-field max-w-20 max-h-10"
                                      : "input-field max-w-20 max-h-10"
                                  }`}
                                  value={item?.discountPer ?? 0}
                                  //   onChange={e =>
                                  //     discountPercentageChangeHandler(idx, e.target.value)
                                  //   }
                                  disabled={
                                    isDiscountLocked || Number(item?.isDisabledItem ?? 0) === 1
                                  }
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  className={`${
                                    isDiscountLocked
                                      ? "disabled-input-field max-w-20 max-h-10"
                                      : "input-field max-w-20 max-h-10"
                                  }`}
                                  value={item?.dis ?? 0}
                                  //   onChange={e => discountChangeHandler(idx, e.target.value)}
                                  //   disabled={
                                  //     isDiscountLocked || Number(item?.isDisabledItem ?? 0) === 1
                                  //   }
                                />
                              </td>
                              <td className="table-td input-field-error">
                                {item?.netAmount ?? item?.rate}
                              </td>

                              <td className="table-td">
                                <input
                                  className={`input-field max-w-40 max-h-10 ${
                                    Number(item?.isDisabledItem ?? 0) === 1
                                      ? "disabled-input-field cursor-not-allowed"
                                      : ""
                                  }`}
                                  value={item?.remarks ?? ""}
                                  //   onChange={e => remarksChangeHandler(idx, e.target.value)}
                                  placeholder="Enter remarks"
                                  disabled={Number(item?.isDisabledItem ?? 0) === 1}
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={Boolean(item?.isUrgent)}
                                  onChange={e => urgentChangeHandler(idx, e.target.checked)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* {!!showDuplicateError && <p className="input-field-error">{showDuplicateError}</p>}
                    {!!serviceValidationError && (
                      <p className="input-field-error">{serviceValidationError}</p>
                    )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IpdBillingComponent;
