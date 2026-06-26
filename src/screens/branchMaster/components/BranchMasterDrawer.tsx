import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select, { SingleValue } from "react-select";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { OptionItem, SelectStyles } from "../../../components/customSelect";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { BranchMasterFormValues, branchMasterSchema } from "../../../validation/branchMasterSchema";

const defaultFormValues: BranchMasterFormValues = {
  branchId: 0,
  branchName: "",
  branchCode: "",
  email: "",
  contactNo1: "",
  contactNo2: "",
  address: "",
  isActive: 1,
  fyStartFrom: "",
};

const BranchMasterDrawer = React.memo(
  ({
    isOpen,
    onClose,
    buttonTitle,
    drawerTitle,
    branchId,
    onCloseDrawer,
  }: {
    isOpen: boolean;
    onClose: () => void;
    buttonTitle: string;
    drawerTitle: string;
    branchId: number | null;
    onCloseDrawer: () => void;
  }) => {
    const { loading, fetchApi } = useGlobalApi();

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<SingleValue<OptionItem> | null>(null);

    const {
      handleSubmit,
      register,
      reset,
      watch,
      setValue,
      formState: { errors },
    } = useForm<BranchMasterFormValues>({
      resolver: yupResolver(branchMasterSchema),
      defaultValues: defaultFormValues,
    });

    const financialYear = usePickMaster("FinancialYear");
    const fyStartFrom = watch("fyStartFrom");

    const monthSelectOption = useMemo<OptionItem[]>(
      () =>
        (financialYear?.pickMasterValue as PickMasterItem[])?.map(item => ({
          value: String(item.key ?? ""),
          label: String(item.value ?? ""),
        })) ?? [],
      [financialYear?.pickMasterValue]
    );

    // edit branch
    const loadBranchForEdit = useCallback(
      async (id: number) => {
        const res = await fetchApi(
          "GET",
          ENDPOINTS.GET_BRANCH_DETAILS,
          {},
          { params: { branchId: id } }
        );

        const branch = res?.data?.[0];

        reset({
          branchId: branch?.branchId ?? 0,
          branchName: branch?.branchName ?? "",
          branchCode: branch?.branchCode ?? "",
          email: branch?.email ?? "",
          contactNo1: branch?.contactNo1 ?? "",
          contactNo2: branch?.contactNo2 ?? "",
          address: branch?.address ?? "",
          isActive: branch?.isActive ?? 1,
          fyStartFrom: branch?.fyStartMonth ?? "",
        });
        const selected = monthSelectOption.find(
          o => Number(o.value) === Number(branch?.fyStartMonth)
        );
        setSelectedMonth(selected ?? null);
      },
      [reset, monthSelectOption]
    );

    useEffect(() => {
      if (!isOpen) return;

      setSuccessMessage("");
      setErrorMessage("");

      if (branchId) {
        void loadBranchForEdit(branchId);
        return;
      }
      reset(defaultFormValues);
    }, [isOpen, branchId, loadBranchForEdit, reset]);

    const onSubmit = async (data: BranchMasterFormValues) => {
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        ...data,
        fyStartFrom: selectedMonth?.value ?? "",
      };

      const res = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_BRANCH_MASTER, payload);

      if (!res?.result) {
        setErrorMessage(res?.message || "Failed to save data");
        return;
      }

      setSuccessMessage(res?.message ?? "Data saved successfully");
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
        setErrorMessage("");
        reset(defaultFormValues);
        setSelectedMonth(null);
      }, 500);
      onCloseDrawer?.();
    };

    return (
      <>
        <div className="drawer-bg-fade opacity-100 visible  " onClick={onClose} />

        <div className="drawer-layout drawer-bg translate-x-0 lg:w-250">
          <div className="drawer-title-border ">
            <h2 className="drawer-title">{drawerTitle}</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          <div className="m-1">
            {successMessage && <SuccessMessage text={successMessage} />}
            {errorMessage && <ErrorMessage text={errorMessage} />}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="card ">
                <div className="form-grid-2">
                  <InputField label="Branch Name" required>
                    <input
                      placeholder="Enter Branch Name"
                      {...register("branchName")}
                      className="input-field"
                    />
                    {errors.branchName && (
                      <p className="input-field-error">{errors.branchName.message}</p>
                    )}
                  </InputField>

                  <InputField label="Branch Code" required>
                    <input
                      placeholder="Enter Branch Code"
                      {...register("branchCode")}
                      className="input-field"
                    />
                    {errors.branchCode && (
                      <p className="input-field-error">{errors.branchCode.message}</p>
                    )}
                  </InputField>

                  <InputField label="Email" required={false}>
                    <input
                      placeholder="Enter Email"
                      {...register("email")}
                      className="input-field"
                    />
                    {errors.email && <p className="input-field-error">{errors.email.message}</p>}
                  </InputField>

                  <InputField label="Contact Number-1" required>
                    <input
                      placeholder="Enter Contact Number"
                      {...register("contactNo1")}
                      className="input-field"
                    />
                    {errors.contactNo1 && (
                      <p className="input-field-error">{errors.contactNo1.message}</p>
                    )}
                  </InputField>

                  <InputField label="Contact Number-2" required={false}>
                    <input
                      placeholder="Enter Contact Number"
                      {...register("contactNo2")}
                      className="input-field"
                    />
                  </InputField>

                  <InputField label="Address" required={false}>
                    <input
                      placeholder="Enter Address"
                      {...register("address")}
                      className="input-field"
                    />
                  </InputField>

                  <InputField label="Status" required>
                    <select
                      {...register("isActive", { valueAsNumber: true })}
                      className="input-field"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                    {errors.isActive && (
                      <p className="input-field-error">{errors.isActive.message}</p>
                    )}
                  </InputField>

                  <InputField label="Financial Year Start From" required>
                    <Select<OptionItem, false>
                      options={monthSelectOption}
                      value={selectedMonth}
                      placeholder="Select..."
                      isSearchable
                      isClearable
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      onChange={(option: SingleValue<OptionItem>) => setSelectedMonth(option)}
                    />
                    {errors.fyStartFrom && (
                      <p className="input-field-error">{errors.fyStartFrom.message}</p>
                    )}
                  </InputField>
                </div>
              </div>

              <button type="submit" className="save-btn w-full mt-5">
                {buttonTitle}
              </button>
            </form>
          </div>
        </div>

        {loading ? <CustomLoader isLoading={loading} /> : null}
      </>
    );
  }
);

export default BranchMasterDrawer;
