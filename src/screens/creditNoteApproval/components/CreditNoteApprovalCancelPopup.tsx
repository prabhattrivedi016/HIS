import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { CreditNoteApprovalDetails, CreditNoteApprovalItem } from "../types";

const CreditNoteApproveCancelPopup = ({
  isOpen,
  onClose,
  onSuccess,
  popupType,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  popupType: string;
  item: CreditNoteApprovalItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [creditNoteApprovalDetails, setCreditNoteApprovalDetails] =
    useState<CreditNoteApprovalDetails | null>(null);

  // get approval details by Id
  const getCreditNoteApprovalDetailsById = async (creditNoteId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CREDIT_NOTE_REQUEST_DETAILS_BY_CREDIT_NOTE_ID,
      {},
      { params: { creditNoteId } },
      { component: "CreditNoteApproveCancelPopup" }
    );

    setCreditNoteApprovalDetails(resp?.data?.[0]);
  };

  useEffect(() => {
    if (item) {
      getCreditNoteApprovalDetailsById(item?.CreditNoteId);
    }
  }, [item]);

  const [cancelFormData, setCancelFormData] = useState({
    creditNoteId: 0,
    cancelReason: "",
  });

  const [approveFormData, setApproveFormData] = useState({
    creditNoteId: 0,
    flag: 0,
    approvalRemarks: "",
  });

  const [cancelError, setCancelError] = useState("");
  const [approveError, setApproveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen || !item) return;

    const recordId = Number(item.CreditNoteId ?? 0);

    setCancelFormData({
      creditNoteId: recordId,
      cancelReason: "",
    });

    if (!item?.TotalApprovedDiscountPerOnBill) {
      setApproveFormData({
        creditNoteId: recordId,
        flag: item?.FlagId ?? 0,
        approvalRemarks: item?.ApprovalRemarks ?? "",
      });
    } else {
      setApproveFormData({
        creditNoteId: recordId,
        flag: item?.FlagId ?? 0,
        approvalRemarks: item?.ApprovalRemarks ?? "",
      });
    }
    setCancelError("");
    setApproveError("");
    setSuccessMessage("");
    setErrorMessage("");
  }, [isOpen, item]);

  const cancelChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setCancelFormData(prev => ({
      ...prev,
      cancelReason: e.target.value,
    }));
    setCancelError("");
    setErrorMessage("");
  };

  const approvalRemarksChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setApproveFormData(prev => ({
      ...prev,
      approvalRemarks: e.target.value,
    }));
  };

  const validateApproveForm = () => {
    if (!String(approveFormData.approvalRemarks ?? "").trim()) {
      setApproveError("Please enter approval remarks");
      return false;
    }

    setApproveError("");
    return true;
  };

  const validateCancelForm = () => {
    if (!String(cancelFormData.cancelReason ?? "").trim()) {
      setCancelError("Cancel reason is required");
      return false;
    }

    setCancelError("");
    return true;
  };

  const isApproved =
    Number(item?.IsCreditNoteApproved) === 1 ||
    Number(creditNoteApprovalDetails?.IsCreditNoteApproved) === 1;
  const isCancelled =
    Number(item?.IsCancel) === 1 || Number(creditNoteApprovalDetails?.IsCancel) === 1;

  const isApproveDisabled = isApproved || isCancelled;
  const isCancelDisabled = isCancelled;

  const approveSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isApproveDisabled) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateApproveForm()) {
      return;
    }

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.APPROVE_CREDIT_NOTE_REQUEST,
        {
          creditNoteId: Number(approveFormData.creditNoteId),
          flag: Number(approveFormData.flag),
          approvalRemarks: String(approveFormData.approvalRemarks).trim(),
        },
        {},
        { component: "CreditNoteApproveCancelPopup" }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed while approving discount");
        return;
      }

      setSuccessMessage(resp?.message ?? "Discount approved successfully");
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed while approving discount");
    }
  };

  const cancelSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCancelDisabled) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateCancelForm()) {
      return;
    }

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.CANCEL_CREDIT_NOTE_REQUEST,
        {
          creditNoteId: Number(cancelFormData.creditNoteId),
          cancelReason: String(cancelFormData.cancelReason).trim(),
        },
        {},
        { component: "CreditNoteApproveCancelPopup" }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed while cancelling booking");
        return;
      }

      setSuccessMessage(resp?.message ?? "Booking cancelled successfully");
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed while cancelling booking");
    }
  };

  const renderComponent = () => {
    switch (popupType) {
      case "approve": {
        return (
          <form onSubmit={approveSubmitHandler}>
            <div className="form-grid-1 mt-1">
              <InputField label="Approval Remark" required>
                <input
                  type="text"
                  placeholder="Enter approval remark"
                  onChange={approvalRemarksChangeHandler}
                  className="input-field"
                  value={approveFormData.approvalRemarks}
                  disabled={isApproveDisabled}
                />
                {!!approveError && <p className="input-field-error">{approveError}</p>}
              </InputField>
            </div>
            <div className="form-actions-responsive mt-5">
              <button
                type="submit"
                className="save-btn disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isApproveDisabled}
              >
                Approve
              </button>
            </div>
          </form>
        );
      }
      case "cancel": {
        return (
          <form onSubmit={cancelSubmitHandler}>
            <div className="form-grid-1 mt-1">
              <InputField label="Cancel Reason" required>
                <input
                  type="text"
                  placeholder="Enter cancel reason"
                  className="input-field"
                  value={cancelFormData.cancelReason}
                  onChange={cancelChangeHandler}
                  disabled={isCancelDisabled}
                />
                {!!cancelError && <p className="input-field-error">{cancelError}</p>}
              </InputField>
            </div>
            <div className="form-actions-responsive mt-5">
              <button
                type="submit"
                className="save-btn disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCancelDisabled}
              >
                Cancel
              </button>
            </div>
          </form>
        );
      }
      default:
        return null;
    }
  };

  useScrollLock(isOpen);

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title={
        popupType === "approve"
          ? "Approve Credit Note"
          : popupType === "cancel"
            ? "Cancel Credit Note"
            : ""
      }
    >
      <>
        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 mb-2">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Patient Name:</span>
            <span className="truncate">{item?.PatientName}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Token No:</span>
            <span className="truncate">{item?.TokenNo}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">UHID:</span>
            <span className="truncate">{item?.UHID}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Age / Gender:</span>
            <span className="truncate">{item?.Age + "/" + item?.Gender}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Bill No.:</span>
            <span className="truncate">{item?.BillNo}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Credit Note Approved Name:</span>
            <span className="truncate">{creditNoteApprovalDetails?.CreditNoteApprovedName}</span>
          </div>{" "}
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Credit Note Reason:</span>
            <span className="truncate">{creditNoteApprovalDetails?.CreditNoteReason}</span>
          </div>{" "}
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Credit Note Remark:</span>
            <span className="truncate">{creditNoteApprovalDetails?.CreditNoteRemark}</span>
          </div>
        </div>

        <div className="w-full card grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-1 -mt-1">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Service Name:</span>
            <span className="truncate">{creditNoteApprovalDetails?.ServiceName}</span>
          </div>

          <div className="flex flex-row gap-1 ">
            <span className="name-header whitespace-nowrap">Total Bill Amount:</span>
            <span className="truncate">{creditNoteApprovalDetails?.TotalBillAmount}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Discount Amount:</span>
            <span className="truncate">{creditNoteApprovalDetails?.TotalDiscountAmountOnBill}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Paid Amount:</span>
            <span className="truncate">{creditNoteApprovalDetails?.TotalPaidAmount}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Balance Amount</span>
            <span className="truncate">{creditNoteApprovalDetails?.TotalBalanceAmount}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Credit Note Amount</span>
            <span className="truncate">{creditNoteApprovalDetails?.TotalCreditNoteAmount}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Status:</span>
            <span className="truncate">{item?.Status}</span>
          </div>
        </div>

        {renderComponent()}

        {/* loading */}
        {loading && <CustomLoader isLoading={loading} />}
      </>
    </CentralPopup>
  );
};

export default React.memo(CreditNoteApproveCancelPopup);
