import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { OptionItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { CorporateItem, InsuranceItem, IpdPatientItem, ServiceItem } from "../types";

type PreviousCorporateListItem = {
  InsuranceCompanyName: string;
  BillingTypeId: number;
  CorporateName: string;
  IsCurrent: number;
  CreatedOn: string;
  CreatedBy: string;
  TransferedOn: string;
  TransferedBy: string;
};

const CorporateTransfer = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();

  const today = new Date().toISOString().split("T")[0];

  const [isChangeTariff, setIsChangeTariff] = useState(0);

  const [selectedCorporate, setSelectedCorporate] = useState<OptionItem | null>(null);

  const relationTypeList = usePickMaster("PatientRelation")?.pickMasterValue ?? [];

  const [payloadValue, setPayloadValue] = useState({
    branchId: patient?.BranchId,
    visitId: patient?.VisitId,
    patientId: patient?.PatientId,
    insuranceCompanyId: patient?.InsuranceCompanyId ?? 0,
    billingTypeId: 120837,
    corporateId: patient?.CorporateId || 1,
    isChangeTariff: 0,
    relation: "S/O",
    relativeName: "",
    cardNo: "",
    changeTariffFromDate: "",
    changeTariffToDate: "",
  });

  // pre filled data
  useEffect(() => {
    setPayloadValue(prev => ({
      ...prev,
      branchId: patient?.BranchId,
      visitId: patient?.VisitId,
      patientId: patient?.PatientId,
      insuranceCompanyId: patient?.InsuranceCompanyId ?? 0,
      billingTypeId: 120837,
      corporateId: patient?.CorporateId || 1,
      isChangeTariff: 0,
      relation: "S/O",
      relativeName: "",
      cardNo: "",
      changeTariffFromDate: "",
      changeTariffToDate: "",
    }));

    if (patient?.CorporateId) {
      const corporateItem = corporarteList.find(
        (item: CorporateItem) => item.corporateId === patient.CorporateId
      );
      setSelectedCorporate(
        corporateItem
          ? { value: corporateItem.corporateId, label: corporateItem.corporateName }
          : null
      );
    }
  }, [patient]);

  // insurance list
  const getInsuranceLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INSURANCE_COMPANY_MASTER_LIST,
      {},
      {},
      { component: "CorporateTransfer" }
    );
    return resp?.data ?? [];
  };

  const { data: insuranceCompanyList = [] } = useQuery({
    queryKey: ["insurance-list"],
    queryFn: getInsuranceLists,
  });

  // branch select handler
  const insuranceSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setPayloadValue(prev => ({
      ...prev,
      insuranceCompanyId: value,
      corporateId: 0,
    }));
    setSelectedCorporate(null);
  };

  // corporate list
  const getCorporateList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_LIST_BY_INSURANCE_COMPANY_ID,
      {},
      {
        params: {
          branchId: patient?.BranchId,
          insuranceCompanyId: payloadValue.insuranceCompanyId ?? 0,
        },
      },
      { component: "CorporateTransfer" }
    );
    return resp?.data ?? [];
  };

  const { data: corporarteList = [] } = useQuery({
    queryKey: ["corporate-list", payloadValue.insuranceCompanyId],
    queryFn: getCorporateList,
  });

  const corprateSelectOption = useMemo(() => {
    return corporarteList.map((corporate: CorporateItem) => ({
      value: corporate.corporateId,
      label: corporate.corporateName,
    }));
  }, [corporarteList]);

  // corporate select handler
  const corporateSelectHandler = (optionItem: OptionItem | null) => {
    setSelectedCorporate(optionItem);
    setPayloadValue(prev => ({
      ...prev,
      corporateId: optionItem ? Number(optionItem.value) : 0,
    }));
  };

  // proposed billing  category
  const getProposedBillingCategoryList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryTypeId: 10, isActive: 1 } },
      { component: "CorporateTransfer" }
    );
    return resp?.data ?? [];
  };

  const { data: proposedBillingCategoryList = [] } = useQuery({
    queryKey: ["proposed-billing-category-list"],
    queryFn: getProposedBillingCategoryList,
  });

  //   get previous corporate list (history)
  const getPreviousCorporates = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_PATIENT_CORPORATE_HISTORY,
      {},
      { params: { visitId: patient?.VisitId } },
      { component: "CorporateTransfer" }
    );
    return resp?.data ?? [];
  };

  const { data: previousCorporateList = [], refetch: corporateHistoryRefetch } = useQuery({
    queryKey: ["previousCorporateList", patient?.VisitId],
    queryFn: getPreviousCorporates,
    enabled: !!patient?.VisitId,
  });

  const transferCorporateHandler = async () => {
    if (!payloadValue.billingTypeId || !payloadValue.corporateId) {
      showWarning("Please select insurance, corporate and billing type");
      return;
    }
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_IPD_PATIENT_TARRIF_DETAILS,
      payloadValue,
      {},
      { component: "CorporateTransfer" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Error while transferring corporate");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    corporateHistoryRefetch?.();
  };

  // change tarrif select handler
  const changeTarrifSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setIsChangeTariff(value);
    setPayloadValue(prev => ({
      ...prev,
      isChangeTariff: value,
    }));
  };

  // from date
  const fromDateChangeHandler = (value: string) => {
    setPayloadValue(prev => ({
      ...prev,
      changeTariffFromDate: formatToDDMMYYYY(value),
    }));
  };

  // to date
  const toDateChangeHandler = (value: string) => {
    setPayloadValue(prev => ({
      ...prev,
      changeTariffToDate: formatToDDMMYYYY(value),
    }));
  };

  // relation change handler
  const relationChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPayloadValue(prev => ({
      ...prev,
      relation: value,
    }));
  };

  // relative name change handler
  const relativeNameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPayloadValue(prev => ({
      ...prev,
      relativeName: value,
    }));
  };

  // card no change handler
  const cardNoChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPayloadValue(prev => ({
      ...prev,
      cardNo: value,
    }));
  };

  // billing type change handler
  const billingTypeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setPayloadValue(prev => ({
      ...prev,
      billingTypeId: value,
    }));
  };

  return (
    <div>
      <h3 className="ipd-billing-text">Corporate Transfer</h3>
      <div className="form-grid-4">
        <InputField label="Insurance" required>
          <select
            className="input-field"
            value={payloadValue.insuranceCompanyId}
            onChange={insuranceSelectHandler}
          >
            <option>--Select--</option>
            {insuranceCompanyList.map((i: InsuranceItem) => (
              <option key={i?.insuranceCompanyId} value={i?.insuranceCompanyId}>
                {i?.insuranceCompanyName}
              </option>
            ))}
          </select>
        </InputField>
        <InputField label="Corporate" required>
          <Select
            options={corprateSelectOption}
            value={selectedCorporate}
            name="corporate"
            onChange={corporateSelectHandler}
            placeholder="Select Corporate"
            styles={SelectStyles as any}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>
        <InputField label="Change Tarrif">
          <select
            className="input-field"
            value={payloadValue.isChangeTariff}
            onChange={changeTarrifSelectHandler}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </InputField>

        <InputField label="Proposed Billing Category" required>
          <select
            className="input-field"
            value={payloadValue?.billingTypeId}
            onChange={billingTypeChangeHandler}
          >
            <option value={0}>--Select--</option>
            {proposedBillingCategoryList.map((p: ServiceItem) => (
              <option value={p?.serviceItemId} key={p?.serviceItemId}>
                {p?.name}
              </option>
            ))}
          </select>
        </InputField>
        <InputField label="Relation">
          <select
            className="input-field"
            value={payloadValue.relation}
            onChange={relationChangeHandler}
          >
            <option value={0}>--Select--</option>
            {relationTypeList.map((r: any) => (
              <option value={r?.value} key={r?.value}>
                {r?.key}
              </option>
            ))}
          </select>
        </InputField>
        <InputField label="Relative Name">
          <input
            className="input-field"
            value={payloadValue.relativeName}
            onChange={relativeNameChangeHandler}
            placeholder="Enter relative name"
          />
        </InputField>
        <InputField label="Card No./ Policy No.">
          <input
            className="input-field"
            value={payloadValue.cardNo}
            onChange={cardNoChangeHandler}
            placeholder="Enter card / policy number"
          />
        </InputField>
        {isChangeTariff === 1 && (
          <>
            <InputField label="Change Tariff From Date">
              <CustomDateInput
                value={payloadValue?.changeTariffFromDate}
                onChange={fromDateChangeHandler}
              />
            </InputField>

            <InputField label="Change Tariff To Date">
              <CustomDateInput
                value={payloadValue?.changeTariffToDate}
                onChange={toDateChangeHandler}
              />
            </InputField>
          </>
        )}
      </div>
      <div className="form-actions-responsive mt-1">
        <SubmitButton label="Transfer" onClick={transferCorporateHandler} />
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}

      <h3 className="ipd-billing-text mt-8 mb-3">Corporate Transfer History</h3>
      <div className="overflow-x-auto">
        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size w-full lg:max-h-100">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Insurance</th>
                    <th className="table-th">Corporate</th>
                    <th className="table-th">Billing Category</th>
                    <th className="table-th">Created By</th>
                    <th className="table-th">Created On</th>
                    <th className="table-th">Transferred By</th>
                    <th className="table-th">Transferred On</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previousCorporateList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="table-empty text-center py-4">
                        No transfer history found
                      </td>
                    </tr>
                  )}
                  {previousCorporateList.map((item: PreviousCorporateListItem, index: number) => {
                    const billingCategory = proposedBillingCategoryList.find(
                      (category: ServiceItem) => category.serviceItemId === item.BillingTypeId
                    );
                    return (
                      <tr
                        key={index}
                        className={`table-row ${item.IsCurrent === 1 ? "bg-green-300 text-green-800" : ""}`}
                      >
                        <td className="table-td">{index + 1}</td>
                        <td className="table-td">{item.InsuranceCompanyName || "-"}</td>
                        <td className="table-td">{item.CorporateName || "-"}</td>
                        <td className="table-td">
                          {billingCategory?.name || item.BillingTypeId || "-"}
                        </td>
                        <td className="table-td">{item.CreatedBy || "-"}</td>
                        <td className="table-td">{item.CreatedOn || "-"}</td>
                        <td className="table-td">{item.TransferedBy || "-"}</td>
                        <td className="table-td">{item.TransferedOn || "-"}</td>
                        <td className="table-td">
                          {item.IsCurrent === 1 ? (
                            <span className="badge badge-success text-green-600 font-semibold bg-green-100 px-2 py-1 rounded">
                              Current
                            </span>
                          ) : (
                            <span className="badge badge-secondary text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">
                              Transferred
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateTransfer;
