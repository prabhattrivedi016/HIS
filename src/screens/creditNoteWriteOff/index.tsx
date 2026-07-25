import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import GlobalFooterButtons from "@/components/globalButtons/GlobalFooterButtons";
import SearchIconButton from "@/components/globalButtons/SearchIconButton";
import { ENDPOINTS } from "@/config/defaults";
import { PageType } from "@/constants/constants";
import { creditNoteTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { formatDisplayDate } from "@/utils/dateConvertHandler";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import FilterBillPopup from "./components/FilterBillPopup";
import { ApprovalList, BillDetailsItem, CreditNoteBillDetailItem } from "./types";

const CreditNote = () => {
  const { loading, fetchApi } = useGlobalApi();
  const location = useLocation();
  const navigate = useNavigate();
  const vistiIdFromCreditGeneration = location?.state?.item?.VisitId ?? 0;
  const creditNoteIdFromCreditGeneration = location?.state?.item?.CreditNoteId ?? 0;
  const shouldSaveButtonVisible = vistiIdFromCreditGeneration > 0 ? true : false;
  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;
  const roleId = useContext(RoleContext)?.roleId ?? 2;
  const [billNumberValue, setBillNumberValue] = useState<string>("");
  const [creditNoteTableList, setCreditNoteTableList] = useState<CreditNoteBillDetailItem[]>([]);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [selectedBillForCreditNote, setSelectedBillForCreditNote] =
    useState<BillDetailsItem | null>(null);
  const [creditNotePerAmount, setCreditNotePreAmount] = useState<number>(0);
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [totalSumAmount, setTotalSumAmount] = useState<number>(0);
  const [valueDisable, setValueDisable] = useState<boolean>(false);
  const [checkedCreditList, setCheckedCreditList] = useState<CreditNoteBillDetailItem[]>([]);

  const [patientDetails, setPatientDetails] = useState({
    patientId: "",
    patientName: "",
    uhid: "",
    dob: "",
    VisitId: "",
    billNo: "",
    billId: "",
    billDate: "",
    doctorName: "",
    corporateName: "",
    serviceName: "",
    totalBillAmount: "",
    totalDiscountOnBill: "",
    totalPaidAmount: "",
    totalBalanceAmount: "",
    totalCreditNoteAmount: "",
  });

  const [creditNoteApprovalValeus, setCreditNoteApprovalValues] = useState({
    totalCreditNoteAmount: 0,
    creditNoteApprovedID: 0,
    creditNoteApprovedName: "",
    creditNoteReason: "",
    creditNoteRemark: "",
  });

  const [errors, setErrors] = useState({
    creditNoteApprovedID: "",
    creditNoteReason: "",
    totalCreditNoteAmount: "",
  });

  /*
   */

  const getCreditNoteDetails = async (
    creditNoteId: number,
    currentTableList: CreditNoteBillDetailItem[]
  ) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CREDIT_NOTE_REQUEST_DETAILS_BY_CREDIT_NOTE_ID,
      {},
      { params: { creditNoteId } },
      { component: "CreditNote" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "No data found");
      setValueDisable(false);
      return;
    }
    setValueDisable(true);
    setCreditNoteApprovalValues({
      totalCreditNoteAmount: Number(resp?.data?.[0]?.TotalCreditNoteAmount),
      creditNoteApprovedID: Number(resp?.data?.[0]?.CreditNoteApprovedID),
      creditNoteApprovedName: resp?.data?.[0]?.CreditNoteApprovedName,
      creditNoteReason: resp?.data?.[0]?.CreditNoteReason,
      creditNoteRemark: resp?.data?.[0]?.CreditNoteRemark,
    });
    const detailsList = resp?.data ?? [];
    setCheckedCreditList(detailsList);

    const updatedList = currentTableList.map(billItem => {
      const match = detailsList.find(
        (d: any) => Number(d.ServiceItemId) === Number(billItem.ServiceItemId)
      );
      if (match) {
        return {
          ...billItem,
          isChecked: true,
          creditNoteAmount: Number(match.CreditNoteAmt ?? match.WriteOffAmt ?? 0),
          creditNotePer: Number(match.CreditNotePer ?? match.WriteOffPer ?? 0),
          isNavigatedDisabled: true,
        };
      }
      return billItem;
    });

    setCreditNoteTableList(updatedList);
  };

  useEffect(() => {
    const loadData = async () => {
      const billData = await getBillDetailsForCreditNote(Number(vistiIdFromCreditGeneration));
      if (billData && creditNoteIdFromCreditGeneration) {
        await getCreditNoteDetails(Number(creditNoteIdFromCreditGeneration), billData);
      }
    };

    if (vistiIdFromCreditGeneration) {
      void loadData();
    }
  }, [vistiIdFromCreditGeneration, creditNoteIdFromCreditGeneration]);

  // bill details for credit note
  const getBillDetailsForCreditNote = async (visitId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BILL_DETAILS_FOR_CREDIT_NOTE,
      {},
      { params: { visitId } },
      { component: "CreditNote" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "No data found");
      setShowTable(false);
      return null;
    }
    setShowTable(true);
    setPatientDetails({
      patientId: resp?.data?.[0]?.PatientId,
      patientName: resp?.data?.[0]?.PatientName,
      uhid: resp?.data?.[0]?.UHID,
      dob: formatDisplayDate(resp?.data?.[0]?.DOB),
      VisitId: resp?.data?.[0]?.VisitId,
      billNo: resp?.data?.[0]?.BillNo,
      billId: resp?.data?.[0]?.BillId,
      billDate: resp?.data?.[0]?.BillDate,
      doctorName: resp?.data?.[0]?.DoctorName,
      corporateName: resp?.data?.[0]?.CorporateName,
      serviceName: resp?.data?.[0]?.ServiceName,
      totalBillAmount: resp?.data?.[0]?.TotalBillAmount,
      totalDiscountOnBill: resp?.data?.[0]?.TotalDiscountAmountOnBill,
      totalPaidAmount: resp?.data?.[0]?.TotalPaidAmount,
      totalBalanceAmount: resp?.data?.[0]?.TotalBalanceAmount,
      totalCreditNoteAmount: resp?.data?.[0]?.TotalCreditNoteAmt,
    });

    const isNavigated = Number(vistiIdFromCreditGeneration) > 0;
    const initialList = (resp?.data ?? []).map((item: CreditNoteBillDetailItem) => ({
      ...item,
      isChecked: !isNavigated,
      creditNoteAmount: 0,
      creditNotePer: 0,
    }));

    setCreditNoteTableList(initialList);
    setCreditNoteApprovalValues(prev => ({
      ...prev,
      totalCreditNoteAmount: 0,
    }));

    return initialList;
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_BILL_FOR_CREDIT_NOTE,
        {},
        { params: { billNo: billNumberValue } },
        { component: "CreditNote" }
      );
      if (!resp?.result) {
        showWarning(resp?.message ?? "No bill details found");
        return;
      }
      await getBillDetailsForCreditNote(Number(resp?.data?.[0]?.VisitId));
    }
  };

  useEffect(() => {
    if (selectedBillForCreditNote) {
      getBillDetailsForCreditNote(Number(selectedBillForCreditNote?.VisitId));
    }
  }, [selectedBillForCreditNote]);

  //   open popup
  const handleOpenPopup = () => {
    setShowPopup(true);
    setRenderPopup(true);
  };

  //   close popup
  const closePopupHandler = useCallback(() => {
    setShowPopup(false);
  }, []);

  // create visit details paylaod
  const createVistiDetailsPayload = () => {
    return {
      branchId: branchId,
      roleId: roleId,
      patientId: patientDetails?.patientId,
      visitId: patientDetails?.VisitId,
      billId: patientDetails?.billId,
      totalCreditNoteAmount: creditNoteApprovalValeus?.totalCreditNoteAmount,
      creditNoteApprovedID: creditNoteApprovalValeus?.creditNoteApprovedID,
      creditNoteApprovedName: creditNoteApprovalValeus?.creditNoteApprovedName,
      creditNoteReason: creditNoteApprovalValeus?.creditNoteReason,
      creditNoteRemark: creditNoteApprovalValeus?.creditNoteRemark,
    };
  };

  const createBillingDetailsPaylaod = () => {
    return creditNoteTableList
      ?.filter(c => Number(c?.creditNoteAmount) > 0)
      .map(t => ({
        ftdId: t?.FTDId,
        creditNotePer: t?.creditNotePer,
        creditNoteAmt: t?.creditNoteAmount,
      }));
  };

  // button click handler
  const buttonClickHandler = async (value: string) => {
    switch (value) {
      case "save":
        setIsSubmitClicked(true);

        if (!validateCreditNoteApproval()) {
          return;
        }
        const payload = {
          visitDetails: createVistiDetailsPayload(),
          billingItems: createBillingDetailsPaylaod(),
        };

        const amount =
          payload.billingItems?.reduce((total, item) => total + Number(item.creditNoteAmt), 0) ?? 0;

        if (amount > creditNoteApprovalValeus.totalCreditNoteAmount) {
          showWarning("Credit note amount cannot be greater than total selected credit amount");
          return;
        }

        if (!payload) return;
        const resp = await fetchApi(
          "POST",
          ENDPOINTS.SAVE_CREDIT_NOTE,
          payload,
          {},
          { component: "CreditNote" }
        );
        if (!resp?.result) {
          showWarning(resp?.data ?? "failed to save");
          return;
        }
        showSuccess(resp?.message ?? "Data saved successfully");
        setPatientDetails({
          patientId: "",
          patientName: "",
          uhid: "",
          dob: "",
          VisitId: "",
          billNo: "",
          billId: "",
          billDate: "",
          doctorName: "",
          corporateName: "",
          serviceName: "",
          totalBillAmount: "",
          totalDiscountOnBill: "",
          totalPaidAmount: "",
          totalBalanceAmount: "",
          totalCreditNoteAmount: "",
        });

        setCreditNoteApprovalValues({
          totalCreditNoteAmount: 0,
          creditNoteApprovedID: 0,
          creditNoteApprovedName: "",
          creditNoteReason: "",
          creditNoteRemark: "",
        });
        setErrors({
          creditNoteApprovedID: "",
          creditNoteReason: "",
          totalCreditNoteAmount: "",
        });
        setCreditNoteTableList([]);
        setShowTable(false);
        setValueDisable(false);
        navigate(location.pathname, { replace: true, state: null });

        break;

      case "sendForApproval": {
        setIsSubmitClicked(true);

        if (!validateCreditNoteApproval()) {
          return;
        }
        const payload = {
          visitDetails: createVistiDetailsPayload(),
          billingItems: createBillingDetailsPaylaod(),
        };

        const amount =
          payload.billingItems?.reduce((total, item) => total + Number(item.creditNoteAmt), 0) ?? 0;

        if (amount < creditNoteApprovalValeus.totalCreditNoteAmount) {
          showWarning("Credit note amount cannot be greater than total selected credit amount");
          return;
        }

        if (!payload) return;
        const resp = await fetchApi(
          "POST",
          ENDPOINTS.SAVE_CREDIT_NOTE_REQUEST_APPROVAL,
          payload,
          {},
          { component: "CreditNote" }
        );
        if (!resp?.result) {
          showWarning(resp?.data ?? "failed to save");
          return;
        }
        showSuccess(resp?.message ?? "Data saved successfully");
        setPatientDetails({
          patientId: "",
          patientName: "",
          uhid: "",
          dob: "",
          VisitId: "",
          billNo: "",
          billId: "",
          billDate: "",
          doctorName: "",
          corporateName: "",
          serviceName: "",
          totalBillAmount: "",
          totalDiscountOnBill: "",
          totalPaidAmount: "",
          totalBalanceAmount: "",
          totalCreditNoteAmount: "",
        });

        setCreditNoteApprovalValues({
          totalCreditNoteAmount: 0,
          creditNoteApprovedID: 0,
          creditNoteApprovedName: "",
          creditNoteReason: "",
          creditNoteRemark: "",
        });
        setErrors({
          creditNoteApprovedID: "",
          creditNoteReason: "",
          totalCreditNoteAmount: "",
        });
        setCreditNoteTableList([]);
        setShowTable(false);
        setValueDisable(false);
        navigate(location.pathname, { replace: true, state: null });

        break;
      }

      default:
        break;
    }
  };

  // adjust amount change handler
  const adjustAmountChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    if (value >= Number(totalSumAmount)) {
      showWarning("Credit note amount cannot be greater than or equal to total bill amount");
      return;
    }

    inputChangeHandler(e);
  };

  const itemCheckboxHandler = (
    e: ChangeEvent<HTMLInputElement>,
    item: CreditNoteBillDetailItem
  ) => {
    const checked = e.target.checked;

    setCreditNoteTableList(prev =>
      prev.map(bill =>
        bill === item
          ? {
              ...bill,
              isChecked: checked,
              creditNoteAmount: checked
                ? Number(((bill.GrossAmt * creditNotePerAmount) / 100).toFixed(2))
                : 0,
              creditNotePer: checked ? creditNotePerAmount : 0,
            }
          : bill
      )
    );
  };

  // credit amount change handler
  const creditAmountChangeHandler = (
    e: ChangeEvent<HTMLInputElement>,
    item: CreditNoteBillDetailItem
  ) => {
    const value = Number(e.target.value);

    if (value < 0) {
      showWarning("Amount cannot be negative");
      return;
    }

    if (value > item.GrossAmt) {
      showWarning("Credit amount cannot be greater than Gross Amount");
      return;
    }

    setCreditNoteTableList(prev =>
      prev.map(bill =>
        bill === item
          ? {
              ...bill,
              creditNoteAmount: value,
              creditNotePer:
                bill.GrossAmt > 0 ? Number(((value / bill.GrossAmt) * 100).toFixed(2)) : 0,
            }
          : bill
      )
    );
  };

  // input change handler
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "creditNoteApprovedID") {
      const selectedApproval = approvalList?.find(
        (item: ApprovalList) => item.id === Number(value)
      );

      setCreditNoteApprovalValues(prev => ({
        ...prev,
        creditNoteApprovedID: Number(value),
        creditNoteApprovedName: selectedApproval?.name ?? "",
      }));
    } else {
      setCreditNoteApprovalValues(prev => ({
        ...prev,
        [name]: name === "totalCreditNoteAmount" ? Number(value) : value,
      }));
    }

    if (isSubmitClicked) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // percentage calculator

  useEffect(() => {
    const totalCreditAmount = Number(creditNoteApprovalValeus.totalCreditNoteAmount);

    if (totalSumAmount <= 0) {
      setCreditNotePreAmount(0);
      return;
    }

    const percentage = Number(((totalCreditAmount / totalSumAmount) * 100).toFixed(2));
    if (percentage > 100) {
      showWarning("Credit % can not be more than 100 %");
      setCreditNoteApprovalValues(prev => ({
        ...prev,
        totalCreditNoteAmount: 0,
      }));
      return;
    }

    setCreditNotePreAmount(percentage);
  }, [creditNoteApprovalValeus.totalCreditNoteAmount, totalSumAmount]);

  useEffect(() => {
    setCreditNoteTableList(prev =>
      prev.map(item => {
        if (!item.isChecked) {
          return {
            ...item,
            creditNoteAmount: 0,
            creditNotePer: 0,
          };
        }

        const amount = Number(((item.GrossAmt * creditNotePerAmount) / 100).toFixed(2));

        return {
          ...item,
          creditNoteAmount: amount,
          creditNotePer: creditNotePerAmount,
        };
      })
    );
  }, [creditNotePerAmount]);

  // approval lists
  const getApprovalList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISCOUNT_APPROVAL_MASTER_LIST,
      {},
      {},
      { component: "CreditNote" }
    );
    return resp?.data ?? [];
  };

  const { data: approvalList } = useQuery({
    queryKey: ["getApprovalList"],
    queryFn: getApprovalList,
  });

  // validation error
  const validateCreditNoteApproval = () => {
    const newErrors = {
      creditNoteApprovedID: "",
      creditNoteReason: "",
      totalCreditNoteAmount: "",
    };

    let isValid = true;

    if (!creditNoteApprovalValeus.creditNoteApprovedID) {
      newErrors.creditNoteApprovedID = "Please select Credit Note Approved By";
      isValid = false;
    }

    if (!creditNoteApprovalValeus.creditNoteReason.trim()) {
      newErrors.creditNoteReason = "Please enter Credit Note Reason";
      isValid = false;
    }

    if (creditNoteApprovalValeus.totalCreditNoteAmount <= 0) {
      newErrors.totalCreditNoteAmount = "Please enter Credit Note Amount";
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  // total sum amount calculate handler
  useEffect(() => {
    const total = creditNoteTableList.reduce(
      (sum, item) => (item.isChecked ? sum + Number(item.NetAmt) : sum),
      0
    );

    setTotalSumAmount(total);
  }, [creditNoteTableList]);

  return (
    <div className="page-container">
      <h1 className="page-heading">Credit Note</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Credit Note</span>
      </nav>
      <div className="flex flex-col gap-1">
        <div className="card mt-1">
          <div className="form-grid-5">
            <InputField label="Bill Number" required>
              <div className="flex flex-row gap-2">
                <input
                  className={
                    vistiIdFromCreditGeneration > 0 ? "disabled-input-field" : "input-field"
                  }
                  placeholder="Press Enter to search bills"
                  onChange={e => setBillNumberValue(e.target.value.trim())}
                  onKeyDown={handleKeyDown}
                  disabled={vistiIdFromCreditGeneration > 0}
                />
                <SearchIconButton
                  onClick={handleOpenPopup}
                  className={vistiIdFromCreditGeneration > 0 ? "disabled-search-icon" : ""}
                  disabled={vistiIdFromCreditGeneration > 0}
                />
              </div>
            </InputField>

            {!!creditNoteTableList && creditNoteTableList.length > 0 && (
              <>
                <InputField label="Credit Note Approved By" required>
                  <select
                    className={valueDisable ? "disabled-input-field" : "input-field"}
                    name="creditNoteApprovedID"
                    value={creditNoteApprovalValeus.creditNoteApprovedID}
                    onChange={inputChangeHandler}
                    disabled={valueDisable}
                  >
                    <option value={0}>Select</option>

                    {approvalList?.map((a: ApprovalList) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>

                  {isSubmitClicked && errors.creditNoteApprovedID && (
                    <p className="input-field-error">{errors.creditNoteApprovedID}</p>
                  )}
                </InputField>

                <InputField label="Credit Note Reason" required>
                  <input
                    className={valueDisable ? "disabled-input-field" : "input-field"}
                    placeholder="Enter credit note reason"
                    name="creditNoteReason"
                    value={creditNoteApprovalValeus?.creditNoteReason}
                    onChange={inputChangeHandler}
                    disabled={valueDisable}
                  />
                  {isSubmitClicked && errors.creditNoteReason && (
                    <p className="input-field-error">{errors.creditNoteReason}</p>
                  )}
                </InputField>

                <InputField label="Credit Note Remark">
                  <input
                    className={valueDisable ? "disabled-input-field" : "input-field"}
                    placeholder="Enter credit note remark"
                    name="creditNoteRemark"
                    value={creditNoteApprovalValeus?.creditNoteRemark}
                    onChange={inputChangeHandler}
                    disabled={valueDisable}
                  />
                </InputField>

                <InputField label="Credit Note Amount" required>
                  <input
                    className={valueDisable ? "disabled-input-field" : "input-field"}
                    name="totalCreditNoteAmount"
                    value={creditNoteApprovalValeus.totalCreditNoteAmount}
                    onChange={adjustAmountChangeHandler}
                    onInput={allowOnlyNumbers}
                    disabled={valueDisable}
                  />
                  {isSubmitClicked && errors.totalCreditNoteAmount && (
                    <p className="input-field-error">{errors.totalCreditNoteAmount}</p>
                  )}
                </InputField>
              </>
            )}
          </div>
          {/* details */}
          {!!creditNoteTableList && creditNoteTableList.length > 0 && (
            <>
              <div className="form-grid-4">
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Patient Name:</span>
                  <span className="truncate">{patientDetails?.patientName}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">UHID:</span>
                  <span className="truncate">{patientDetails?.uhid}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">DOB:</span>
                  <span className="truncate">{patientDetails?.dob}</span>
                </div>

                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Bill No:</span>
                  <span className="truncate">{patientDetails?.billNo}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Bill Date:</span>
                  <span className="truncate">{patientDetails?.billDate}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Doctor Name:</span>
                  <span className="truncate">{patientDetails?.doctorName}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Corporate Name:</span>
                  <span className="truncate">{patientDetails?.corporateName}</span>
                </div>

                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Total Bill Amount:</span>
                  <span className="truncate">{patientDetails?.totalBillAmount}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Total Discount On Bill:</span>
                  <span className="truncate">{patientDetails?.totalDiscountOnBill}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Total Paid Amount:</span>
                  <span className="truncate">{patientDetails?.totalPaidAmount}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Total Balance Amount:</span>
                  <span className="truncate">{patientDetails?.totalBalanceAmount}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Previous Credit Amount:</span>
                  <span className="truncate">{patientDetails?.totalCreditNoteAmount}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* table */}
        {!!creditNoteTableList && showTable ? (
          <div className="table-container mt-1 ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-110 lg:max-h-110">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {creditNoteTableHeader.map((header, index) => (
                        <th key={index} className="table-th ">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {creditNoteTableList.length === 0 ? (
                      <tr>
                        <td colSpan={creditNoteTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      creditNoteTableList.map((item: CreditNoteBillDetailItem, idx: number) => (
                        <tr key={idx} className="table-row">
                          <td className="table-td">
                            <input
                              type="checkbox"
                              className="input-field-checkbox h-4 w-4"
                              checked={item.isChecked}
                              onChange={e => itemCheckboxHandler(e, item)}
                              disabled={item.isNavigatedDisabled || vistiIdFromCreditGeneration > 0}
                            />
                          </td>

                          <td className="table-td">{item.ServiceName}</td>
                          <td className="table-td">{item.Rate}</td>
                          <td className="table-td">{item.Qty}</td>
                          <td className="table-td">{item.GrossAmt}</td>
                          <td className="table-td">{item.DiscPer}</td>
                          <td className="table-td">{item.DiscAmt}</td>
                          <td className="table-td">{item.NetAmt}</td>

                          {/* Credit Percentage */}
                          <td className="table-td">{item.creditNotePer!.toFixed(2)}</td>

                          {/* Credit Amount */}
                          <td className="table-td">
                            <input
                              type="text"
                              className={`${
                                item.isChecked &&
                                !item.isNavigatedDisabled &&
                                vistiIdFromCreditGeneration === 0
                                  ? "input-field"
                                  : "disabled-input-field"
                              } max-w-30 max-h-8`}
                              value={item.creditNoteAmount}
                              onInput={allowOnlyNumbers}
                              onChange={e => creditAmountChangeHandler(e, item)}
                              readOnly={
                                !item.isChecked ||
                                item.isNavigatedDisabled ||
                                vistiIdFromCreditGeneration > 0
                              }
                              disabled={item.isNavigatedDisabled || vistiIdFromCreditGeneration > 0}
                            />
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

        {/* popup */}
        {renderPopup && (
          <FilterBillPopup
            isOpen={showPopup}
            onClose={closePopupHandler}
            setSelectedBill={setSelectedBillForCreditNote}
          />
        )}

        {!!loading && <CustomLoader isLoading={loading} />}
      </div>
      <GlobalFooterButtons
        pageType={PageType?.CREDIT_NOTE}
        shouldSaveButtonVisible={shouldSaveButtonVisible}
        onButtonClick={buttonClickHandler}
      />
    </div>
  );
};

export default CreditNote;
