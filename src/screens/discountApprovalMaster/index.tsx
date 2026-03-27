import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import { DiscountApprovalMasterTableHeader } from "@/constants/tableHeaders";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { showError, showSuccess } from "@/utils/alert";
import { handleMultiSelectWithAll } from "@/utils/multiSelectAllHandler";
import {
  DiscountApprovalMasterFormItem,
  discountApprovalMasterSchema,
} from "@/validation/discountApprovalMaster";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import Select, { GroupBase, SingleValue, StylesConfig } from "react-select";
import { DiscountItem, HmsUserItem, SelectItem } from "./types";

const resetFormData = () => ({
  discountApprovalId: 0,
  discountApprovalName: "",
  hmsUserId: 0,
  isActive: 1,
  mappingBranch: "",
  mappingDiscountType: "",
});

const DiscountApprovalMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [HmsUserList, setHmsUserList] = useState<HmsUserItem[]>([]);
  const [selectedHmsUser, setSelectedHmsUser] = useState<SingleValue<SelectItem> | null>(null);

  const [selectedDiscount, setSelectedDiscount] = useState<SelectItem[]>([]);

  const [selectedBranch, setSelectedBranch] = useState<SelectItem[]>([]);

  const [showDetails, setShowDetails] = useState<boolean>(false);

  const [discountApprovalList, setDiscountApprovalList] = useState<DiscountItem[]>([]);

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(discountApprovalMasterSchema),
    defaultValues: resetFormData(),
  });

  const isEdit = Boolean(watch("discountApprovalId"));
  const buttonTitle = isEdit ? "Update" : "Create";

  const discount = usePickMaster("DiscountApprovalType");
  const discountList = discount?.pickMasterValue ?? [];

  const discountSelectOption = useMemo(() => {
    return discountList.map(d => ({
      label: d?.value,
      value: d?.key,
    }));
  }, [discountList]);

  const branches = useGetBranchList();
  const branchList = branches?.branchList?.data ?? [];

  const branchSelectOption = useMemo(() => {
    return branchList.map(b => ({
      label: b?.branchName,
      value: b?.branchId,
    }));
  }, [branchList]);

  //   hmr user
  const getHMSUser = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.USER_MASTER_LIST,
      {},
      {},
      { component: "DiscountApprovalMaster" }
    );
    setHmsUserList(resp?.data ?? []);
  };

  const hmsUserSelectOption = useMemo(() => {
    return HmsUserList?.map(u => ({
      label: u?.userName,
      value: u?.id,
    }));
  }, [HmsUserList]);

  const hmrUserSelectHandler = (option: SingleValue<SelectItem>) => {
    if (!option) return;
    setSelectedHmsUser(option);
    setValue("hmsUserId", Number(option.value), { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    getHMSUser();
  }, []);

  //   discount select handler
  const discountSelectHandler = (options: SelectItem[]) => {
    const result = handleMultiSelectWithAll(options ?? [], selectedDiscount, discountSelectOption);
    setSelectedDiscount(result.selectedOptions);

    const ids = result.selectedIds.join(",");

    setValue("mappingDiscountType", ids, { shouldValidate: true, shouldDirty: true });
  };

  //   branches select handler
  const branchSelectHandler = (options: SelectItem[]) => {
    const result = handleMultiSelectWithAll(options ?? [], selectedBranch, branchSelectOption);
    setSelectedBranch(result.selectedOptions);

    const ids = result.selectedIds.join(",");

    setValue("mappingBranch", ids, { shouldValidate: true, shouldDirty: true });
  };

  //  discount approval master list
  const getDiscountList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISCOUNT_APPROVAL_MASTER_LIST,
      {},
      {},
      {
        component: "DiscountApprovalMaster",
      }
    );
    setDiscountApprovalList(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) {
      getDiscountList();
    }
  }, [showDetails]);

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  //   submit handler
  const onsubmit = async (formData: DiscountApprovalMasterFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DISCOUNT_APPROVAL_MASTER,
      formData,
      {},
      {
        component: "DiscountApprovalMaster",
      }
    );
    if (!resp?.result) {
      showError(error?.message ?? "Something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    reset(resetFormData());

    setSelectedBranch([]);
    setSelectedDiscount([]);
    setSelectedHmsUser(null);
    await getDiscountList();
  };

  // edit handler
  const editHandler = (item: DiscountItem) => {
    const user = hmsUserSelectOption.find(
      u => u?.label.toLowerCase().trim() === item?.firstName?.toLowerCase().trim()
    );

    const discountIds = item?.discountType.split(",").map(item => item.trim());

    const selectedDiscounts = discountSelectOption.filter(opt =>
      discountIds?.includes(String(opt.value))
    );

    const branches = item?.branchName?.split(",").map(b => b.trim());

    const selectedBranches = branchSelectOption.filter(opt => branches?.includes(opt.label));
    reset({
      discountApprovalId: item?.id ?? 0,
      discountApprovalName: item?.name ?? "",
      hmsUserId: user?.value ?? 0,
      isActive: item?.isActive ?? 1,
      mappingBranch: selectedBranches.map(b => b.value).join(","),
      mappingDiscountType: discountIds?.join(",") ?? "",
    });

    setSelectedHmsUser(user || null);
    setSelectedDiscount(selectedDiscounts || []);
    setSelectedBranch(selectedBranches || []);
  };

  // cancel handler
  const cancelHandler = () => {
    reset(resetFormData());
    setSelectedBranch([]);
    setSelectedDiscount([]);
    setSelectedHmsUser(null);
  };
  return (
    <div className="page-container">
      <h1 className="page-heading">Discount Approval Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Discount Approval Master</span>
      </nav>

      {/* form */}
      <div className="card mb-1">
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label=" Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("discountApprovalName")}
              />
              {errors.discountApprovalName && (
                <p className="input-field-error">{errors.discountApprovalName.message}</p>
              )}
            </InputField>

            <InputField label="HMS User" required>
              <Select<SelectItem, false>
                value={selectedHmsUser}
                options={hmsUserSelectOption}
                placeholder="Select user"
                isSearchable
                isClearable
                onChange={option => hmrUserSelectHandler(option)}
                styles={SelectStyles as StylesConfig<SelectItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.hmsUserId && <p className="input-field-error">{errors.hmsUserId.message}</p>}
            </InputField>

            <InputField label="Discount Type" required>
              <Select
                value={selectedDiscount}
                isMulti
                options={discountSelectOption}
                placeholder="Select discount type"
                isSearchable
                isClearable
                onChange={(option: any) => discountSelectHandler(option)}
                styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                menuPortalTarget={document.body}
                components={{ Option: MultiCheckboxOption }}
                menuPosition="fixed"
              />
              {errors.mappingDiscountType && (
                <p className="input-field-error">{errors.mappingDiscountType.message}</p>
              )}
            </InputField>

            <InputField label="Map in Branches" required>
              <Select
                value={selectedBranch}
                isMulti
                options={branchSelectOption}
                placeholder="Select branches"
                isSearchable
                isClearable
                onChange={(option: any) => branchSelectHandler(option)}
                styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                menuPortalTarget={document.body}
                components={{ Option: MultiCheckboxOption }}
                menuPosition="fixed"
              />
              {errors.mappingBranch && (
                <p className="input-field-error">{errors.mappingBranch.message}</p>
              )}
            </InputField>

            <InputField label="Active" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>

                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button " onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Discount Approval Master List</h2>

          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-60 lg:max-h-60">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {DiscountApprovalMasterTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {discountApprovalList?.length === 0 && (
                      <tr>
                        <td
                          colSpan={DiscountApprovalMasterTableHeader.length}
                          className="table-empty"
                        >
                          No records found
                        </td>
                      </tr>
                    )}

                    {discountApprovalList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.name || "-"}</td>
                        <td className="table-td">{item?.firstName || "-"}</td>
                        <td className="table-td">{item?.discountType || "-"}</td>
                        <td className="table-td">{item?.branchName || "-"}</td>
                        <td
                          className={`table-td ${
                            Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                        </td>
                        <td className="table-td" onClick={() => editHandler(item)}>
                          <i className="fa-solid fa-edit text-xl icon-color-button" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Animation>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default DiscountApprovalMaster;
