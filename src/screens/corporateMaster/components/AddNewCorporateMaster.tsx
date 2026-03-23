import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useScrollLock } from "@/hooks/useScrollLock";
import { formatToDDMMYYYY, toInputDate } from "@/utils/dateConvertHandler";
import { handleMultiSelectWithAll } from "@/utils/multiSelectAllHandler";
import { CorporateMasterFormItem, corporateMasterSchema } from "@/validation/corporateMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import Select, { GroupBase, StylesConfig } from "react-select";
import {
  AddNewCorporateMasterProps,
  CorporateTypeItem,
  InsuranceCompanyItem,
  PaymentItem,
  PaymentTypeItem,
  SelectItem,
} from "../types";
import AddIpdOpdPopup from "./AddIpdOpdPopup";
import AddNewCorporateType from "./AddNewCorporateType";
import AddNewInsurance from "./AddNewInsurance";

const resetFormData = () => ({
  corporateId: 0,
  corporateName: "",
  insuranceCompanyName: "",
  insuranceCompanyId: 0,
  corporateTypeName: "",
  corporateTypeId: 0,
  paymentTypeId: 0,
  corporateCode: "",
  corporateContact1: "",
  corporateContact2: "",
  corporateEmail: "",
  corporateAddress1: "",
  corporateAddress2: "",
  isActive: 1,
  contractStartFrom: "",
  contractExpiresOn: "",
  copaymentPer: 0,
  discountPerOut: 0,
  discountPerIn: 0,
  hikePerOut: 0,
  hikePerIn: 0,
  activePaymentModes: "",
  activeBranches: "",
  rateListIdOPD: "",
  rateListIdIPD: "",
});

const parseCsvIds = (value?: string) =>
  (value ?? "")
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => Number.isFinite(v) && v > 0);

const AddNewCorporateMaster = ({
  isOpen,
  onClose,
  corporateId,
  refreshData,
}: AddNewCorporateMasterProps) => {
  const drawerTitle = corporateId ? "Update" : "Create";

  const { loading, error, fetchApi } = useGlobalApi();

  const branches = useGetBranchList();
  const branchList = branches?.branchList?.data ?? [];
  const [selectedBranch, setSelectedBranch] = useState<SelectItem[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string>("");
  const [isBranchDefaultApplied, setIsBranchDefaultApplied] = useState<boolean>(false);

  const paymentType = usePickMaster("CorporatePaymentType");
  const paymentTypeList = paymentType?.pickMasterValue ?? ([] as PaymentTypeItem[]);

  const [openNewInsurance, setOpenNewInsurance] = useState<boolean>(false);
  const [renderNewInsurance, setRenderNewInsurance] = useState<boolean>(false);
  const [insuranceCompanyList, setInsuranceCompanyList] = useState<InsuranceCompanyItem[]>([]);
  const [insuranceCompanyEdit, setInsuranceCompanyEdit] = useState<InsuranceCompanyItem | null>(
    null
  );

  const [corporateTypeList, setCorporateList] = useState<CorporateTypeItem[]>([]);
  const [corporateTypeEdit, setCorporateTypeEdit] = useState<CorporateTypeItem | null>(null);
  const [openNewCorporateType, setOpenNewCorporateType] = useState<boolean>(false);
  const [renderNewCorporateType, setRenderNewCorporateType] = useState<boolean>(false);
  const [selectedCorporateTypeId, setSelectedCorporateTypeId] = useState<number>(0);
  const [selectedInsuranceCompanyId, setSelectedInsuranceCompanyId] = useState<number>(0);
  const [editCorporateTypeName, setEditCorporateTypeName] = useState<string>("");

  const [paymentMethodList, setPaymentMethodList] = useState<PaymentItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<SelectItem[]>([]);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string>("");
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<number>(0);

  const [openAddIpdOpd, setOpenAddIpdOpd] = useState<boolean>(false);
  const [renderAddIpdOpd, setRenderAddIpdOpd] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [ipdRateListValue, setIpdRateListValue] = useState<string>("");
  const [opdRateListValue, setOpdRateListValue] = useState<string>("");
  const rateListSummary = `OPD & IPD Follow Rate`;
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(corporateMasterSchema),
    defaultValues: resetFormData(),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // api calls
  const getCorporateType = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_TYPE_MASTER_LIST,
      {},
      {},
      { component: "CorporateMaster" }
    );
    setCorporateList(resp?.data ?? []);
  }, [corporateTypeList]);

  const getInsuranceCompany = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_INSURANCE_COMPANY_LIST,
      {},
      {},
      { component: "CorporateMaster" }
    );
    setInsuranceCompanyList(resp?.data ?? []);
  }, [insuranceCompanyList]);

  const getPaymentMethod = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PAYMENT_MODE_MASTER_LIST,
      {},
      {},
      {
        component: "CorporateMaster",
      }
    );
    setPaymentMethodList(resp?.data ?? []);
  };

  useEffect(() => {
    getCorporateType();
    getInsuranceCompany();
    getPaymentMethod();
  }, []);

  // handlers

  const corporateTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const corporateId = Number(e.target.value);
    if (!corporateId) {
      setSelectedCorporateTypeId(0);
      setValue("corporateTypeId", 0, { shouldDirty: true });
      setValue("corporateTypeName", "", { shouldDirty: true });
      return;
    }

    const editCorporateTypeValue = corporateTypeList?.find(c => c?.corporateTypeId === corporateId);
    setCorporateTypeEdit(editCorporateTypeValue!);
    setSelectedCorporateTypeId(corporateId);

    setValue("corporateTypeId", corporateId, { shouldDirty: true });
    setValue("corporateTypeName", editCorporateTypeValue?.corporateTypeName, {
      shouldDirty: true,
    });
  };

  const AddCorporateTypeHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const selectedType = corporateTypeList.find(
      c => Number(c?.corporateTypeId) === Number(selectedCorporateTypeId)
    );
    setCorporateTypeEdit(selectedType ?? null);
    setOpenNewCorporateType(true);
    setRenderNewCorporateType(true);
  };

  const insuranceCompanySelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const insuranceId = Number(e.target.value);
    if (!insuranceId) {
      setSelectedInsuranceCompanyId(0);
      setValue("insuranceCompanyId", 0, { shouldDirty: true });
      setValue("insuranceCompanyName", "", { shouldDirty: true });
      return;
    }

    const insuranceValue = insuranceCompanyList?.find(i => i?.insuranceCompanyId === insuranceId);
    setInsuranceCompanyEdit(insuranceValue!);
    setSelectedInsuranceCompanyId(insuranceId);

    setValue("insuranceCompanyId", insuranceId, { shouldDirty: true });
    setValue("insuranceCompanyName", insuranceValue?.insuranceCompanyName, {
      shouldDirty: true,
    });
  };

  const AddInsuranceHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const selectedInsurance = insuranceCompanyList.find(
      i => Number(i?.insuranceCompanyId) === Number(selectedInsuranceCompanyId)
    );
    setInsuranceCompanyEdit(selectedInsurance ?? null);
    setOpenNewInsurance(true);
    setRenderNewInsurance(true);
  };

  const closeCorporateTypeHandler = useCallback(() => {
    setOpenNewCorporateType(false);
    setCorporateTypeEdit(null);
  }, []);

  const closeInsuranceHandler = useCallback(() => {
    setOpenNewInsurance(false);
    setInsuranceCompanyEdit(null);
  }, []);

  // payment method

  const paymentSelectOption = useMemo<SelectItem[]>(() => {
    return [
      { label: "All", value: 0 },
      ...paymentMethodList.map(b => ({
        label: b?.paymentModeName,
        value: b?.paymentModeId,
      })),
    ];
  }, [paymentMethodList]);

  //  payment select handler

  const paymentSelectHandler = (options: readonly SelectItem[] | null) => {
    const result = handleMultiSelectWithAll(options ?? [], selectedPayment, paymentSelectOption);

    setSelectedPayment(result.selectedOptions);
    const ids = result.selectedIds.join(",");

    setSelectedPaymentIds(ids);
  };
  // branch method

  const branchSelectOption = useMemo<SelectItem[]>(() => {
    return [
      ...branchList.map(b => ({
        label: b?.branchName,
        value: b?.branchId,
      })),
    ];
  }, [branchList]);

  const branchSelectHandler = (options: readonly SelectItem[] | null) => {
    const result = handleMultiSelectWithAll(options ?? [], selectedBranch, branchSelectOption);

    setSelectedBranch(result.selectedOptions);
    const ids = result.selectedIds.join(",");

    setSelectedBranchIds(ids);
  };

  useEffect(() => {
    if (!isOpen || !!corporateId || isBranchDefaultApplied) return;
    if (branchSelectOption.length > 0 && !selectedBranchIds) {
      const allBranches = branchSelectOption.filter(opt => opt.value !== 0);

      setSelectedBranch(allBranches);

      const ids = allBranches.map(b => b.value).join(",");
      setSelectedBranchIds(ids);
      setIsBranchDefaultApplied(true);
    }
  }, [isOpen, corporateId, branchSelectOption, selectedBranchIds, isBranchDefaultApplied]);
  //   ipd opd rate list handler
  const addIpdOpdHandler = () => {
    setOpenAddIpdOpd(true);
    setRenderAddIpdOpd(true);
  };

  const closeIpdOpdAdd = useCallback(() => {
    setRenderAddIpdOpd(false);
  }, []);

  useScrollLock(isOpen);

  //get corporate details by ID
  const getCorporateDetails = async (id: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_MASTER_LIST,
      {},
      { params: { corporateId: id } },
      { component: "AddNewCorporateMaster" }
    );

    const previous = resp?.data?.[0];

    if (!previous) return;
    const corporateTypeIdFromApi = Number(previous?.corporateTypeId ?? 0);
    reset({
      corporateId: previous?.corporateId ?? 0,
      corporateName: previous?.corporateName ?? "",
      insuranceCompanyName: previous?.insuranceCompanyName ?? "",
      insuranceCompanyId: previous?.insuranceCompanyId ?? 0,
      corporateTypeName: previous?.corporateTypeName ?? "",
      corporateTypeId: corporateTypeIdFromApi,
      paymentTypeId: previous?.paymentTypeId ?? 0,
      corporateCode: previous?.corporateCode ?? "",
      corporateContact1: previous?.corporateContact1 ?? "",
      corporateContact2: previous?.corporateContact2 ?? "",
      corporateEmail: previous?.corporateEmail ?? "",
      corporateAddress1: previous?.corporateAddress1 ?? "",
      corporateAddress2: previous?.corporateAddress2 ?? "",
      isActive: previous?.isActive ?? 0,
      contractStartFrom: toInputDate(previous?.contractStartFrom),
      contractExpiresOn: toInputDate(previous?.contractExpiresOn),
      copaymentPer: previous?.copaymentPer ?? 0,
      discountPerOut: previous?.discountPerOut ?? 0,
      discountPerIn: previous?.discountPerIn ?? 0,
      hikePerOut: previous?.hikePerOut ?? 0,
      hikePerIn: previous?.hikePerIn ?? 0,
      activePaymentModes: previous?.activePaymentModes ?? "",
      activeBranches: previous?.activeBranches ?? "",
      rateListIdOPD: previous?.rateListIdOPD ?? "",
      rateListIdIPD: previous?.rateListIdIPD ?? "",
    });
    setSelectedCorporateTypeId(corporateTypeIdFromApi);
    setEditCorporateTypeName(previous?.corporateTypeName ?? "");
    setSelectedInsuranceCompanyId(previous?.insuranceCompanyId ?? 0);
    setSelectedPaymentTypeId(previous?.paymentTypeId ?? 0);
    setSelectedPaymentIds(previous?.activePaymentModes ?? "");
    setSelectedBranchIds(previous?.activeBranches ?? "");
    setOpdRateListValue(previous?.rateListIdOPD ?? "");
    setIpdRateListValue(previous?.rateListIdIPD ?? "");
  };

  useEffect(() => {
    if (!isOpen) return;

    if (corporateId) {
      setIsBranchDefaultApplied(true);
      getCorporateDetails(corporateId);
      return;
    }

    reset(resetFormData());
    setSelectedCorporateTypeId(0);
    setEditCorporateTypeName("");
    setSelectedInsuranceCompanyId(0);
    setSelectedPaymentTypeId(0);
    setSelectedPayment([]);
    setSelectedPaymentIds("");
    setSelectedBranch([]);
    setSelectedBranchIds("");
    setIsBranchDefaultApplied(false);
    setIpdRateListValue("");
    setOpdRateListValue("");
  }, [corporateId, isOpen]);

  useEffect(() => {
    setValue("rateListIdIPD", ipdRateListValue);
    setValue("rateListIdOPD", opdRateListValue);
  }, [ipdRateListValue, opdRateListValue, setValue]);

  useEffect(() => {
    setValue("activePaymentModes", selectedPaymentIds);
    setValue("activeBranches", selectedBranchIds);
  }, [selectedPaymentIds, selectedBranchIds, setValue]);

  useEffect(() => {
    if (!isOpen || !corporateId || paymentSelectOption.length === 0) return;

    const idSet = new Set(parseCsvIds(selectedPaymentIds));
    const selected = paymentSelectOption.filter(
      opt => opt.value !== 0 && idSet.has(Number(opt.value))
    );
    setSelectedPayment(selected);
  }, [isOpen, corporateId, paymentSelectOption, selectedPaymentIds]);

  useEffect(() => {
    if (!isOpen || !corporateId || corporateTypeList.length === 0) return;

    let resolvedTypeId = selectedCorporateTypeId;

    if (!resolvedTypeId && editCorporateTypeName) {
      const byName = corporateTypeList.find(
        type =>
          type?.corporateTypeName?.trim().toLowerCase() ===
          editCorporateTypeName.trim().toLowerCase()
      );
      resolvedTypeId = Number(byName?.corporateTypeId ?? 0);
    }

    if (!resolvedTypeId) return;

    const selectedType = corporateTypeList.find(
      type => Number(type?.corporateTypeId) === Number(resolvedTypeId)
    );
    if (!selectedType) return;

    setSelectedCorporateTypeId(Number(selectedType.corporateTypeId));
    setValue("corporateTypeId", Number(selectedType.corporateTypeId));
    setValue("corporateTypeName", selectedType.corporateTypeName ?? "");
  }, [
    isOpen,
    corporateId,
    corporateTypeList,
    selectedCorporateTypeId,
    editCorporateTypeName,
    setValue,
  ]);

  useEffect(() => {
    if (!isOpen || !corporateId || branchSelectOption.length === 0) return;

    const idSet = new Set(parseCsvIds(selectedBranchIds));
    const selected = branchSelectOption.filter(opt => idSet.has(Number(opt.value)));
    setSelectedBranch(selected);
  }, [isOpen, corporateId, branchSelectOption, selectedBranchIds]);

  // submit handler
  const onsubmit = async (formData: CorporateMasterFormItem) => {
    const payload = {
      ...formData,
      contractStartFrom: formatToDDMMYYYY(formData?.contractStartFrom),
      contractExpiresOn: formatToDDMMYYYY(formData?.contractExpiresOn),
    };
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_CORPORATE_MASTER,
      payload,
      {},
      { component: "AddNewCorporateMaster" }
    );
    if (!resp?.result) {
      return;
    }
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    closeTimerRef.current = setTimeout(() => {
      onClose();
      setSuccessMessage("");
    }, 1000);
    reset(resetFormData());
    setSelectedCorporateTypeId(0);
    setEditCorporateTypeName("");
    setSelectedInsuranceCompanyId(0);
    setSelectedPaymentTypeId(0);
    setSelectedPayment([]);
    setSelectedPaymentIds("");
    setSelectedBranch([]);
    setSelectedBranchIds("");
    setIsBranchDefaultApplied(false);
    setIpdRateListValue("");
    setOpdRateListValue("");
    await refreshData?.();
  };
  // clear timer
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div
          className={`drawer-layout drawer-bg lg:min-w-[1200px] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="drawer-title-border">
            <h2 className="drawer-title">{drawerTitle} Corporate Master</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          {successMessage ? <SuccessMessage text={successMessage} /> : <></>}
          {error ? <ErrorMessage text={error?.message} /> : <></>}

          <form onSubmit={handleSubmit(onsubmit)}>
            <div className="card m-1">
              <h2 className="card-title ">Corporate Details</h2>

              <div className="form-grid-3">
                <InputField label="Corporate Name" required>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter corporate name "
                    {...register("corporateName")}
                  />
                  {errors.corporateName && (
                    <p className="input-field-error">{errors.corporateName.message}</p>
                  )}
                </InputField>

                <InputField label="Corporate Type" required>
                  <div className="flex gap-2 items-center">
                    <select
                      className="input-field"
                      onChange={corporateTypeSelectHandler}
                      value={selectedCorporateTypeId}
                    >
                      <option value="">Select</option>
                      {corporateTypeList.map(c => (
                        <option key={c?.corporateTypeId} value={c?.corporateTypeId}>
                          {c?.corporateTypeName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="-mt-2 active:scale-90"
                      onClick={AddCorporateTypeHandler}
                    >
                      <i className="fa-solid fa-circle-plus fa-xl "></i>
                    </button>
                  </div>
                  {errors.corporateTypeId && (
                    <p className="input-field-error">{errors.corporateTypeId.message}</p>
                  )}
                </InputField>

                <InputField label="Insurance Company" required>
                  <div className="flex gap-2 items-center">
                    <select
                      className="input-field"
                      onChange={insuranceCompanySelectHandler}
                      value={selectedInsuranceCompanyId}
                    >
                      <option value="">Select</option>
                      {insuranceCompanyList.map(i => (
                        <option value={i?.insuranceCompanyId} key={i?.insuranceCompanyId}>
                          {i?.insuranceCompanyName}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="-mt-2 active:scale-90"
                      onClick={AddInsuranceHandler}
                    >
                      <i className="fa-solid fa-circle-plus fa-xl "></i>
                    </button>
                  </div>
                  {errors.insuranceCompanyId && (
                    <p className="input-field-error">{errors.insuranceCompanyId.message}</p>
                  )}
                </InputField>

                <InputField label="Corporate Code">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter corporate code "
                    {...register("corporateCode")}
                  />
                </InputField>

                <InputField label="Contact Number 1" required>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contact number 1 "
                    {...register("corporateContact1")}
                  />
                  {errors.corporateContact1 && (
                    <p className="input-field-error">{errors.corporateContact1.message}</p>
                  )}
                </InputField>

                <InputField label="Contact Number 2">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contact number 2 "
                    {...register("corporateContact2")}
                  />
                </InputField>

                <InputField label="Email">
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Enter email address"
                    {...register("corporateEmail")}
                  />
                  {errors.corporateEmail && (
                    <p className="input-field-error">{errors.corporateEmail.message}</p>
                  )}
                </InputField>

                <InputField label="Address Line 1" required>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter address line 1"
                    {...register("corporateAddress1")}
                  />
                  {errors.corporateAddress1 && (
                    <p className="input-field-error">{errors.corporateAddress1.message}</p>
                  )}
                </InputField>

                <InputField label="Address Line 2">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter address line 2 "
                    {...register("corporateAddress2")}
                  />
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
              </div>
            </div>

            <div className="card m-1">
              <h2 className="card-title ">Contract Details</h2>

              <div className="form-grid-3">
                <InputField label="Start From" required>
                  <input type="date" className="input-field" {...register("contractStartFrom")} />
                  {errors.contractStartFrom && (
                    <p className="input-field-error">{errors.contractStartFrom.message}</p>
                  )}
                </InputField>

                <InputField label="Expires On" required>
                  <input type="date" className="input-field" {...register("contractExpiresOn")} />
                  {errors.contractExpiresOn && (
                    <p className="input-field-error">{errors.contractExpiresOn.message}</p>
                  )}
                </InputField>

                <InputField label="Co-payment (%)">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contact number "
                    {...register("copaymentPer")}
                  />
                </InputField>

                <InputField label="Fixed Discount(Out Patient)(%)">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contact number "
                    {...register("discountPerOut")}
                  />
                </InputField>

                <InputField label="Fixed Discount(In Patient)(%)">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contact number "
                    {...register("discountPerIn")}
                  />
                </InputField>

                <InputField label="Apply Hike On Rates(Out Patient)(%)">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contact number "
                    {...register("hikePerOut")}
                  />
                </InputField>

                <InputField label="Payment Type">
                  <select
                    className="input-field"
                    {...register("paymentTypeId")}
                    value={selectedPaymentTypeId}
                    onChange={e => {
                      const id = Number(e.target.value);
                      setSelectedPaymentTypeId(id);
                      setValue("paymentTypeId", id);
                    }}
                  >
                    <option value="">Select</option>
                    {paymentTypeList.map(p => (
                      <option key={p?.key} value={p?.key}>
                        {p?.value}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Apply Hike On Rates(In Patient)(%)">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contact number "
                    {...register("hikePerIn")}
                  />
                </InputField>

                <InputField label="Follow Rate List (OPD & IPD)">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input-field flex-1 min-w-0"
                      value={rateListSummary}
                      readOnly
                    />

                    <button
                      type="button"
                      className="save-btn whitespace-nowrap px-4 -mt-2"
                      onClick={addIpdOpdHandler}
                    >
                      + Add to IPD/OPD
                    </button>
                  </div>
                </InputField>

                <InputField label="Allowed Payment Modes" required>
                  <Select
                    value={selectedPayment}
                    isMulti
                    options={paymentSelectOption}
                    placeholder="Select payment method"
                    isSearchable
                    isClearable
                    onChange={(option: any) => paymentSelectHandler(option)}
                    styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                    menuPortalTarget={document.body}
                    components={{ Option: MultiCheckboxOption }}
                    menuPosition="fixed"
                  />
                  {errors.activePaymentModes && (
                    <p className="input-field-error">{errors.activePaymentModes.message}</p>
                  )}
                </InputField>
                <InputField label="Active in Branches" required>
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
                  {errors.activeBranches && (
                    <p className="input-field-error">{errors.activeBranches.message}</p>
                  )}
                </InputField>
              </div>

              <div className="form-actions-responsive mt-5">
                <button type="submit" className="save-btn">
                  {drawerTitle}
                </button>
                <button type="button" className="cancel-button ">
                  Cancel
                </button>
              </div>
            </div>
          </form>

          {/* render popup*/}

          {!!renderNewInsurance && (
            <AddNewInsurance
              isOpen={openNewInsurance}
              onClose={closeInsuranceHandler}
              data={insuranceCompanyEdit}
              refresh={getInsuranceCompany}
            />
          )}

          {!!renderNewCorporateType && (
            <AddNewCorporateType
              isOpen={openNewCorporateType}
              onClose={closeCorporateTypeHandler}
              data={corporateTypeEdit}
              refreshData={getCorporateType}
            />
          )}

          {/* follow rate ipd opd  */}
          {!!renderAddIpdOpd && (
            <AddIpdOpdPopup
              isOpen={openAddIpdOpd}
              onClose={closeIpdOpdAdd}
              ipdValue={ipdRateListValue}
              opdValue={opdRateListValue}
              setIpdValue={setIpdRateListValue!}
              setOpdValue={setOpdRateListValue!}
            />
          )}
        </div>
        {!!loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>,
    document.body
  );
};

export default AddNewCorporateMaster;
