import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useAssignBranchRight } from "@/store/useAssignBranchRight";
import { OptionItem, PickMasterItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import CorporateTransferConfirmCancelPopup from "../../corporateTransferConfirmation/components/CorporateTransferConfirmCancelPopup";
import { ApprovalLists, CorporateItem, InsuranceItem, IpdPatientItem, ServiceItem } from "../types";

const CorporateTransfer = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  const roleId = useContext(RoleContext)?.roleId;
  const location = useLocation();
  const confirmationItem = location.state?.patient;
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<ApprovalLists | null>(null);
  const activeApprovalItem = selectedApprovalItem || confirmationItem;
  const isConfirmationMode = !!activeApprovalItem?.CorporateTransferId;
  const [isInputsDisabled, setIsInputsDisabled] = useState(isConfirmationMode);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
  const [cancelItem, setCancelItem] = useState<ApprovalLists | null>(null);

  useEffect(() => {
    setIsInputsDisabled(isConfirmationMode);
  }, [isConfirmationMode]);

  const reasonForTransferList = usePickMaster("ReasonForCorporateTransfer")?.pickMasterValue ?? [];

  const { rights: branchRights } = useAssignBranchRight();

  const isPatientCorporateTransferApprovalRequired = Number(
    branchRights?.IsPatientCorporateTransferApprovalRequired
  );

  const [isChangeTariff, setIsChangeTariff] = useState(0);

  const [selectedCorporate, setSelectedCorporate] = useState<OptionItem | null>(null);

  const relationTypeList = usePickMaster("PatientRelation")?.pickMasterValue ?? [];

  const [payloadValue, setPayloadValue] = useState({
    branchId: patient?.BranchId,
    visitId: patient?.VisitId,
    roleId,
    patientId: patient?.PatientId,
    typeId: 2,
    insuranceCompanyId: 0,
    billingTypeId: 120837,
    corporateId: 0,
    isChangeTariff: 0,
    relation: "S/O",
    relativeName: "",
    cardNo: "",
    changeFromDate: "",
    changeToDate: "",
    transferDate: "",
    remarks: "",
    reasonForTransfer: "",
    authorizationNumber: "",
  });

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

  // pre filled data
  useEffect(() => {
    if (!patient?.VisitId) return;

    if (isConfirmationMode && activeApprovalItem) {
      setPayloadValue(prev => ({
        ...prev,
        branchId: patient?.BranchId,
        visitId: patient?.VisitId,
        patientId: patient?.PatientId,
        roleId,
        insuranceCompanyId: activeApprovalItem.InsuranceCompanyId || 0,
        billingTypeId: activeApprovalItem.BillingTypeId || 120837,
        corporateId: activeApprovalItem.CorporateId || 0,
        isChangeTariff: activeApprovalItem.IsChangeTariff || 0,
        relation: activeApprovalItem.Relation || "S/O",
        relativeName: activeApprovalItem.RelativeName || "",
        cardNo: activeApprovalItem.CardNo || "",
        changeFromDate: activeApprovalItem.ChangeFromDate || "",
        changeToDate: activeApprovalItem.ChangeToDate || "",
        transferDate: activeApprovalItem.TransferDate || "",
        remarks: activeApprovalItem.Remarks || "",
        reasonForTransfer: activeApprovalItem.ReasonForTransfer || "",
        authorizationNumber: activeApprovalItem.AuthorizationNumber || "",
      }));
      setIsChangeTariff(activeApprovalItem.IsChangeTariff || 0);
      setSelectedCorporate(
        activeApprovalItem.CorporateId
          ? { value: activeApprovalItem.CorporateId, label: activeApprovalItem.CorporateName || "" }
          : null
      );
    } else {
      setPayloadValue(prev => ({
        ...prev,
        branchId: patient?.BranchId,
        visitId: patient?.VisitId,
        patientId: patient?.PatientId,
        roleId,
        insuranceCompanyId: patient?.InsuranceCompanyId ?? 0,
        billingTypeId: 120837,
        corporateId: patient?.CorporateId || 1,
        isChangeTariff: 0,
        relation: "S/O",
        relativeName: "",
        cardNo: "",
        changeFromDate: "",
        changeToDate: "",
        transferDate: "",
        remarks: "",
        reasonForTransfer: "",
        authorizationNumber: "",
      }));
      setIsChangeTariff(0);
    }
  }, [patient, isConfirmationMode, activeApprovalItem, roleId]);

  useEffect(() => {
    if (isConfirmationMode) return;
    if (payloadValue.insuranceCompanyId !== patient?.InsuranceCompanyId) return;

    const corporateIdToSelect = patient?.CorporateId;
    if (corporateIdToSelect) {
      const corporateItem = corporarteList.find(
        (item: CorporateItem) => item.corporateId === corporateIdToSelect
      );
      setSelectedCorporate(
        corporateItem
          ? { value: corporateItem.corporateId, label: corporateItem.corporateName }
          : { value: corporateIdToSelect, label: patient.Corporate }
      );
    }
  }, [patient, corporarteList, payloadValue.insuranceCompanyId, isConfirmationMode]);

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

  // from date
  const fromDateChangeHandler = (value: string) => {
    setPayloadValue(prev => ({
      ...prev,
      changeFromDate: formatToDDMMYYYY(value),
    }));
  };

  // from date
  const transferDateChangeHandler = (value: string) => {
    setPayloadValue(prev => ({
      ...prev,
      transferDate: value,
    }));
  };

  // reason for transfer
  const reasonForTransferChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPayloadValue(prev => ({
      ...prev,
      reasonForTransfer: value,
    }));
  };

  // to date
  const toDateChangeHandler = (value: string) => {
    setPayloadValue(prev => ({
      ...prev,
      changeToDate: formatToDDMMYYYY(value),
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

  // remarks change handler
  const remarksChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setPayloadValue(prev => ({
      ...prev,
      remarks: value,
    }));
  };

  // // billing type change handler
  // const billingTypeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
  //   const value = Number(e.target.value);
  //   setPayloadValue(prev => ({
  //     ...prev,
  //     billingTypeId: value,
  //   }));
  // };

  // authorization change handler
  const authorizationChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setPayloadValue(prev => ({
      ...prev,
      authorizationNumber: value,
    }));
  };

  // change tarrif select handler
  const changeTarrifSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isConfirmationMode) return;
    const value = Number(e.target.value);
    setIsChangeTariff(value);
    setPayloadValue(prev => ({
      ...prev,
      isChangeTariff: value,
    }));
  };

  // reset form
  const resetForm = () => {
    setSelectedApprovalItem(null);
    setPayloadValue(prev => ({
      ...prev,
      insuranceCompanyId: patient?.InsuranceCompanyId ?? 0,
      billingTypeId: 120837,
      corporateId: patient?.CorporateId || 1,
      isChangeTariff: 0,
      relation: "S/O",
      relativeName: "",
      cardNo: "",
      changeFromDate: "",
      changeToDate: "",
      transferDate: "",
      remarks: "",
      reasonForTransfer: "",
      authorizationNumber: "",
    }));
    setIsChangeTariff(0);

    const corporateIdToSelect = patient?.CorporateId;
    if (corporateIdToSelect) {
      const corporateItem = corporarteList.find(
        (item: CorporateItem) => item.corporateId === corporateIdToSelect
      );
      setSelectedCorporate(
        corporateItem
          ? { value: corporateItem.corporateId, label: corporateItem.corporateName }
          : { value: corporateIdToSelect, label: patient.Corporate }
      );
    } else {
      setSelectedCorporate(null);
    }
  };

  // transfer corporate handler
  const transferCorporateHandler = async () => {
    if (
      !payloadValue.billingTypeId ||
      !payloadValue.corporateId ||
      !payloadValue?.reasonForTransfer ||
      !payloadValue?.transferDate
    ) {
      showWarning("Please fill all the required fields");
      return;
    }
    if (Number(payloadValue?.corporateId) === Number(patient?.CorporateId)) {
      showWarning("Patient is already under this corporate. No transfer needed.");
      return;
    }
    const paylaodForTransfer = {
      branchId: payloadValue?.branchId,
      visitId: payloadValue?.visitId,
      patientId: payloadValue?.patientId,
      insuranceCompanyId: payloadValue?.insuranceCompanyId,
      billingTypeId: payloadValue?.billingTypeId,
      corporateId: payloadValue?.corporateId,
      isChangeTariff: payloadValue?.isChangeTariff,
      relation: payloadValue?.relation,
      relativeName: payloadValue?.relativeName,
      cardNo: payloadValue?.cardNo,
      changeTariffFromDate: payloadValue?.changeFromDate,
      changeTariffToDate: payloadValue?.changeToDate,
      transferDate: payloadValue?.transferDate,
      remarks: payloadValue?.remarks,
      reasonForTransfer: payloadValue?.reasonForTransfer,
      authorizationNumber: payloadValue?.authorizationNumber,
    };
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_IPD_PATIENT_TARRIF_DETAILS,
      paylaodForTransfer,
      {},
      { component: "CorporateTransfer" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Error while transferring corporate");
      return;
    }

    if (isConfirmationMode && activeApprovalItem?.CorporateTransferId) {
      const confirmResp = await fetchApi(
        "PATCH",
        ENDPOINTS.CONFIRM_CORPORATE_TRANSFER_REQUEST,
        { corporateTransferId: Number(activeApprovalItem.CorporateTransferId) },
        {},
        { component: "CorporateTransfer" }
      );
      if (confirmResp?.result) {
        setIsInputsDisabled(false);
      }
    }

    showSuccess(resp?.message ?? "Data saved successfully");
    corporateHistoryRefetch?.();
    refetchApprovalLists?.();
    queryClient.invalidateQueries({ queryKey: ["getTableDataList"] });
    resetForm();
  };

  // send for approval

  const sendForApprovalHandler = async () => {
    if (
      !payloadValue.billingTypeId ||
      !payloadValue.corporateId ||
      !payloadValue?.reasonForTransfer ||
      !payloadValue?.transferDate
    ) {
      showWarning("Please fill all the required fields");
      return;
    }
    if (Number(payloadValue?.corporateId) === Number(patient?.CorporateId)) {
      showWarning("Patient is already under this corporate. No transfer needed.");
      return;
    }
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_CORPORATE_TRANSFER_REQUEST_APPROVAL,
      payloadValue,
      {},
      { component: "CorporateTransfer" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Error while sending for approval");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    corporateHistoryRefetch?.();
    refetchApprovalLists?.();
    resetForm();
  };

  // table  for corporate
  // const getTableDataForCorprateChange = async () => {
  //   const resp = await fetchApi(
  //     "GET",
  //     ENDPOINTS.GET_SERVICE_DETAILS_FOR_CORPORATE_RATE_COMPARISON,
  //     {},
  //     { params: { visitId: patient?.VisitId, corporateId: selectedCorporate?.value } },
  //     { component: "CorporateTransfer" }
  //   );

  //   return resp?.data ?? [];
  // };

  // const { data: tableDataForCorprateChange } = useQuery({
  //   queryKey: ["corporate-table-data-for-change", patient?.VisitId, selectedCorporate?.value],
  //   queryFn: getTableDataForCorprateChange,
  //   enabled: !!patient?.VisitId && !!selectedCorporate?.value,
  // });

  // approval lists
  const getApprovalLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_TRANSFER_REQUEST_DETAILS_BY_VISIT_ID,
      {},
      { params: { visitId: patient?.VisitId } },
      { component: "CorporateTransfer" }
    );

    return resp?.data ?? [];
  };

  const { data: approvalLists = [], refetch: refetchApprovalLists } = useQuery({
    queryKey: ["getApprovalLists", patient?.VisitId],
    queryFn: getApprovalLists,
    enabled: !!patient?.VisitId,
  });

  const handleView = (item: ApprovalLists) => {
    setSelectedApprovalItem(item);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCancel = (item: ApprovalLists) => {
    setCancelItem(item);
    setCancelPopupOpen(true);
  };

  const handleCancelSuccess = () => {
    refetchApprovalLists?.();
  };

  return (
    <div ref={formRef}>
      <h3 className="ipd-billing-text">Corporate Transfer</h3>
      <div className="form-grid-4">
        <InputField label="Insurance" required>
          <select
            className="input-field"
            value={payloadValue.insuranceCompanyId}
            onChange={insuranceSelectHandler}
            disabled={isInputsDisabled}
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
            isDisabled={isInputsDisabled}
          />
        </InputField>

        <InputField label="Transfer Date" required>
          <CustomDateInput
            value={payloadValue?.transferDate}
            onChange={transferDateChangeHandler}
            disabled={isInputsDisabled}
          />
        </InputField>

        <InputField label="Reason For Transfer" required>
          <select
            className="input-field"
            value={payloadValue.reasonForTransfer}
            onChange={reasonForTransferChangeHandler}
            disabled={isInputsDisabled}
          >
            <option value="">--Select--</option>
            {reasonForTransferList.map((item: PickMasterItem) => (
              <option key={item?.value} value={item?.value}>
                {item?.key}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Authorization No.">
          <input
            className="input-field"
            value={payloadValue?.authorizationNumber}
            onChange={authorizationChangeHandler}
            placeholder="Enter authorization number"
            onInput={allowOnlyNumbers}
            disabled={isInputsDisabled}
          />
        </InputField>

        <InputField label="Change Tarrif">
          <select
            className="input-field"
            value={payloadValue.isChangeTariff}
            onChange={changeTarrifSelectHandler}
            disabled={isInputsDisabled}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </InputField>

        {isChangeTariff === 1 && (
          <>
            <InputField label="Change Tariff From Date">
              <CustomDateInput
                value={payloadValue?.changeFromDate}
                onChange={fromDateChangeHandler}
                disabled={isInputsDisabled}
              />
            </InputField>

            <InputField label="Change Tariff To Date">
              <CustomDateInput
                value={payloadValue?.changeToDate}
                onChange={toDateChangeHandler}
                disabled={isInputsDisabled}
              />
            </InputField>
          </>
        )}

        <InputField label="Relation">
          <select
            className="input-field"
            value={payloadValue.relation}
            onChange={relationChangeHandler}
            disabled={isInputsDisabled}
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
            disabled={isInputsDisabled}
          />
        </InputField>
        <InputField label="Card No./ Policy No.">
          <input
            className="input-field"
            value={payloadValue.cardNo}
            onChange={cardNoChangeHandler}
            placeholder="Enter card / policy number"
            disabled={isInputsDisabled}
          />
        </InputField>
        <InputField label="Remark">
          <input
            className="input-field"
            value={payloadValue?.remarks}
            onChange={remarksChangeHandler}
            placeholder="Enter remark"
            disabled={isInputsDisabled}
          />
        </InputField>

        <div className="col-span-1 md:col-span-2 lg:col-span-2 flex items-end justify-end mb-2">
          {isConfirmationMode ? (
            <SubmitButton label="Transfer" onClick={transferCorporateHandler} />
          ) : isPatientCorporateTransferApprovalRequired ? (
            <SubmitButton label="Send For Approval" onClick={sendForApprovalHandler} />
          ) : (
            <SubmitButton label="Transfer" onClick={transferCorporateHandler} />
          )}
        </div>
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}

      {/* corporate transfer approved Lists */}

      {isPatientCorporateTransferApprovalRequired === 1 && (
        <>
          <h3 className="ipd-billing-text mt-8 mb-3">Corporate Transfer Approved Lists</h3>
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
                        <th className="table-th">Transfer Date</th>
                        <th className="table-th">Reason For Transfer</th>
                        <th className="table-th">Authorization No.</th>
                        <th className="table-th">Remark</th>
                        <th className="table-th">Status</th>
                        <th className="table-th">Transfer</th>
                        <th className="table-th">Cancel</th>

                        {/* <th className="table-th">Authorization No.</th>
                    <th className="table-th">Reason For Transfer</th>
                    <th className="table-th">Remark</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Action</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {approvalLists.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="table-empty text-center py-4 text-slate-400">
                            No records found
                          </td>
                        </tr>
                      ) : (
                        approvalLists.map((item: ApprovalLists, index: number) => (
                          <tr key={item?.CorporateTransferId} className="table-tr">
                            <td className="table-td">{index + 1}</td>
                            <td className="table-td">{item?.InsuranceCompanyName}</td>
                            <td className="table-td">{item?.CorporateName}</td>
                            <td className="table-td">{item?.TransferDate}</td>
                            <td className="table-td">{item?.ReasonForTransfer}</td>
                            <td className="table-td">{item?.AuthorizationNumber || "--"}</td>
                            <td className="table-td">{item?.Remarks || "--"}</td>
                            <td className="table-td">{item?.Status}</td>

                            <td className="table-td">
                              <button
                                className={`${!item?.IsCorporateTransferApproved || item?.IsCorporateTransferCreated ? "disable-btn" : "save-btn"}`}
                                onClick={() => handleView(item)}
                                disabled={
                                  !item?.IsCorporateTransferApproved ||
                                  !!item?.IsCorporateTransferCreated
                                }
                              >
                                Transfer
                              </button>
                            </td>

                            <td className="table-td">
                              <button
                                className={`${item?.IsCancel || item?.IsCorporateTransferCreated ? "disable-btn" : "cancel-button"}`}
                                onClick={() => handleCancel(item)}
                                disabled={!!item?.IsCancel || !!item?.IsCorporateTransferCreated}
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {cancelPopupOpen && cancelItem && (
        <CorporateTransferConfirmCancelPopup
          isOpen={cancelPopupOpen}
          popupType="cancel"
          item={cancelItem as any}
          onClose={() => {
            setCancelPopupOpen(false);
            setCancelItem(null);
          }}
          onSuccess={handleCancelSuccess}
        />
      )}

      {/* corporate transfer history   */}
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
                  {previousCorporateList.map((item, index: number) => {
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
