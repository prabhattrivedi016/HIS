import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import ToggleButton from "@/components/toggleButton";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SelectItem, SubSubCategoryItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { ChangeEvent, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import { SubCategoryListItem } from "../labInvestigationMaster/types";
import { CategoryItem, ServiceTableItem } from "./types";

const ServiceMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [serviceTableList, setServiceTableList] = useState<ServiceTableItem[]>([]);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [subCategoryList, setSubCategoryList] = useState<SubCategoryListItem[]>([]);
  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);
  const [serviceName, setServiceName] = useState<string>("");

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SelectItem | null>(null);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<SelectItem | null>(null);

  // get categoryLists
  const getCategories = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryTypeIds: "8,2,1,4,5,10,9" } },
      { component: "ServiceMaster" }
    );
    return resp?.data;
  };

  const { data: categoryList = [] } = useQuery({
    queryKey: ["getCategoryList"],
    queryFn: getCategories,
  });

  //   service item list
  const getServiceItemList = async (
    categoryId: number,
    subCategoryId: number = 0,
    subSubCategoryId: number = 0,
    serviceName: string = ""
  ) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryId, subCategoryId, subSubCategoryId, serviceName } },
      { component: "ServiceMaster" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "No data found");
      setShowTable(false);
      return;
    }
    setShowTable(true);
    setServiceTableList(resp?.data ?? []);
  };

  //   category select handler
  const selectCategoryHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const categoryId = Number(e.target.value);
    if (!categoryId) {
      setShowTable(false);
      setSelectedSubcategory(null);
      setSelectedSubSubCategory(null);
      setSelectedCategoryId(0);
      return;
    }
    setSelectedCategoryId(categoryId);
    setSelectedSubcategory(null);
    setSelectedSubSubCategory(null);
    getServiceItemList(categoryId);
    getSubCategory(categoryId);
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
      { component: "LabInvestigationMaster", silent: true }
    );

    setSubCategoryList(resp?.data ?? []);
  };

  const subCategorySelectOption = useMemo<SelectItem[]>(() => {
    return (
      subCategoryList?.map((d: SubCategoryListItem) => ({
        label: d?.subCategoryName,
        value: d?.subCategoryId,
      })) || []
    );
  }, [subCategoryList]);

  //   sub category select handler
  const subCategorySelectHandler = (option: SelectItem) => {
    if (!option) {
      setSelectedSubcategory(null);
      setSelectedSubSubCategory(null);
      return;
    }
    setSelectedSubcategory(option);
    setSelectedSubSubCategory(null);

    getSubSubcategoryList(option?.value);
    getServiceItemList(selectedCategoryId, option?.value);
  };

  //   sub sub category lists
  const getSubSubcategoryList = async (subCategoryIds: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      {
        component: "LabInvestigationMaster",
      }
    );
    setSubSubCategoryList(resp?.data ?? []);
  };

  const subSubCategorySelectOption = useMemo<SelectItem[]>(() => {
    return (
      subSubCategoryList?.map((d: SubSubCategoryItem) => ({
        label: d?.subSubCategoryName,
        value: d?.subSubCategoryId,
      })) || []
    );
  }, [subSubCategoryList]);

  //   sub sub category list
  const subSubCategorySelectHandler = (option: SelectItem) => {
    setSelectedSubSubCategory(option);
    if (!option) {
      setSelectedSubSubCategory(null);
      return;
    }
    getServiceItemList(selectedCategoryId, selectedSubcategory?.value, option?.value);
  };

  //   service name change handler
  const serviceNameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    setServiceName(value);
    if (value?.length < 3) {
      return;
    }

    debouncedSearch(
      value,
      selectedCategoryId,
      selectedSubcategory?.value ?? 0,
      selectedSubSubCategory?.value ?? 0
    );
  };
  //   debounce function
  const debouncedSearch = useMemo(
    () =>
      debounce(
        (
          serviceName: string,
          categoryId: number,
          subCategoryId: number,
          subSubCategoryId: number
        ) => {
          getServiceItemList(categoryId, subCategoryId, subSubCategoryId, serviceName);
        },
        500
      ),
    []
  );

  // status update handler
  const statusUpdateHandler = async (item: ServiceTableItem) => {
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_SERVICE_ITEM_MASTER_STATUS,
      {},
      { params: { serviceItemId: item?.serviceItemId, isActive: item?.isActive === 1 ? 0 : 1 } },
      { component: "LabInvestigationMaster" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to update status");
      return;
    }
    await getServiceItemList?.(
      selectedCategoryId,
      selectedSubcategory?.value,
      selectedSubSubCategory?.value,
      serviceName
    );

    showSuccess(resp?.message ?? "Data saved successfully");
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-1">
        <div>
          <h1 className="page-heading">Service Master</h1>

          <nav className="helper-text flex items-center gap-2">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Service Master</span>
          </nav>
        </div>

        {/* <button className="save-btn whitespace-nowrap" onClick={addNewInvestigation}>
          Add New Lab Investigation
        </button> */}
      </div>

      {/* Investigation Form */}

      <div className="card mb-1">
        {/* <h2 className="card-title">Investigation Details</h2> */}

        <div className="form-grid-4">
          <InputField label="Category" required>
            <select className="input-field" onChange={selectCategoryHandler}>
              <option value={0}>Select category</option>
              {categoryList?.map((c: CategoryItem) => (
                <option key={c?.categoryId} value={c?.categoryId}>
                  {c?.categoryName}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Sub Category" required>
            <div className="flex gap-2 items-center">
              <Select
                value={selectedSubcategory}
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
                // onClick={() => openPopupHandler("subCategory")}
              >
                <i className="fa-solid fa-circle-plus fa-xl active:scale-95 "></i>
              </button>
            </div>
          </InputField>

          <InputField label="Sub Sub Category" required>
            <div className="flex gap-2 items-center">
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

              <button
                type="button"
                className="-mt-1"
                // onClick={() => openPopupHandler("subCategory")}
              >
                <i className="fa-solid fa-circle-plus fa-xl active:scale-95 "></i>
              </button>
            </div>
          </InputField>

          <InputField label="Service Name" required>
            <input
              type="text"
              className="input-field"
              value={serviceName}
              onChange={serviceNameChangeHandler}
            />
          </InputField>
        </div>
      </div>

      {/*  */}
      {!!serviceTableList && showTable ? (
        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-110 lg:max-h-110">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {ServiceMasterTableHeader.map((header, index) => (
                      <th key={index} className="table-th ">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {serviceTableList.length === 0 ? (
                    <tr>
                      <td colSpan={ServiceMasterTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    serviceTableList.map((item: ServiceTableItem, idx: number) => (
                      <tr key={item.serviceItemId} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.categoryName ?? "-"}</td>
                        <td className="table-td">{item?.subCategoryName ?? "-"}</td>
                        <td className="table-td">{item?.subSubCategoryName ?? "-"}</td>

                        <td className="table-td">{item?.name ?? "-"}</td>
                        <td className="table-td">{item?.code ?? "-"}</td>
                        <td
                          className={`table-td ${
                            Number(item.isActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item.isActive) === 1 ? "Active" : "Inactive"}
                        </td>

                        <td className="table-td">
                          {/* <button type="button" onClick={() => editHandler(item)}> */}
                          <i className="fa-solid fa-edit icon-color-button" />
                          {/* </button> */}
                        </td>
                        <td className="table-td">
                          <div onClick={e => e.stopPropagation()}>
                            <ToggleButton
                              checked={item.isActive === 1}
                              onClick={() => statusUpdateHandler(item)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default ServiceMaster;
