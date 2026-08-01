import BillingDetails from "@/components/BillingDetails";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import InputFieldModal from "@/components/inputFieldModal";
import { ENDPOINTS } from "@/config/defaults";
import { OpdBillingServiceTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showWarning } from "@/utils/alert";
import { allowOnlyText } from "@/utils/inputValidationHandler";
import React, { useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { InsuranceItem } from "../../branchMaster/types";
import {
  getDefaultAdvanceLedgerDetails,
  normalizeAdvanceLedgerDetails,
} from "../../patientAdvance/utils/patientAdvanceUtils";
import { CategoryItem, OpdBillingSectionProps, OptionItem, ServiceBindingItem } from "../types";
import { sanitizeQtyDraft } from "./helperFunction";

const OpdBillingSection = ({
  patientId,
  formResetKey,
  billingDetailsRef,
  insuranceList,
  hasSelectedService,
  insuranceSelectHandler,
  selectedInsurance,
  selectedCorporate,
  corporateSelectOption,
  corporateSelectHandler,
  selectedCorporateError,
  doctorRef,
  selectedDoctor,
  doctorSelectOption,
  doctorSelectHandler,
  selectDoctorError,
  inputFieldHandler,
  expiryDateChangeHandler,
  referralDateChangeHandler,
  selectedReferDoctor,
  referDoctorSelectOption,
  referDoctorSelectHandler,
  referDoctorPopUpHandler,
  categoryList,
  categorySelectHandler,
  selectedSubCategory,
  subCategorySelectOption,
  subCategorySelectHandler,
  selectedSubSubCategory,
  subSubCategorySelectOption,
  subSubCategorySelectHandler,
  serviceInputRef,
  searchTerm,
  serviceItemHandler,
  serviceInputKeyDownHandler,
  showPopup,
  serviceNameList,
  activeServiceIndex,
  setActiveServiceIndex,
  selectedServiceHandler,
  serviceDataTableItem,
  showDuplicateError,
  serviceValidationError,
  deleteHandler,
  rateChangeHandler,
  qtyChangeHandler,
  discountPercentageChangeHandler,
  discountChangeHandler,
  remarksChangeHandler,
  urgentChangeHandler,
  isPackageService,
  packagePopupHandler,
  servicePopupHandler,
  getPerformingDoctorOptions,
  performingDoctorChangeHandler,
  setOpdBillingFormData,
  setBillingValues,
  billingValues,
  billingPaymentDetails,
  maxDiscountPercentage,
  creditCopayment,
  showPaymentMode = false,
  hasDiscountApplied = false,
  bookingDetails = null,
  isPaymentCollectionMode = false,
}: OpdBillingSectionProps) => {
  const [qtyDrafts, setQtyDrafts] = useState<Record<number, string>>({});

  const { loading, fetchApi } = useGlobalApi();
  const [patientAdvanceAmount, setPatientAdvanceAmount] = useState<number>(0);
  const [patientAdvanceChecked, setPatientAdvanceChecked] = useState<boolean>(false);

  useEffect(() => {
    setQtyDrafts({});
  }, [formResetKey, serviceDataTableItem.length]);

  useEffect(() => {
    setPatientAdvanceChecked(false);
    setPatientAdvanceAmount(0);
  }, [formResetKey]);

  const getQtyDisplayValue = (rowIndex: number, item: ServiceBindingItem, isQtyFixed: boolean) => {
    if (isQtyFixed) return "1";
    if (qtyDrafts[rowIndex] !== undefined) return qtyDrafts[rowIndex];
    return String(Math.max(1, Number(item?.qty) || 1));
  };

  const applyQtyDraft = (rowIndex: number, rawValue: string, isQtyFixed: boolean) => {
    if (isQtyFixed) return;

    const sanitized = sanitizeQtyDraft(rawValue);
    setQtyDrafts(prev => ({ ...prev, [rowIndex]: sanitized }));

    if (sanitized) {
      qtyChangeHandler(rowIndex, sanitized);
    }
  };

  const commitQtyChange = (rowIndex: number, item: ServiceBindingItem, isQtyFixed: boolean) => {
    if (isQtyFixed) return;

    const rawDraft = qtyDrafts[rowIndex] ?? String(item?.qty ?? 1);
    setQtyDrafts(prev => {
      const next = { ...prev };
      delete next[rowIndex];
      return next;
    });

    qtyChangeHandler(rowIndex, rawDraft ? sanitizeQtyDraft(rawDraft) || 1 : 1);
  };

  const settledWithPatientAdvanceHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (!checked || !patientId) {
      setPatientAdvanceChecked(false);
      setPatientAdvanceAmount(0);
      return;
    }

    const patientAdvance = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_LEDGER_BILL,
      {},
      { params: { patientId } },
      { component: "OpdBillingSection" }
    );

    const ledgerDetails =
      normalizeAdvanceLedgerDetails(patientAdvance?.data, patientId) ??
      getDefaultAdvanceLedgerDetails(patientId);
    const availableAdvance = Number(ledgerDetails.TotalNetAmt ?? 0);

    if (availableAdvance <= 0) {
      showWarning("No patient advance balance is available for this patient.");
      setPatientAdvanceChecked(false);
      setPatientAdvanceAmount(0);
      return;
    }

    setPatientAdvanceChecked(true);
    setPatientAdvanceAmount(availableAdvance);
  };

  return (
    <div className="card mt-1">
      <div className="form-grid-4 ">
        <InputField label="Insurance Company">
          <select
            name="insuranceCompanyId"
            onChange={insuranceSelectHandler}
            className={hasSelectedService ? "disabled-input-field" : "input-field"}
            disabled={hasSelectedService}
            value={selectedInsurance ?? 0}
          >
            <option value={0}>Self</option>
            {insuranceList.map((item: InsuranceItem) => (
              <option key={item?.insuranceCompanyId} value={item?.insuranceCompanyId}>
                {item?.insuranceCompanyName}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Corporate">
          <Select<OptionItem, false>
            value={selectedCorporate}
            options={corporateSelectOption}
            placeholder="Select corporate"
            isSearchable={!hasSelectedService}
            isClearable={!hasSelectedService}
            isDisabled={hasSelectedService}
            onChange={corporateSelectHandler}
            styles={SelectStyles as StylesConfig<OptionItem, false>}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          {!!selectedCorporateError && (
            <p className="input-field-error">{selectedCorporateError}</p>
          )}
        </InputField>

        {/* Doctor selection: the flag to prevent duplicate registration charge service additions is managed in the parent OpdBilling (index.tsx) doctorSelectHandler */}
        <InputField label="Doctor">
          <Select<OptionItem, false>
            ref={doctorRef as React.RefObject<never>}
            value={selectedDoctor}
            options={doctorSelectOption}
            placeholder="Select doctor"
            isSearchable
            isClearable
            onChange={doctorSelectHandler}
            styles={SelectStyles as StylesConfig<OptionItem, false>}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          {!!selectDoctorError && <p className="input-field-error">{selectDoctorError}</p>}
        </InputField>

        {!!selectedInsurance && (
          <>
            <InputField label="Policy Number">
              <input
                type="text"
                className="input-field"
                placeholder="Enter policy number"
                name="policyNo"
                onChange={inputFieldHandler}
                maxLength={20}
              />
            </InputField>
            <InputField label="Policy Card Number">
              <input
                type="text"
                className="input-field"
                placeholder="Enter policy card number"
                name="policyCardNo"
                onChange={inputFieldHandler}
                maxLength={20}
              />
            </InputField>
            <InputField label="Expiry Date">
              <CustomDateInput
                name="expiryDate"
                onChange={(value: string) => expiryDateChangeHandler(value)}
              />
            </InputField>
            <InputField label="Card Holder Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter card holder name"
                name="cardHolder"
                onChange={inputFieldHandler}
                maxLength={100}
                onInput={allowOnlyText}
              />
            </InputField>
            <InputField label="Referral Number">
              <input
                type="text"
                className="input-field"
                placeholder="Enter referral number"
                name="referalNo"
                onChange={inputFieldHandler}
                maxLength={100}
              />
            </InputField>
            <InputField label="Referal Date">
              <CustomDateInput
                name="referalDate"
                onChange={(value: string) => referralDateChangeHandler(value)}
              />
            </InputField>
          </>
        )}

        <InputField label="Referred By">
          <div className="flex gap-2 items-center">
            <Select<OptionItem, false>
              value={selectedReferDoctor}
              options={referDoctorSelectOption}
              placeholder="Select referred doctor"
              isSearchable
              isClearable
              onChange={referDoctorSelectHandler}
              styles={SelectStyles as StylesConfig<OptionItem, false>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            <button type="button" onClick={referDoctorPopUpHandler}>
              <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
            </button>
          </div>
        </InputField>

        <InputField>
          <select className="input-field" onChange={categorySelectHandler}>
            <option value={"1,3,4,5,10,11"}>All category</option>
            {categoryList.map((c: CategoryItem) => (
              <option key={c?.categoryId} value={c?.categoryId}>
                {c?.categoryName}
              </option>
            ))}
          </select>
        </InputField>

        <InputField>
          <Select<OptionItem, false>
            value={selectedSubCategory}
            options={subCategorySelectOption}
            placeholder="Select sub category"
            isSearchable
            isClearable
            onChange={subCategorySelectHandler}
            styles={SelectStyles as StylesConfig<OptionItem, false>}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>

        <InputField>
          <Select<OptionItem, false>
            value={selectedSubSubCategory}
            options={subSubCategorySelectOption}
            placeholder="Select sub sub category"
            isSearchable
            isClearable
            onChange={subSubCategorySelectHandler}
            styles={SelectStyles as StylesConfig<OptionItem, false>}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>

        <div>
          <InputField label="">
            <div className="relative w-full">
              <input
                ref={serviceInputRef}
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
          <div className="flex flex-row gap-2 justify-center items-center">
            <button type="button" className="save-btn text-sm">
              Investigation
            </button>
            <button type="button" className="save-btn text-sm">
              Consultation
            </button>
          </div>
        </div>
      </div>

      <div className="w-full ">
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-6 px-3 py-2 text-md justify-between">
            <div className="flex items-center gap-1 text-orange-500">
              <span className="w-3 h-3 rounded-full opd-zero-rate border border-orange-300"></span>
              Rate Not Set
            </div>

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
                          <td colSpan={OpdBillingServiceTableHeader.length} className="table-empty">
                            No records found
                          </td>
                        </tr>
                      )}

                      {serviceDataTableItem.map((item: ServiceBindingItem, idx: number) => {
                        const isQtyFixed = [1, 3, 11].includes(Number(item?.categoryTypeId));
                        const isDiscountLocked =
                          isPaymentCollectionMode || Number(item?.isDiscountLocked ?? 0) === 1;
                        const isBookingServiceLocked =
                          Number(item?.isBookingServiceLocked ?? 0) === 1;

                        const rowBgClass =
                          Number(item?.rate ?? 0) === 0
                            ? "opd-zero-rate"
                            : Number(item?.isNonPayable ?? 0) === 1
                              ? "opd-non-payable"
                              : Number(item?.isCorporateDiscount ?? 0) === 1
                                ? "opd-corporate-discount"
                                : Number(item?.isPrivilegedCardDiscount ?? 0) === 1
                                  ? "opd-privileged-card-discount"
                                  : "";

                        return (
                          <tr
                            key={idx}
                            className={`table-row ${rowBgClass}`}
                            onDoubleClick={() => {
                              if (!isBookingServiceLocked) {
                                deleteHandler(idx);
                              }
                            }}
                          >
                            <td className="table-td">{idx + 1}</td>
                            <td className="table-td ">
                              <div className="flex items-center justify-between ">
                                <span>{item?.serviceName || "-"}</span>

                                {item?.categoryTypeId === 11 ||
                                (item?.reportTypeId === 1 && item?.categoryTypeId === 3) ? (
                                  <i
                                    className="fa-solid fa-magnifying-glass icon-color-button cursor-pointer -ml-20"
                                    title={
                                      isPackageService(item?.serviceName)
                                        ? "Package Service"
                                        : "Service"
                                    }
                                    onClick={() => {
                                      if (isPackageService(item?.serviceName)) {
                                        packagePopupHandler(item?.serviceItemId);
                                      } else {
                                        servicePopupHandler(item);
                                      }
                                    }}
                                  />
                                ) : (
                                  <></>
                                )}
                              </div>
                            </td>
                            <td className="table-td">{item?.code || "-"}</td>
                            <td className="table-td">{selectedDoctor?.label}</td>

                            <td className="table-td wrap-break-word max-w-30">
                              {Number(item?.isRequiredSeparatePerformingDoctor) === 1 ? (
                                <select
                                  className="input-field max-w-50 max-h-10"
                                  value={Number(item?.doctorId ?? 0)}
                                  onChange={e =>
                                    performingDoctorChangeHandler(idx, Number(e.target.value))
                                  }
                                >
                                  <option value={0}>Select doctor</option>
                                  {getPerformingDoctorOptions(item?.doctorDepartmentIds).map(
                                    doctor => (
                                      <option key={doctor.value} value={doctor.value}>
                                        {doctor.label}
                                      </option>
                                    )
                                  )}
                                </select>
                              ) : (
                                <></>
                              )}
                            </td>
                            <td className="table-td">
                              <input
                                className={`max-w-20 max-h-10 ${
                                  isQtyFixed
                                    ? "disabled-input-field cursor-not-allowed"
                                    : "input-field"
                                }`}
                                value={getQtyDisplayValue(idx, item, isQtyFixed)}
                                onChange={e => applyQtyDraft(idx, e.target.value, isQtyFixed)}
                                onFocus={e => {
                                  if (isQtyFixed) return;
                                  setQtyDrafts(prev => ({
                                    ...prev,
                                    [idx]: String(item?.qty ?? 1),
                                  }));
                                  e.target.select();
                                }}
                                onBlur={() => commitQtyChange(idx, item, isQtyFixed)}
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
                                onChange={e => rateChangeHandler(e, idx)}
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
                                onChange={e => discountPercentageChangeHandler(e, idx)}
                                disabled={isDiscountLocked}
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
                                onChange={e => discountChangeHandler(e, idx)}
                                disabled={isDiscountLocked}
                              />
                            </td>
                            <td className="table-td input-field-error">
                              {item?.netAmount ?? item?.rate}
                            </td>

                            <td className="table-td">
                              <input
                                className="input-field max-w-40 max-h-10"
                                value={item?.remarks ?? ""}
                                onChange={e => remarksChangeHandler(e, idx)}
                                placeholder="Enter remarks"
                              />
                            </td>
                            <td className="table-td">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={Boolean(
                                  (item as { isUrgent?: number | string | null })?.isUrgent
                                )}
                                onChange={e => urgentChangeHandler(e, idx)}
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
            {!!showDuplicateError && <p className="input-field-error">{showDuplicateError}</p>}
            {!!serviceValidationError && (
              <p className="input-field-error">{serviceValidationError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="payment details">
        <div className="flex justify-end mb-1">
          <div className="flex flex-wrap items-center gap-4 px-4 py-2">
            {patientAdvanceChecked && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Patient Advance Net Amount:
                </label>
                <span className="text-base font-bold text-green-600">
                  ₹ {patientAdvanceAmount.toFixed(2)}
                </span>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={patientAdvanceChecked}
                onChange={settledWithPatientAdvanceHandler}
              />
              <span>Settled with Patient Advance</span>
            </label>
          </div>
        </div>
        <BillingDetails
          key={`billing-details-${formResetKey}`}
          ref={billingDetailsRef}
          setOpdBilling={setOpdBillingFormData}
          setBillingValues={setBillingValues}
          billingValues={billingValues}
          paymentBilling={billingPaymentDetails}
          maxDiscountPercentage={maxDiscountPercentage}
          creditCopayment={creditCopayment}
          showPaymentMode={showPaymentMode}
          hasDiscountApplied={hasDiscountApplied}
          bookingDetails={bookingDetails}
          patientAdvanceEnabled={patientAdvanceChecked && patientAdvanceAmount > 0}
          patientAdvanceAmount={patientAdvanceAmount}
          disableDiscountEditing={isPaymentCollectionMode}
          corporateId={Number(selectedCorporate?.value ?? 1) || 1}
          isRefundPaymentModes={0}
        />
      </div>
      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default OpdBillingSection;
