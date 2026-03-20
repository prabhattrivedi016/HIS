import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, PATIENT_TYPE, TARIFF_MANAGER_GET_CATEGORY } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { handleMultiSelectWithAll } from "@/utils/multiSelectAllHandler";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Select, { GroupBase, SingleValue, StylesConfig } from "react-select";

import CustomLoader from "@/components/customLoader";
import { TariffManagerTableHeader } from "@/constants/tableHeaders";
import { showError, showSuccess } from "@/utils/alert";
import {
  BedTypeItem,
  CategoryItem,
  PickMasterValue,
  RateListTableItem,
  searchTableItem,
  SelectItem,
  SubCategoryItem,
  SubSubCategoryItem,
} from "../types";
import EditableCell from "./EditTableCell";

const GRID_COLS = "40px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr";

const AllServices = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const getType = usePickMaster("TariffPatientType");
  const getTypeValue = getType?.pickMasterValue ?? ([] as PickMasterValue[]);

  const defaultPatientType = getTypeValue?.find(b => b?.key === "OPD");

  const [selectedPatientType, setSelectedPatientType] = useState<string>("");

  const typeChangeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    setSelectedPatientType(value);

    setIsDisabled(value === "OPD");
  };

  useEffect(() => {
    if (defaultPatientType?.key) {
      setSelectedPatientType(defaultPatientType.key);

      // set disable correctly
      setIsDisabled(defaultPatientType.key === "OPD");
    }
  }, [defaultPatientType]);

  const [rateListData, setRateListData] = useState<RateListTableItem[]>([]);
  const [selectedRateList, setSelectedRateList] = useState<SingleValue<SelectItem>>(null);

  const [categoryList, setCategoryList] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SingleValue<SelectItem>>(null);

  const [subCategoryList, setSubCategoryList] = useState<SubCategoryItem[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SingleValue<SelectItem>>(null);

  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);
  const [selectedSubSubCategory, setSelectedSubSubCategory] =
    useState<SingleValue<SelectItem>>(null);

  const [bedTypeList, setBedTypeList] = useState<BedTypeItem[]>([]);
  const [selectedBedType, setSelectedBedType] = useState<SelectItem[]>([]);
  const [selectedBedIds, setSelectedBedIds] = useState<string>("");

  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [searchTableData, setSearchTableData] = useState<searchTableItem[]>([]);

  const [bulkEditable, setBulkEditable] = useState<string>("");
  const [isCopyRateForIPD, setIsCopyRateForIPD] = useState<number>(0);
  const [originalData, setOriginalData] = useState<searchTableItem[]>([]);
  const [showTable, setShowTable] = useState<boolean>(false);

  const [serviceName, setServiceName] = useState<string>("");

  //   get rate master list
  const getRateList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_RATE_LIST_MASTER,
      {},
      {},
      { component: "RateListMaster", silent: true }
    );
    setRateListData(resp?.data ?? []);
  };
  useEffect(() => {
    getRateList();
    getBedType();
  }, []);

  useEffect(() => {
    if (selectedPatientType === PATIENT_TYPE?.OPD) {
      getCategory(TARIFF_MANAGER_GET_CATEGORY?.OUT_PATIENT);
      setSelectedBedType([]);
    } else if (selectedPatientType === PATIENT_TYPE?.IPD) {
      getCategory(TARIFF_MANAGER_GET_CATEGORY?.IN_PATIENT);
    }
  }, [selectedPatientType]);

  //   rate select option
  const rateListSelectOption = useMemo(() => {
    return rateListData?.map(r => ({
      label: r?.rateListName,
      value: r?.rateListId,
    }));
  }, [rateListData]);

  //   rate select handler
  const rateSelectHandler = (option: SingleValue<SelectItem>) => {
    if (!option) return;
    setSelectedRateList(option);
  };

  //   get category
  const getCategory = async (categoryIds: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryIds } },
      { component: "AllServices" }
    );
    setCategoryList(resp?.data ?? []);
  };

  //   category select option
  const categorySelectOption = useMemo(() => {
    return categoryList?.map(r => ({
      label: r?.categoryName,
      value: r?.categoryId,
    }));
  }, [categoryList]);

  //   category select handler
  const categorySelectHandler = (option: SingleValue<SelectItem>) => {
    if (!option) return;
    setSelectedCategory(option);

    getSubCategory(option?.value);
  };

  //   get sub category
  const getSubCategory = async (categoryId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      { params: { categoryId } },
      { component: "AllServices" }
    );
    setSubCategoryList(resp?.data ?? []);
  };

  //   sub category select option
  const subCategorySelectOption = useMemo(() => {
    return subCategoryList?.map(r => ({
      label: r?.subCategoryName,
      value: r?.subCategoryId,
    }));
  }, [subCategoryList]);

  //  sub category select handler
  const subCategorySelectHandler = (option: SingleValue<SelectItem>) => {
    setSelectedSubCategory(option);
    if (!option) return;
    getSubSubCategory(option?.value);
  };

  //   sub sub category
  const getSubSubCategory = async (subCategoryId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryId } },
      { component: "AllServices" }
    );
    setSubSubCategoryList(resp?.data ?? []);
  };

  //   sub sub category select option
  const subSubCategorySelectOption = useMemo(() => {
    return subSubCategoryList?.map(r => ({
      label: r?.subSubCategoryName,
      value: r?.subSubCategoryId,
    }));
  }, [subSubCategoryList]);

  //  sub category select handler
  const subSubCategorySelectHandler = (option: SingleValue<SelectItem>) => {
    setSelectedSubSubCategory(option);
  };

  //   bed type
  const getBedType = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryId: CATEGORY_ID?.bedType } },
      { component: "AllServices" }
    );
    setBedTypeList(resp?.data ?? []);
  };

  //   bed type select option
  const bedTypeSelectOption = useMemo<readonly SelectItem[]>(() => {
    return [
      { label: "All", value: 0 },
      ...bedTypeList.map(b => ({
        label: b?.name,
        value: b?.serviceItemId,
      })),
    ];
  }, [bedTypeList]);

  //  bed type select handler

  const bedTypeSelectHandler = (options: SelectItem[] | null) => {
    const result = handleMultiSelectWithAll(options ?? [], selectedBedType, bedTypeSelectOption);

    setSelectedBedType(result.selectedOptions);

    const ids = result.selectedOptions.map(o => o.value).join(",");

    setSelectedBedIds(ids);
  };

  // service name handler
  const serviceNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!name) return;
    setServiceName(name);
  };

  //   search  button
  const getTableDataBySearch = async (e: FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    if (!selectedRateList || !selectedCategory) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_TARIFF_MASTER,
      {},
      {
        params: {
          rateListId: selectedRateList?.value,
          patientType: selectedPatientType,
          bedTypeId: selectedBedIds ?? 0,
          categoryId: selectedCategory?.value,
          subCategoryId: selectedSubCategory?.value,
          subSubCategoryId: selectedSubSubCategory?.value,
          serviceName: serviceName ?? "",
        },
      }
    );

    setSearchTableData(resp?.data ?? []);
    setOriginalData(resp?.data ?? []);
    setShowTable(true);
    setIsSearching(false);
  };

  // virtualizer
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: searchTableData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // update row
  const updateRow = (index: number, field: string, value: any) => {
    setSearchTableData(prev => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        [field]: value,
      };
      return newData;
    });
  };

  const TableHeader = () => (
    <div
      className="grid  text-gray-800 font-bold text-md px-2 py-1 border-b bg-blue-100 border-blue-200 rounded-sm"
      style={{ gridTemplateColumns: GRID_COLS }}
    >
      {TariffManagerTableHeader.map((col, i) => (
        <div key={i} className="px-2 ">
          {col}
        </div>
      ))}
    </div>
  );

  const Row = ({ virtualRow }: any) => {
    const row = searchTableData[virtualRow.index];

    return (
      <div
        className="grid text-sm px-2 items-center hover:bg-gray-50 overflow-hidden"
        style={{
          gridTemplateColumns: GRID_COLS,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `${virtualRow.size + 2}px`,
          transform: `translateY(${virtualRow.start + 2}px)`,
        }}
      >
        <div className="px-2 text-gray-500">{virtualRow.index + 1}</div>

        <div className="px-2 ">{row?.RateList}</div>
        <div className="px-2 ">{row?.BedType}</div>
        <div className="px-2 ">{row?.Category}</div>
        <div className="px-2 ">{row?.SubCategory}</div>
        <div className="px-2 ">{row?.SubSubCategory}</div>
        <div className="px-2 ">{row?.ServiceItemName}</div>

        {/*editable */}
        <div className="px-1">
          <EditableCell
            value={row?.Alias ?? ""}
            field="Alias"
            onSave={(f, v) => updateRow(virtualRow.index, f, v)}
          />
        </div>

        <div className="px-1">
          <EditableCell
            value={row?.ServiceCode}
            field="ServiceCode"
            onSave={(f, v) => updateRow(virtualRow.index, f, v)}
          />
        </div>

        <div className="px-1">
          <EditableCell
            value={row?.Rate ?? 0}
            field="Rate"
            type="number"
            onSave={(f, v) => updateRow(virtualRow.index, f, v)}
          />
        </div>

        <div className="px-1">
          <EditableCell
            value={row?.EmergencyCharges ?? 0}
            field="EmergencyCharges"
            type="number"
            onSave={(f, v) => updateRow(virtualRow.index, f, v)}
          />
        </div>

        <div className="px-1">
          <EditableCell
            value={row?.IsRateEditable}
            field="IsRateEditable"
            type="select"
            onSave={(f, v) => updateRow(virtualRow.index, f, v)}
          />
        </div>
      </div>
    );
  };

  // bulk edit
  const handleBulkEditableChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = String(e.target.value);

    setBulkEditable(value);

    setSearchTableData((prev: any) =>
      prev.map((row: searchTableItem) => ({
        ...row,
        IsRateEditable: value,
      }))
    );
  };

  // create payload
  const createPayload = () => {
    return {
      isCopyRateForIPD: isCopyRateForIPD,

      tariffMasterData: searchTableData.map(row => ({
        tariffId: row?.TariffId ?? 0,

        rateListId: row?.RatelistId ?? selectedRateList?.value ?? 0,

        serviceItemId: row?.ServiceItemId ?? 0,
        bedTypeId: row?.BedTypeId ?? 0,

        alias: row?.Alias ?? "",
        serviceCode: row?.ServiceCode ?? "",

        doctorId: row?.DoctorId ?? 0,
        validityDays: row?.ValidityDays ?? 0,

        rate: isNaN(Number(row?.Rate)) ? 0 : Number(row?.Rate),

        isRateEditable:
          row?.IsRateEditable === "Yes" || row?.IsRateEditable === 1 || row?.IsRateEditable === true
            ? 1
            : 0,

        isActive: 1,
      })),
    };
  };

  // save handler
  const handleSave = async () => {
    const payload = createPayload();
    if (payload?.tariffMasterData?.length === 0) return;
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_TARIFF_MASTER,
      payload,
      {},
      { component: "AllServices" }
    );
    if (!resp?.result) {
      showError(error?.message ?? "Something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    searchCancelHandler?.();
    setShowTable(false);
  };

  // cancel handler
  const handleCancel = () => {
    setSearchTableData(originalData);
  };

  // search cancel handler
  const searchCancelHandler = () => {
    setSelectedRateList(null);
    setSelectedPatientType(PATIENT_TYPE?.OPD);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);
    setIsDisabled(true);
  };

  return (
    <>
      <div className="card -mt-3">
        <h2 className="card-title ">Tariff Search Details</h2>

        <form>
          <div className="form-grid-4">
            <InputField label="Rate List" required>
              <Select
                value={selectedRateList}
                options={rateListSelectOption}
                placeholder="Select rate list"
                isSearchable
                isClearable
                onChange={(option: any) => rateSelectHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {!!isSearching && !selectedRateList && (
                <p className="input-field-error">{"Select one rate list"}</p>
              )}
            </InputField>

            <InputField label="Type" required>
              <select
                className="input-field"
                value={selectedPatientType}
                onChange={typeChangeSelectHandler}
              >
                {getTypeValue?.map(t => (
                  <option key={t?.key} value={t?.key}>
                    {t?.value}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Category" required>
              <Select
                value={selectedCategory}
                options={categorySelectOption}
                placeholder="Select category"
                isSearchable
                isClearable
                onChange={(option: any) => categorySelectHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {!!isSearching && !selectedCategory && (
                <p className="input-field-error">{"Select one category"}</p>
              )}
            </InputField>

            <InputField label="Sub Category" required>
              <Select
                value={selectedSubCategory}
                options={subCategorySelectOption}
                placeholder="Select sub category"
                isSearchable
                isClearable
                onChange={(option: any) => subCategorySelectHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Sub sub category" required>
              <Select
                value={selectedSubSubCategory}
                options={subSubCategorySelectOption}
                placeholder="Select sub sub category"
                isSearchable
                isClearable
                onChange={(option: any) => subSubCategorySelectHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Service Name Like">
              <input
                type="text"
                className="input-field"
                placeholder="Enter service name "
                onChange={serviceNameHandler}
              />
            </InputField>

            <InputField label="Bed Type">
              <Select<SelectItem, true, GroupBase<SelectItem>>
                value={selectedBedType}
                isMulti
                options={bedTypeSelectOption}
                placeholder="Select bed type"
                isSearchable
                isClearable
                onChange={(option: any) => bedTypeSelectHandler(option)}
                styles={
                  isDisabled
                    ? undefined
                    : (SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>)
                }
                menuPortalTarget={document.body}
                components={{ Option: MultiCheckboxOption }}
                menuPosition="fixed"
                isDisabled={isDisabled}
              />
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn" onClick={getTableDataBySearch}>
              Search
            </button>
            <button type="button" className="cancel-button " onClick={searchCancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* table */}
      {!!searchTableData && showTable && (
        <div className="border border-gray-300 mt-1 rounded-lg card">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h1 className="card-title">Tariffs</h1>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-md font-medium">Copy Rate To IPD</span>
                <input
                  type="checkbox"
                  onChange={e => setIsCopyRateForIPD(e.target.checked ? 1 : 0)}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-md font-medium">Set Rate Editable For All</span>
                <select
                  className="border px-2 py-1 text-sm rounded"
                  value={bulkEditable}
                  onChange={handleBulkEditableChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          {/*table header*/}
          <TableHeader />

          {/* body*/}
          <div ref={parentRef} className="max-h-[500px] min-h-30 overflow-auto relative">
            {!!searchTableData && searchTableData.length > 0 ? (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map(virtualRow => (
                  <Row key={virtualRow.key} virtualRow={virtualRow} />
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 text-lg ">No Data Found</p>
              </div>
            )}
          </div>

          {/* buttons */}
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn" onClick={handleSave}>
              Save
            </button>
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {!!loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default AllServices;
