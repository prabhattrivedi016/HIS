import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import { OPD_CATEGORY_IDs, Status } from "@/constants/constants";
import {
  BranchCorporateServiceExclusionMappingTableHeader,
  BranchWiseServiceExcludeTableHeader,
} from "@/constants/tableHeaders";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { BranchItem, SelectItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import debounce from "lodash/debounce";
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Select, { GroupBase, MultiValue, StylesConfig } from "react-select";
import {
  BranchCorporateServiceExclusionItem,
  CategoryOptionItem,
  SelectedExcludeServiceItem,
  ServiceSearchItem,
  SubCategoryOptionItem,
  SubSubCategoryOptionItem,
} from "../types";

const getExclusionBranchId = (item: BranchCorporateServiceExclusionItem) =>
  Number(item.BranchId ?? item.branchId ?? 0);

const getExclusionCorporateId = (item: BranchCorporateServiceExclusionItem) =>
  Number(item.CorporateId ?? item.corporateId ?? 0);

const BranchWiseServiceExclude = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branches = useGetBranchList()?.branchList?.data ?? [];
  const serviceInputRef = useRef<HTMLInputElement>(null);

  const [corporateList, setCorporateList] = useState<
    Array<{ corporateId: number; corporateName: string }>
  >([]);
  const [selectedBranches, setSelectedBranches] = useState<SelectItem[]>([]);
  const [selectedCorporates, setSelectedCorporates] = useState<SelectItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<SelectItem[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<SelectItem[]>([]);
  const [selectedSubSubCategories, setSelectedSubSubCategories] = useState<SelectItem[]>([]);

  const [categoryList, setCategoryList] = useState<CategoryOptionItem[]>([]);
  const [subCategoryList, setSubCategoryList] = useState<SubCategoryOptionItem[]>([]);
  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryOptionItem[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [serviceNameList, setServiceNameList] = useState<ServiceSearchItem[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);

  const [selectedServices, setSelectedServices] = useState<SelectedExcludeServiceItem[]>([]);
  const [mappingList, setMappingList] = useState<BranchCorporateServiceExclusionItem[]>([]);
  const [serviceTableError, setServiceTableError] = useState("");

  const branchSelectOptions = useMemo(
    () =>
      branches.map((branch: BranchItem) => ({
        value: branch.branchId,
        label: branch.branchName,
      })),
    [branches]
  );

  const corporateSelectOptions = useMemo(
    () =>
      corporateList.map(corporate => ({
        value: corporate.corporateId,
        label: corporate.corporateName,
      })),
    [corporateList]
  );

  const categorySelectOptions = useMemo(
    () =>
      categoryList.map(category => ({
        value: category.categoryId,
        label: category.categoryName,
      })),
    [categoryList]
  );

  const subCategorySelectOptions = useMemo(
    () =>
      subCategoryList.map(subCategory => ({
        value: subCategory.subCategoryId,
        label: subCategory.subCategoryName,
      })),
    [subCategoryList]
  );

  const subSubCategorySelectOptions = useMemo(
    () =>
      subSubCategoryList.map(subSubCategory => ({
        value: subSubCategory.subSubCategoryId,
        label: subSubCategory.subSubCategoryName,
      })),
    [subSubCategoryList]
  );

  const filteredMappingList = useMemo(() => {
    const branchIds = selectedBranches.map(item => Number(item.value));
    const corporateIds = selectedCorporates.map(item => Number(item.value));

    return mappingList.filter(item => {
      const branchMatch = branchIds.length === 0 || branchIds.includes(getExclusionBranchId(item));
      const corporateMatch =
        corporateIds.length === 0 || corporateIds.includes(getExclusionCorporateId(item));
      return branchMatch && corporateMatch;
    });
  }, [mappingList, selectedBranches, selectedCorporates]);

  const getCorporateList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_MASTER_LIST,
      {},
      { params: { isActive: Status.ACTIVE } },
      { component: "BranchWiseServiceExclude", silent: true }
    );

    setCorporateList(
      (resp?.data ?? []).map(
        (item: {
          corporateId?: number;
          CorporateId?: number;
          corporateName?: string;
          CorporateName?: string;
        }) => ({
          corporateId: Number(item.corporateId ?? item.CorporateId ?? 0),
          corporateName: String(item.corporateName ?? item.CorporateName ?? ""),
        })
      )
    );
  };

  const getCategoryList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryIds: OPD_CATEGORY_IDs.CategoryIds } },
      { component: "BranchWiseServiceExclude", silent: true }
    );
    setCategoryList(resp?.data ?? []);
  };

  const getSubCategoryList = async (categoryIds: string) => {
    if (!categoryIds) {
      setSubCategoryList([]);
      return;
    }

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      { params: { categoryIds } },
      { component: "BranchWiseServiceExclude", silent: true }
    );
    setSubCategoryList(resp?.data ?? []);
  };

  const getSubSubCategoryList = async (subCategoryIds: string) => {
    if (!subCategoryIds) {
      setSubSubCategoryList([]);
      return;
    }

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      { component: "BranchWiseServiceExclude", silent: true }
    );
    setSubSubCategoryList(resp?.data ?? []);
  };

  const getServiceExclusionMapping = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BRANCH_CORPORATE_SERVICE_EXCLUSION_MAPPING,
      {},
      {},
      { component: "BranchWiseServiceExclude" }
    );
    setMappingList(resp?.data ?? []);
  };

  const searchServices = useCallback(
    async (serviceName: string) => {
      const categoryId = selectedCategories.length
        ? selectedCategories.map(item => item.value).join(",")
        : OPD_CATEGORY_IDs.CategoryIds;
      const subCategoryId = selectedSubCategories.map(item => item.value).join(",") || undefined;
      const subSubCategoryId =
        selectedSubSubCategories.map(item => item.value).join(",") || undefined;

      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_SERVICE_ITEM_LIST,
        {},
        {
          params: {
            serviceName,
            categoryId,
            subCategoryId,
            subSubCategoryId,
          },
        },
        { component: "BranchWiseServiceExclude", silent: true }
      );

      setServiceNameList(resp?.data ?? []);
      setShowPopup(true);
      setActiveServiceIndex(0);
    },
    [selectedCategories, selectedSubCategories, selectedSubSubCategories]
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        void searchServices(value);
      }, 500),
    [searchServices]
  );

  useEffect(() => {
    void getCorporateList();
    void getCategoryList();
    void getServiceExclusionMapping();
  }, []);

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  useEffect(() => {
    const categoryIds = selectedCategories.map(item => item.value).join(",");
    void getSubCategoryList(categoryIds);
    setSelectedSubCategories([]);
    setSelectedSubSubCategories([]);
    setSubSubCategoryList([]);
  }, [selectedCategories]);

  useEffect(() => {
    const subCategoryIds = selectedSubCategories.map(item => item.value).join(",");
    void getSubSubCategoryList(subCategoryIds);
    setSelectedSubSubCategories([]);
  }, [selectedSubCategories]);

  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      return;
    }
    debouncedSearch(searchTerm.trim());
  }, [selectedCategories, selectedSubCategories, selectedSubSubCategories, debouncedSearch]);

  const resetServiceEditor = () => {
    setSelectedServices([]);
    setSearchTerm("");
    setServiceNameList([]);
    setShowPopup(false);
    setActiveServiceIndex(0);
    setSelectedCorporates([]);
    setServiceTableError("");
  };

  const investigationChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      debouncedSearch.cancel();
      setServiceNameList([]);
      setShowPopup(false);
      setActiveServiceIndex(0);
      return;
    }

    if (value.trim().length < 3) {
      debouncedSearch.cancel();
      setServiceNameList([]);
      setShowPopup(false);
      setActiveServiceIndex(0);
      return;
    }

    setShowPopup(true);
    debouncedSearch(value.trim());
  };

  const addServiceToTable = (service: ServiceSearchItem) => {
    setShowPopup(false);
    setSearchTerm("");
    setServiceNameList([]);
    setActiveServiceIndex(0);

    if (selectedServices.some(item => item.serviceItemId === service.serviceItemId)) {
      showWarning("Service is already added");
      return;
    }

    setSelectedServices(prev => [
      ...prev,
      {
        serviceItemId: service.serviceItemId,
        name: service.name,
        code: service.code,
      },
    ]);
    setServiceTableError("");
  };

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
      const selectedService = serviceNameList[activeServiceIndex];
      if (selectedService) {
        addServiceToTable(selectedService);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setShowPopup(false);
      setActiveServiceIndex(0);
    }
  };

  const deleteServiceHandler = (serviceItemId: number) => {
    setSelectedServices(prev => prev.filter(item => item.serviceItemId !== serviceItemId));
  };

  const handleSave = async () => {
    if (selectedBranches.length === 0) {
      showWarning("Please select at least one branch");
      return;
    }

    if (selectedCorporates.length === 0) {
      showWarning("Please select at least one corporate");
      return;
    }

    if (selectedServices.length === 0) {
      setServiceTableError("Please add at least one service");
      showWarning("Please add at least one service");
      return;
    }

    setServiceTableError("");
    const serviceItemIds = selectedServices.map(item => item.serviceItemId);

    for (const branch of selectedBranches) {
      for (const corporate of selectedCorporates) {
        const payload = {
          branchId: Number(branch.value),
          corporateId: Number(corporate.value),
          serviceItemIds,
        };

        const resp = await fetchApi(
          "POST",
          ENDPOINTS.SAVE_BRANCH_CORPORATE_SERVICE_EXCLUSION_MAPPING,
          payload,
          {},
          { component: "BranchWiseServiceExclude" }
        );

        if (!resp?.result) {
          showWarning(resp?.message ?? "Failed to save branch wise service exclusion");
          return;
        }
      }
    }

    showSuccess("Branch wise service exclusion saved successfully");
    resetServiceEditor();
    await getServiceExclusionMapping();
  };

  return (
    <div className="mt-1">
      <div className="card form-grid-4">
        <InputField label="Branch" required>
          <Select<SelectItem, true, GroupBase<SelectItem>>
            value={selectedBranches}
            isMulti
            options={branchSelectOptions}
            placeholder="Select branch(s)"
            isSearchable
            isClearable
            onChange={(options: MultiValue<SelectItem>) =>
              setSelectedBranches([...(options ?? [])])
            }
            styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
            menuPortalTarget={document.body}
            components={{ Option: MultiCheckboxOption }}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Corporate" required>
          <Select<SelectItem, true, GroupBase<SelectItem>>
            value={selectedCorporates}
            isMulti
            options={corporateSelectOptions}
            placeholder="Select corporate(s)"
            isSearchable
            isClearable
            onChange={(options: MultiValue<SelectItem>) =>
              setSelectedCorporates([...(options ?? [])])
            }
            styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
            menuPortalTarget={document.body}
            components={{ Option: MultiCheckboxOption }}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Category">
          <Select<SelectItem, true, GroupBase<SelectItem>>
            value={selectedCategories}
            isMulti
            options={categorySelectOptions}
            placeholder="Select category(s)"
            isSearchable
            isClearable
            onChange={(options: MultiValue<SelectItem>) =>
              setSelectedCategories([...(options ?? [])])
            }
            styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
            menuPortalTarget={document.body}
            components={{ Option: MultiCheckboxOption }}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Sub Category">
          <Select<SelectItem, true, GroupBase<SelectItem>>
            value={selectedSubCategories}
            isMulti
            options={subCategorySelectOptions}
            placeholder="Select sub category(s)"
            isSearchable
            isClearable
            isDisabled={selectedCategories.length === 0}
            onChange={(options: MultiValue<SelectItem>) =>
              setSelectedSubCategories([...(options ?? [])])
            }
            styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
            menuPortalTarget={document.body}
            components={{ Option: MultiCheckboxOption }}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Sub Sub Category">
          <Select<SelectItem, true, GroupBase<SelectItem>>
            value={selectedSubSubCategories}
            isMulti
            options={subSubCategorySelectOptions}
            placeholder="Select sub sub category(s)"
            isSearchable
            isClearable
            isDisabled={selectedSubCategories.length === 0}
            onChange={(options: MultiValue<SelectItem>) =>
              setSelectedSubSubCategories([...(options ?? [])])
            }
            styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
            menuPortalTarget={document.body}
            components={{ Option: MultiCheckboxOption }}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Investigation">
          <div className="relative w-full">
            <input
              ref={serviceInputRef}
              className="input-field"
              placeholder="Type at least 3 characters to search"
              value={searchTerm}
              onChange={investigationChangeHandler}
              onKeyDown={serviceInputKeyDownHandler}
            />
            {showPopup && serviceNameList.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md z-50 max-h-60 overflow-y-auto">
                {serviceNameList.map((service, index) => (
                  <div
                    key={service.serviceItemId}
                    className={`px-3 py-2 cursor-pointer text-sm ${
                      index === activeServiceIndex ? "bg-green-100" : "hover:bg-green-200"
                    }`}
                    onMouseEnter={() => setActiveServiceIndex(index)}
                    onClick={() => addServiceToTable(service)}
                  >
                    {service.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </InputField>
      </div>
      {/* service table */}
      <div className="card -mt-3">
        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {BranchWiseServiceExcludeTableHeader.map((header, index) => (
                      <th key={index} className="table-th">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {selectedServices.length === 0 && (
                    <tr>
                      <td
                        colSpan={BranchWiseServiceExcludeTableHeader.length}
                        className="table-empty"
                      >
                        No records found
                      </td>
                    </tr>
                  )}

                  {selectedServices.map((item, index) => (
                    <tr key={item.serviceItemId} className="table-row">
                      <td className="table-td">{index + 1}</td>
                      <td className="table-td">{item.name || "-"}</td>
                      <td className="table-td">{item.code || "-"}</td>
                      <td className="table-td">
                        <button
                          type="button"
                          onClick={() => deleteServiceHandler(item.serviceItemId)}
                        >
                          <i className="fa-solid fa-trash icon-color-delete cursor-pointer"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {!!serviceTableError && <p className="input-field-error mt-1">{serviceTableError}</p>}
        </div>

        <div className="form-actions-responsive mt-5">
          <button type="button" className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>

      {/* mapping table */}
      <div className="table-container mt-1">
        <div className="table-scroll-wrapper">
          <div className="table-size lg:min-h-60 lg:max-h-60">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  {BranchCorporateServiceExclusionMappingTableHeader.map((header, index) => (
                    <th key={index} className="table-th">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredMappingList.length === 0 && (
                  <tr>
                    <td
                      colSpan={BranchCorporateServiceExclusionMappingTableHeader.length}
                      className="table-empty"
                    >
                      No records found
                    </td>
                  </tr>
                )}

                {filteredMappingList.map((item, index) => (
                  <tr
                    key={`${getExclusionBranchId(item)}-${getExclusionCorporateId(item)}-${item.ServiceItemId ?? item.serviceItemId}-${index}`}
                    className="table-row"
                  >
                    <td className="table-td">{index + 1}</td>
                    <td className="table-td">{item.BranchName ?? item.branchName ?? "-"}</td>
                    <td className="table-td">{item.CorporateName ?? item.corporateName ?? "-"}</td>
                    <td className="table-td">
                      {item.ServiceItemName ?? item.serviceItemName ?? "-"}
                    </td>
                    <td className="table-td">{item.CreatedBy ?? item.createdBy ?? "-"}</td>
                    <td className="table-td">{item.CreatedOn ?? item.createdOn ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default BranchWiseServiceExclude;
