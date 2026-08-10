import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { OptionItem as CustomOptionItem, SelectStyles } from "@/components/customSelect";
import ToggleButton from "@/components/toggleButton";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { ChangeEvent, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select, { MultiValue, SingleValue } from "react-select";
import AddPackageMaster from "./components/AddPackageMaster";
import { CategoryItem, ServiceTableItem, SubcategoryItem, SubSubCategoryItem } from "./types";

const PackageMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [selectedcategoryId, setSelectedcategoryId] = useState<number>(0);
  const [selectedSubCategory, setSelectedSubcategory] = useState<
    SingleValue<CustomOptionItem> | MultiValue<CustomOptionItem>
  >(null);
  const [selectedSubSubCategory, setSelectedSubSubcategory] = useState<
    SingleValue<CustomOptionItem> | MultiValue<CustomOptionItem>
  >(null);

  const [serviceName, setServiceName] = useState("");
  const [debouncedServiceName, setDebouncedServiceName] = useState("");
  const [showTable, setShowtable] = useState<boolean>(false);

  const [openAddPackageDrawer, setOpenAddPackageDrawer] = useState<boolean>(false);
  const [renderAddPackageDrawer, setRenderAddPackageDrawer] = useState<boolean>(false);

  const [selectedItem, setSelectedItem] = useState<ServiceTableItem | null>(null);

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

  const { data: categoryList } = useQuery({
    queryKey: ["getCategoryList"],
    queryFn: getCategoryList,
  });

  //   category change handler
  const categoryChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedcategoryId(0);
      setSelectedSubcategory(null);
      setSelectedSubSubcategory(null);
      setShowtable(false);
      return;
    }
    setSelectedcategoryId(value);
    setSelectedSubcategory(null);
    setSelectedSubSubcategory(null);
  };

  // sub category list
  const getSubCategoryList = async (categoryIds: number) => {
    if (categoryIds <= 0) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      { params: { categoryIds } }
    );
    return resp?.data ?? [];
  };

  const { data: subCategoryList } = useQuery({
    queryKey: ["getSubCategoryList", selectedcategoryId],
    queryFn: () => getSubCategoryList(selectedcategoryId),
    enabled: !!selectedcategoryId,
  });

  const subCategorySelectOption = useMemo<CustomOptionItem[]>(() => {
    return (
      subCategoryList?.map((item: SubcategoryItem) => ({
        label: item?.subCategoryName,
        value: item?.subCategoryId,
      })) || []
    );
  }, [subCategoryList]);

  //   sub category select handler
  const subCategorySelectHandler = (
    option: SingleValue<CustomOptionItem> | MultiValue<CustomOptionItem>
  ) => {
    if (!option) {
      setSelectedSubcategory(null);
      setSelectedSubSubcategory(null);
      return;
    }
    setSelectedSubcategory(option);
    setSelectedSubSubcategory(null);
  };

  //sub sub category
  const getSubSubCategoryList = async (subCategoryIds: number) => {
    if (subCategoryIds <= 0) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      { component: "PackageMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: subSubCategoryList } = useQuery({
    queryKey: ["getSubSubCategoryList", selectedSubCategory],
    queryFn: () => getSubSubCategoryList(Number(selectedSubCategory?.value ?? 0)),
    enabled: !!selectedSubCategory,
  });

  const subSubCategorySelectOption = useMemo<CustomOptionItem[]>(() => {
    return (
      subSubCategoryList?.map((item: SubSubCategoryItem) => ({
        label: item?.subSubCategoryName,
        value: item?.subSubCategoryId,
      })) || []
    );
  }, [subSubCategoryList]);

  //   sub sub category select handler
  const subSubCategorySelectHandler = (
    option: SingleValue<CustomOptionItem> | MultiValue<CustomOptionItem>
  ) => {
    if (!option) {
      setSelectedSubSubcategory(null);
      return;
    }
    setSelectedSubSubcategory(option);
  };

  // debounce search function
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedServiceName(value);
      }, 500),
    []
  );

  //   service change handler
  const serviceNameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setServiceName(value);

    if (value.trim() !== "" && value.trim().length <= 2) {
      return;
    }
    debouncedSearch(value);
  };

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
          categoryTypeId: "11,12",
          isActive: 1,
        },
      },
      { component: "PackageMaster" }
    );
    if (!resp?.result) {
      setShowtable(false);
      showWarning(resp?.message ?? "No data found");
      return;
    }
    setShowtable(true);
    return resp?.data ?? [];
  };

  const { data: serviceTableList = [], refetch: refetchPackageList } = useQuery({
    queryKey: [
      "getServiceItemListForPackage",
      selectedcategoryId,
      selectedSubCategory,
      selectedSubSubCategory,
      debouncedServiceName,
    ],
    queryFn: () =>
      getServiceItemList(
        selectedcategoryId,
        Number(selectedSubCategory?.value ?? 0),
        Number(selectedSubSubCategory?.value ?? 0),
        debouncedServiceName
      ),
    enabled: selectedcategoryId > 0 || serviceName.trim().length > 2,
  });

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
    void refetchPackageList();

    showSuccess(resp?.message ?? "Data saved successfully");
  };

  //   add package handler
  const addNewPackageHandler = (item: ServiceTableItem | null) => {
    if (item === null || !item) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
    setRenderAddPackageDrawer(true);
    setOpenAddPackageDrawer(true);
  };

  //   close add package handler
  const closeAddPackageHandler = () => {
    setSelectedItem(null);
    setOpenAddPackageDrawer(false);
    setTimeout(() => {
      setRenderAddPackageDrawer(false);
    }, 300);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-1">
        <div>
          <h1 className="page-heading">Package Master</h1>

          <nav className="helper-text flex items-center gap-2">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Package Master</span>
          </nav>
        </div>

        <button className="save-btn whitespace-nowrap" onClick={() => addNewPackageHandler(null)}>
          Add New Package
        </button>
      </div>
      {/* form data */}
      <div className="form-grid-4 card">
        <InputField label="Category">
          <select className="input-field" onChange={categoryChangeHandler}>
            <option value={0}>--Select--</option>
            {categoryList?.map((item: CategoryItem) => (
              <option key={item?.categoryId} value={item?.categoryId}>
                {item?.categoryName}
              </option>
            ))}
          </select>
        </InputField>
        <InputField label="Sub Category" required>
          <Select
            value={selectedSubCategory}
            options={subCategorySelectOption}
            placeholder="Select sub category"
            isSearchable
            isClearable
            onChange={option => subCategorySelectHandler(option)}
            styles={SelectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>
        <InputField label="Sub Sub Category">
          <Select
            value={selectedSubSubCategory}
            options={subSubCategorySelectOption}
            placeholder="Select sub sub category"
            isSearchable
            isClearable
            onChange={option => subSubCategorySelectHandler(option)}
            styles={SelectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>
        <InputField label="Service Name">
          <input
            className="input-field"
            placeholder="Enter Service Name"
            value={serviceName}
            onChange={serviceNameChangeHandler}
          />
        </InputField>
      </div>

      {/* table */}
      {!!serviceTableList && showTable ? (
        <div className="table-container -mt-3">
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
                          <button type="button" onClick={() => addNewPackageHandler(item)}>
                            <i className="fa-solid fa-edit icon-color-button" />
                          </button>
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

      {/* add package */}

      {renderAddPackageDrawer ? (
        <AddPackageMaster
          isOpen={openAddPackageDrawer}
          onClose={closeAddPackageHandler}
          itemValue={selectedItem}
          onSuccess={refetchPackageList}
        />
      ) : (
        <></>
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default PackageMaster;
