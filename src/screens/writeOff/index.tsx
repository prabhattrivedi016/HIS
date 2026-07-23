import InputField from "@/components/customInputField";
import GlobalFooterButtons from "@/components/globalButtons/GlobalFooterButtons";
import SearchIconButton from "@/components/globalButtons/SearchIconButton";
import { ENDPOINTS } from "@/config/defaults";
import { PageType } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { formatDisplayDate } from "@/utils/dateConvertHandler";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import FilterBillPopup from "./components/FilterBillPopup";
import { ApprovalList, WriteOffBillDetailsItem, WriteOffBillItem } from "./types";

const WriteOff = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;
  const roleId = useContext(RoleContext)?.roleId ?? 2;
  const [billNumberValue, setBillNumberValue] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [writeOffTableData, setWriteOffTableData] = useState<WriteOffBillDetailsItem[]>([]);
  const [selectedBillForWriteOff, setSelectedBillForWriteOff] = useState<WriteOffBillItem | null>();
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);

  const [patientDetails, setPatientDetails] = useState({
    patientId: "",
    patientName: "",
    uhid: "",
    dob: "",
    VisitId: "",
    billNo: "",
    billId: "",
    billDate: "",
    corporateName: "",
    totalDiscountOnBill: "",
    totalNetAmount: "",
    totalPaidAmount: "",
    totalBalanceAmount: "",
    totalWriteOffAmount: "",
  });
  const [errors, setErrors] = useState({
    writeOffApprovedId: "",
    writeOffReason: "",
    totalWriteOffAmount: "",
  });

  const [writeOffApprovalValeus, setWriteOffApprovalValues] = useState({
    totalWriteOffAmount: 0,
    writeOffApprovedId: 0,
    writeOffApprovedName: "",
    writeOffReason: "",
    writeOffRemark: "",
  });

  // bill details for credit note
  const getBillDetailsForWriteOff = async (visitId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BILL_DETAILS_FOR_WRITE_OFF,
      {},
      { params: { visitId } },
      { component: "CreditNote" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "No data found");
      return;
    }
    setPatientDetails({
      patientId: resp?.data?.[0]?.PatientId,
      patientName: resp?.data?.[0]?.PatientName,
      uhid: resp?.data?.[0]?.UHID,
      dob: formatDisplayDate(resp?.data?.[0]?.DOB),
      VisitId: resp?.data?.[0]?.VisitId,
      billNo: resp?.data?.[0]?.BillNo,
      billId: resp?.data?.[0]?.BillId,
      billDate: resp?.data?.[0]?.BillDate,
      corporateName: resp?.data?.[0]?.CorporateName,
      totalDiscountOnBill: resp?.data?.[0]?.TotalDiscountAmountOnBill,
      totalNetAmount: resp?.data?.[0]?.TotalNetAmount,
      totalPaidAmount: resp?.data?.[0]?.TotalPaidAmount,
      totalBalanceAmount: resp?.data?.[0]?.TotalBalanceAmount,
      totalWriteOffAmount: resp?.data?.[0]?.TotalWriteOffAmount,
    });
    setWriteOffTableData(resp?.data ?? []);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_BILL_FOR_WRITE_OFF,
        {},
        { params: { billNo: billNumberValue } },
        { component: "CreditNote" }
      );
      if (!resp?.result) {
        showWarning(resp?.message ?? "No bill details found");
        return;
      }
      await getBillDetailsForWriteOff(Number(resp?.data?.[0]?.VisitId));
    }
  };

  useEffect(() => {
    if (selectedBillForWriteOff) {
      getBillDetailsForWriteOff(Number(selectedBillForWriteOff?.VisitId));
    }
  }, [selectedBillForWriteOff]);

  //   open popup
  const handleOpenPopup = () => {
    setShowPopup(true);
    setRenderPopup(true);
  };

  //   close popup
  const closePopupHandler = useCallback(() => {
    setShowPopup(false);
  }, []);

  // create payload
  const createWriteOffPayload = () => {
    return {
      branchId: branchId,
      roleId: roleId,
      patientId: patientDetails?.patientId,
      visitId: patientDetails?.VisitId,
      billId: patientDetails?.billId,
      totalWriteOffAmount: writeOffApprovalValeus?.totalWriteOffAmount,
      writeOffApprovedID: writeOffApprovalValeus?.writeOffApprovedId,
      writeOffApprovedName: writeOffApprovalValeus?.writeOffApprovedName,
      writeOffReason: writeOffApprovalValeus?.writeOffReason,
      writeOffRemark: writeOffApprovalValeus?.writeOffRemark,
    };
  };

  // button click handler
  const buttonClickHandler = async (value: string) => {
    switch (value) {
      case "sendForApproval": {
        console.log("send of approval");
        setIsSubmitClicked(true);

        if (!validateCreditNoteApproval()) {
          return;
        }

        const payload = createWriteOffPayload();

        if (!payload) return;
        const resp = await fetchApi(
          "POST",
          ENDPOINTS.SAVE_WRITE_OFF_REQUEST_APPROVAL,
          payload,
          {},
          { component: "WriteOff" }
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
          corporateName: "",
          totalDiscountOnBill: "",
          totalNetAmount: "",
          totalPaidAmount: "",
          totalBalanceAmount: "",
          totalWriteOffAmount: "",
        });

        setWriteOffApprovalValues({
          totalWriteOffAmount: 0,
          writeOffApprovedId: 0,
          writeOffApprovedName: "",
          writeOffReason: "",
          writeOffRemark: "",
        });
        setErrors({
          writeOffApprovedId: "",
          writeOffReason: "",
          totalWriteOffAmount: "",
        });
        setWriteOffTableData([]);

        break;
      }

      default:
        break;
    }
  };

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
      writeOffApprovedId: "",
      writeOffReason: "",
      totalWriteOffAmount: "",
    };

    let isValid = true;

    if (!writeOffApprovalValeus.writeOffApprovedId) {
      newErrors.writeOffApprovedId = "Please select write off Approved By";
      isValid = false;
    }

    if (!writeOffApprovalValeus.writeOffReason.trim()) {
      newErrors.writeOffReason = "Please enter write off Reason";
      isValid = false;
    }

    if (writeOffApprovalValeus.totalWriteOffAmount <= 0) {
      newErrors.totalWriteOffAmount = "Please enter write off Amount";
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  // input change handler
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "writeOffApprovedId") {
      const selectedApproval = approvalList?.find(
        (item: ApprovalList) => item.id === Number(value)
      );

      setWriteOffApprovalValues(prev => ({
        ...prev,
        writeOffApprovedId: Number(value),
        writeOffApprovedName: selectedApproval?.name ?? "",
      }));
    } else {
      setWriteOffApprovalValues(prev => ({
        ...prev,
        [name]: name === "totalWriteOffAmount" ? Number(value) : value,
      }));
    }

    if (isSubmitClicked) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // adjust amount change handler
  const adjustAmountChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    if (value > Number(patientDetails?.totalPaidAmount)) {
      showWarning("WriteOff amount cannot be greater than or equal to total paid amount");
      return;
    }

    inputChangeHandler(e);
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Write Off</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Write Off</span>
      </nav>
      <div className="flex flex-col gap-1">
        <div className="card mt-1">
          <div className="form-grid-5">
            <InputField label="Bill Number" required>
              <div className="flex flex-row gap-2">
                <input
                  className="input-field"
                  placeholder="Press Enter to search bills"
                  onChange={e => setBillNumberValue(e.target.value.trim())}
                  onKeyDown={handleKeyDown}
                />
                <SearchIconButton onClick={handleOpenPopup} className="" />
              </div>
            </InputField>
            {!!writeOffTableData && writeOffTableData.length > 0 && (
              <>
                <InputField label="Write Off Approved By" required>
                  <select
                    className="input-field"
                    name="writeOffApprovedId"
                    value={writeOffApprovalValeus.writeOffApprovedId}
                    onChange={inputChangeHandler}
                  >
                    <option value={0}>Select</option>

                    {approvalList?.map((a: ApprovalList) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>

                  {isSubmitClicked && errors.writeOffApprovedId && (
                    <p className="input-field-error">{errors.writeOffApprovedId}</p>
                  )}
                </InputField>

                <InputField label="Write Off Reason" required>
                  <input
                    className="input-field"
                    placeholder="Enter credit note reason"
                    name="writeOffReason"
                    value={writeOffApprovalValeus?.writeOffReason}
                    onChange={inputChangeHandler}
                  />
                  {isSubmitClicked && errors.writeOffReason && (
                    <p className="input-field-error">{errors.writeOffReason}</p>
                  )}
                </InputField>

                <InputField label="Write Off Remark">
                  <input
                    className="input-field"
                    placeholder="Enter credit note remark"
                    name="writeOffRemark"
                    value={writeOffApprovalValeus?.writeOffRemark}
                    onChange={inputChangeHandler}
                  />
                </InputField>

                <InputField label="WriteOff Amount" required>
                  <input
                    className="input-field"
                    name="totalWriteOffAmount"
                    value={writeOffApprovalValeus.totalWriteOffAmount}
                    onChange={adjustAmountChangeHandler}
                    onInput={allowOnlyNumbers}
                  />
                  {isSubmitClicked && errors.totalWriteOffAmount && (
                    <p className="input-field-error">{errors.totalWriteOffAmount}</p>
                  )}
                </InputField>
              </>
            )}
          </div>
          {/* details */}
          {!!writeOffTableData && writeOffTableData.length > 0 && (
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
                  <span className="name-header whitespace-nowrap">Corporate Name:</span>
                  <span className="truncate">{patientDetails?.corporateName}</span>
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
                  <span className="name-header whitespace-nowrap">Previous WriteOff Amount:</span>
                  <span className="truncate">{patientDetails?.totalWriteOffAmount ?? 0}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="name-header whitespace-nowrap">Total Net Amount:</span>
                  <span className="truncate">{patientDetails?.totalNetAmount}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* popup */}
      {renderPopup && (
        <FilterBillPopup
          isOpen={showPopup}
          onClose={closePopupHandler}
          setSelectedBill={setSelectedBillForWriteOff}
        />
      )}

      <GlobalFooterButtons pageType={PageType?.WRITE_OFF} onButtonClick={buttonClickHandler} />
    </div>
  );
};

export default WriteOff;
