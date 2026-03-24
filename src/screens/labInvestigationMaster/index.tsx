import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import ToggleButton from "@/components/toggleButton";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID } from "@/constants/constants";
import { LabInvestigationTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess } from "@/utils/alert";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select, { SingleValue } from "react-select";
import AddLabInvestigation from "./components/AddLabInvestigation";
import {
  InvestigationTableItem,
  SelectItem,
  SubCategoryListItem,
  SubSubCategoryItem,
} from "./types";

const LabInvestigationMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [subCategoryList, setSubCategoryList] = useState<SubCategoryListItem[]>([]);
  const [selectSubCategory, setSelectedSubCategory] = useState<SelectItem | null>(null);

  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);
  const [selectSubSubCategory, setSelectedSubSubCategory] = useState<SelectItem | null>(null);
  const [investigationName, setInvestigationName] = useState<string>("");

  const [openNewInvestigation, setOpenNewInvestigation] = useState<boolean>(false);
  const [renderNewInvestigation, setRenderNewInvestigation] = useState<boolean>(false);

  const [investigationTableData, setInvestigationTableData] = useState<InvestigationTableItem[]>(
    []
  );
  const [editRow, setEditRow] = useState<InvestigationTableItem | null>(null);

  // category
  const getCategory = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryIds: CATEGORY_ID?.categoryId } },
      { component: "LabInvestigationMaster", silent: true }
    );
    setCategoryName(resp?.data?.[0]?.categoryName ?? "Investigations");
    setCategoryId(resp?.data?.[0]?.categoryId ?? 3);
  }, []);

  // sub category
  const getSubCategory = useCallback(async (id: number) => {
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
  }, []);

  const subCategorySelectOption = useMemo<readonly SelectItem[]>(() => {
    return (
      subCategoryList?.map((d: SubCategoryListItem) => ({
        label: d?.subCategoryName,
        value: d?.subCategoryId,
      })) || []
    );
  }, [subCategoryList]);

  const subCategorySelectHandler = (option: SingleValue<SelectItem>) => {
    setSelectedSubCategory(option);
    setSelectedSubSubCategory(null);
    setSubSubCategoryList([]);
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
        silent: true,
      }
    );

    setSubSubCategoryList(resp?.data ?? []);
  }, []);

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
  };

  useEffect(() => {
    getCategory();
  }, [getCategory]);

  useEffect(() => {
    if (categoryId === null) return;
    getSubCategory(categoryId);
  }, [categoryId, getSubCategory]);

  useEffect(() => {
    if (!selectSubCategory?.value) return;
    getSubSubCategory(selectSubCategory.value);
  }, [getSubSubCategory, selectSubCategory?.value]);

  // add new investigation
  const addNewInvestigation = () => {
    setEditRow(null);
    setOpenNewInvestigation(true);
    setRenderNewInvestigation(true);
  };

  // search handler
  const searchHandler = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!categoryId) return;
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_INVESTIGATION_SERVICE_ITEM_LIST,
        {},
        {
          params: {
            categoryId: categoryId,
            subCategoryId: selectSubCategory?.value ?? "",
            subSubCategoryId: selectSubSubCategory?.value ?? "",
            serviceItemId: "",
            serviceName: investigationName.trim(),
            isActive: "",
          },
        },
        { component: "LabInvestigationMaster" }
      );

      setInvestigationTableData(resp?.data ?? []);
    },
    [categoryId, investigationName, selectSubCategory?.value, selectSubSubCategory?.value]
  );

  const editHandler = (item: InvestigationTableItem) => {
    setEditRow(item);
    setOpenNewInvestigation(true);
    setRenderNewInvestigation(true);
  };

  // close handler
  const closeHandler = useCallback(() => {
    setOpenNewInvestigation(false);
    setEditRow(null);
  }, []);

  // status update handler
  const statusUpdateHandler = async (item: InvestigationTableItem) => {
    console.log("status update is clicked", item);
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_SERVICE_ITEM_MASTER_STATUS,
      {},
      { params: { serviceItemId: item?.serviceItemId, isActive: item?.isActive === 1 ? 0 : 1 } },
      { component: "LabInvestigationMaster" }
    );
    console.log("resp", resp);
    if (!resp?.result) return;
    await searchHandler?.();

    showSuccess(resp?.message ?? "Data saved successfully");
  };
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-1">
        <div>
          <h1 className="page-heading">Lab Investigation Master</h1>

          <nav className="helper-text flex items-center gap-2">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Lab Investigation Master</span>
          </nav>
        </div>

        <button className="save-btn whitespace-nowrap" onClick={addNewInvestigation}>
          Add New Lab Investigation
        </button>
      </div>

      {/* Investigation Form */}
      <div className="card mb-1">
        <h2 className="card-title">Investigation Details</h2>

        <form onSubmit={searchHandler}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField label="Category" required>
              <input value={categoryName!} readOnly className="input-field" />
            </InputField>

            <InputField label="Sub Category" required>
              <Select
                value={selectSubCategory}
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

            <InputField label="Sub Sub Category">
              <Select
                value={selectSubSubCategory}
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

            <InputField label="Investigation Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter investigation name"
                value={investigationName}
                onChange={e => setInvestigationName(e.target.value)}
              />
            </InputField>
          </div>

          {/* form buttons */}
          <div className="form-actions-responsive mt-6">
            <button type="submit" className="save-btn">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* table */}

      {!!investigationTableData && investigationTableData.length > 0 ? (
        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-110 lg:max-h-110">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {LabInvestigationTableHeader.map((header, index) => (
                      <th key={index} className="table-th ">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {investigationTableData.length === 0 ? (
                    <tr>
                      <td colSpan={LabInvestigationTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    investigationTableData.map((item, idx) => (
                      <tr key={item.serviceItemId} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item.reportType || "-"}</td>
                        <td className="table-td wrap-break-word max-w-48">{item.name || "-"}</td>
                        <td className="table-td">{item.code || "-"}</td>
                        <td className="table-td">
                          {item.tatInMin !== undefined && item.tatInMin !== null
                            ? `${item.tatInMin} min`
                            : "-"}
                        </td>
                        <td className="table-td">{item.sampleTypeId || "-"}</td>
                        <td className="table-td">{item.sampleVolume || "-"}</td>
                        <td className="table-td">{item.forGender || "-"}</td>
                        <td
                          className={`table-td ${
                            Number(item.isActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item.isActive) === 1 ? "Active" : "Inactive"}
                        </td>
                        <td className="table-td">
                          <button type="button" className="icon-color-button cursor-pointer">
                            <i className="fa-solid fa-search text-xl" />
                          </button>
                        </td>
                        <td className="table-td">
                          <button
                            type="button"
                            className="icon-color-button cursor-pointer"
                            onClick={() => editHandler(item)}
                          >
                            <i className="fa-solid fa-edit text-xl" />
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

      {!!renderNewInvestigation && (
        <AddLabInvestigation
          isOpen={openNewInvestigation}
          onClose={closeHandler}
          categoryName={categoryName}
          categoryId={categoryId}
          data={editRow}
          refreshTableData={searchHandler}
        />
      )}

      {/* loader */}
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default LabInvestigationMaster;
