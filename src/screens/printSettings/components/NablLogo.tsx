import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, Status } from "@/constants/constants";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SelectItem } from "@/types";
import { useEffect, useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";
import { BranchItem, InvestigationItem, SubSubCategoryItem } from "../types";

const NablLogo = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const branches = useGetBranchList()?.branchList?.data ?? [];
  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<SelectItem | null>(null);
  const [investigationList, setInvestigationList] = useState<InvestigationItem[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState<SelectItem | null>(null);

  //   get sub category list
  const fetchSubSubCategoryList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds: 1 } },
      { component: "NablLogo" }
    );
    setSubSubCategoryList(resp?.data || []);
  };

  const subsubCategorySelectOption = useMemo(() => {
    return subSubCategoryList.map((item: SubSubCategoryItem) => ({
      value: item.subSubCategoryId,
      label: item.subSubCategoryName,
    }));
  }, [subSubCategoryList]);

  //   sub sub category select handler
  const subSubCategorySelectHandler = (option: SingleValue<SelectItem | null>) => {
    if (!option) {
      setSelectedSubSubCategory(null);
      return;
    }
    setSelectedSubSubCategory(option);
    getInvestigationList(option.value);
  };

  useEffect(() => {
    fetchSubSubCategoryList();
  }, []);

  //   get investigation lists
  const getInvestigationList = async (subSubCategoryId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_SERVICE_ITEM_LIST,
      {},
      {
        params: {
          categoryId: CATEGORY_ID?.categoryId,
          subCategoryId: Status?.ACTIVE,
          subSubCategoryId,
          isActive: Status?.ACTIVE,
        },
      },
      { component: "NablLogo" }
    );
    setInvestigationList(resp?.data ?? []);
  };

  //   investigation select options
  const investigationSelectOption = useMemo(() => {
    return investigationList.map((item: InvestigationItem) => ({
      value: item?.serviceItemId,
      label: item?.name,
    }));
  }, [investigationList]);

  //   investigation select handler
  const investigationSelectHandler = (option: SingleValue<SelectItem | null>) => {
    if (!option) {
      setSelectedInvestigation(null);
      return;
    }
    setSelectedInvestigation(option);
  };

  return (
    <div className="-mt-3">
      <div className="card ">
        <h2 className="card-title ">NABL Logo</h2>

        <form>
          <div className="form-grid-4">
            <InputField label="Branches" required>
              <select className="input-field">
                <option value="">Select Branch</option>
                {branches.map((branch: BranchItem) => (
                  <option key={branch?.branchId} value={branch?.branchId}>
                    {branch?.branchName}
                  </option>
                ))}
              </select>
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Department" required>
              <Select
                options={subsubCategorySelectOption}
                value={selectedSubSubCategory}
                placeholder="Select department"
                isSearchable
                isClearable
                onChange={(option: SingleValue<SelectItem | null | any>) =>
                  subSubCategorySelectHandler(option)
                }
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Investigation" required>
              <Select
                options={investigationSelectOption}
                // value={selectedInvestigation}
                placeholder="Select investigation"
                isSearchable
                isClearable
                onChange={(option: SingleValue<SelectItem | null | any>) =>
                  investigationSelectHandler(option)
                }
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <div className="flex flex-row gap-2 mt-8">
              <label className="font-bold">Use Default Logo</label>
              <input type="checkbox" className="input-checkbox mt-1" />

              <label className="default-logo-link">( View Default Logo )</label>
            </div>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {"Save"}
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default NablLogo;
