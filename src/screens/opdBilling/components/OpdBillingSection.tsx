import BillingDetails from "@/components/BillingDetails";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import { OpdBillingServiceTableHeader } from "@/constants/tableHeaders";
import { allowOnlyText } from "@/utils/inputValidationHandler";
import Select, { StylesConfig } from "react-select";
import { InsuranceItem } from "../../branchMaster/types";
import {
  CategoryItem,
  OpdBillingSectionProps,
  OptionItem,
  ServiceBindingItem,
  ServiceItemList,
} from "../types";

const OpdBillingSection = ({
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
  discountPercentageChangeHandler,
  discountChangeHandler,
  urgentChangeHandler,
  isPackageService,
  packagePopupHandler,
  servicePopupHandler,
  setOpdBillingFormData,
  setBillingValues,
  billingValues,
  billingPaymentDetails,
  maxDiscountPercentage,
}: OpdBillingSectionProps) => {
  return (
    <div className="card mt-1">
      <div className="form-grid-4">
        <InputField label="Insurance Company">
          <select
            name="insuranceCompanyId"
            onChange={insuranceSelectHandler}
            className={hasSelectedService ? "disabled-input-field" : "input-field"}
            disabled={hasSelectedService}
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
            styles={
              hasSelectedService ? undefined : (SelectStyles as StylesConfig<OptionItem, false>)
            }
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          {!!selectedCorporateError && (
            <p className="input-field-error">{selectedCorporateError}</p>
          )}
        </InputField>

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
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="w-full md:w-1/3 flex flex-col gap-2">
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
              <option value={"1,3,4,5,8,11"}>All category</option>
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
            <InputField>
              <div className="relative w-full">
                <input
                  ref={serviceInputRef}
                  className="input-field"
                  placeholder="Type to search services"
                  value={searchTerm}
                  onChange={serviceItemHandler}
                  onKeyDown={serviceInputKeyDownHandler}
                />
                {showPopup && serviceNameList?.length > 0 && (
                  <div className="absolute top-full left-0  w-full bg-white border border-gray-300 rounded-md shadow-md z-50 max-h-60 overflow-y-auto">
                    {serviceNameList.map((s: ServiceItemList, index: number) => (
                      <div
                        key={index}
                        className={`px-3 py-2 cursor-pointer text-sm ${
                          index === activeServiceIndex ? "bg-green-100" : "hover:bg-green-200"
                        }`}
                        onMouseEnter={() => setActiveServiceIndex(index)}
                        onClick={() => selectedServiceHandler(s)}
                      >
                        {s?.name}
                      </div>
                    ))}
                  </div>
                )}
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

        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className=" w-full ">
            <div className="flex flex-wrap items-center gap-6 px-3 py-2 text-md justify-between">
              <div className="flex items-center gap-1 text-orange-500">
                <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                Rate Not Set
              </div>

              <div className="flex items-center gap-1 text-blue-500">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                Corporate Non-Payable
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                Corporate Wise Discount
              </div>

              <div className="flex items-center gap-1 text-pink-400">
                <span className="w-3 h-3 rounded-full bg-pink-300"></span>
                Privileged Card Discount
                <span className="text-red-500 ml-1">ⓘ</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="table-container ">
                <div className="table-scroll-wrapper ">
                  <div className="table-size lg:min-h-80 lg:max-h-80 lg:max-w-260">
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
                            <td
                              colSpan={OpdBillingServiceTableHeader.length}
                              className="table-empty"
                            >
                              No records found
                            </td>
                          </tr>
                        )}

                        {serviceDataTableItem.map((item: ServiceBindingItem, idx: number) => (
                          <tr key={idx} className="table-row">
                            <td className="table-td ">
                              <button type="button" onClick={() => deleteHandler(idx)}>
                                <i className="fa-solid fa-trash icon-color-delete cursor-pointer"></i>
                              </button>
                            </td>
                            <td className="table-td">{idx + 1}</td>
                            <td className="table-td ">
                              <div className="flex items-center justify-between ">
                                <span>{item?.serviceName || "-"}</span>

                                {item?.ReportTypeId === 1 ? (
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
                            <td className="table-td wrap-break-word max-w-30">
                              {item?.doctorName || "-"}
                            </td>
                            <td className="table-td">{item?.qty ?? 1}</td>
                            <td className="table-td">
                              <input
                                value={item?.rate ?? 0}
                                onChange={e => rateChangeHandler(e, idx)}
                                className={`max-w-20 max-h-8 ${
                                  item?.isRateEditable === 1
                                    ? "input-field"
                                    : "disabled-input-field"
                                }`}
                                disabled={item?.isRateEditable !== 1}
                              />
                            </td>
                            <td className="table-td">
                              <input
                                className={`${
                                  item?.discountPer === 1
                                    ? "disabled-input-field max-w-20 max-h-8"
                                    : "input-field max-w-20 max-h-8"
                                }`}
                                value={item?.discountPer ?? 0}
                                onChange={e => discountPercentageChangeHandler(e, idx)}
                              />
                            </td>
                            <td className="table-td">
                              <input
                                className="input-field max-w-20 max-h-8"
                                value={item?.dis ?? 0}
                                onChange={e => discountChangeHandler(e, idx)}
                              />
                            </td>
                            <td className="table-td text-red-500">
                              {item?.netAmount ?? item?.rate}
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
                        ))}
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
      </div>

      <div className="payment details">
        <BillingDetails
          key={`billing-details-${formResetKey}`}
          ref={billingDetailsRef}
          setOpdBilling={setOpdBillingFormData}
          setBillingValues={setBillingValues}
          billingValues={billingValues}
          paymentBilling={billingPaymentDetails}
          maxDiscountPercentage={maxDiscountPercentage}
        />
      </div>
    </div>
  );
};

export default OpdBillingSection;
