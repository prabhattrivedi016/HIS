import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { OpRefundApprovalCancelItem, OpRefundApprovalItem } from "../types";

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

type ApproveCancelPopupProps = {
  isOpen: boolean;
  popupType: "approve" | "cancel" | "";
  item: OpRefundApprovalItem | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const ApproveCancelPopup = ({
  isOpen,
  popupType,
  item,
  onClose,
  onSuccess,
}: ApproveCancelPopupProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [detail, setDetail] = useState<OpRefundApprovalCancelItem | null>(null);

  const [cancelFormData, setCancelFormData] = useState({
    refundId: 0,
    cancelReason: "",
  });

  const [approveFormData, setApproveFormData] = useState({
    refundId: 0,
    flag: 0,
    approvalRemarks: "",
  });

  const [cancelError, setCancelError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const displayItem = useMemo(
    () => ({
      ...item,
      ...detail,
    }),
    [detail, item]
  );

  useEffect(() => {
    if (!isOpen || !item?.RefundId) {
      setDetail(null);
      return;
    }

    let isActive = true;

    const getApprovalDetails = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_OPD_REFUND_REQUEST_APPROVAL_DETAILS,
        {},
        { params: { refundId: Number(item.RefundId) } },
        { component: "OpRefundApproveCancelPopup" }
      );

      if (isActive) {
        setDetail((resp?.data?.[0] ?? resp?.data ?? null) as OpRefundApprovalCancelItem | null);
      }
    };

    void getApprovalDetails();

    return () => {
      isActive = false;
    };
  }, [isOpen, item?.RefundId]);

  useEffect(() => {
    if (!isOpen || !item) return;

    setCancelFormData({
      refundId: Number(item.RefundId ?? 0),
      cancelReason: "",
    });

    setApproveFormData({
      refundId: Number(item.RefundId ?? 0),
      flag: Number(item.FlagId ?? 0),
      approvalRemarks: item.ApprovalRemarks ?? "",
    });

    setCancelError("");
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
    setErrorMessage("");
  };

  const validateCancelForm = () => {
    if (!String(cancelFormData.cancelReason ?? "").trim()) {
      setCancelError("Cancel reason is required");
      return false;
    }

    setCancelError("");
    return true;
  };

  const approveSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.APPROVE_OPD_REFUND_REQUEST,
        {
          refundId: Number(approveFormData.refundId),
          flag: Number(approveFormData.flag),
          approvalRemarks: String(approveFormData.approvalRemarks).trim(),
        },
        {},
        { component: "OpRefundApproveCancelPopup" }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed while approving refund request");
        return;
      }

      setSuccessMessage(resp?.message ?? "Refund request approved successfully");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed while approving refund request");
    }
  };

  const cancelSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateCancelForm()) {
      return;
    }

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.CANCEL_OPD_REFUND_REQUEST,
        {
          refundId: Number(cancelFormData.refundId),
          cancelReason: String(cancelFormData.cancelReason).trim(),
        },
        {},
        { component: "OpRefundApproveCancelPopup" }
      );

      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed while cancelling refund request");
        return;
      }

      setSuccessMessage(resp?.message ?? "Refund request cancelled successfully");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed while cancelling refund request");
    }
  };

  const renderComponent = () => {
    switch (popupType) {
      case "approve":
        return (
          <form onSubmit={approveSubmitHandler}>
            <div className="form-grid-2 mt-1">
              <InputField label="Total Refund Amount">
                <input
                  type="text"
                  className="disabled-input-field cursor-not-allowed max-w-60"
                  value={formatValue(displayItem?.TotalRefundAmount)}
                  disabled
                  readOnly
                />
              </InputField>

              <InputField label="Approval Remark">
                <input
                  type="text"
                  placeholder="Enter approval remark"
                  onChange={approvalRemarksChangeHandler}
                  className="input-field"
                  value={approveFormData.approvalRemarks}
                />
              </InputField>
            </div>

            <div className="form-actions-responsive mt-5">
              <SubmitButton label="Approve" type="submit" className="save-btn-color" />
            </div>
          </form>
        );

      case "cancel":
        return (
          <form onSubmit={cancelSubmitHandler}>
            <div className="form-grid-2 mt-1">
              <InputField label="Cancel Reason" required>
                <input
                  type="text"
                  placeholder="Enter cancel reason"
                  className="input-field"
                  value={cancelFormData.cancelReason}
                  onChange={cancelChangeHandler}
                />
                {!!cancelError && <p className="input-field-error">{cancelError}</p>}
              </InputField>
            </div>

            <div className="form-actions-responsive mt-5">
              <SubmitButton label="Cancel" type="submit" className="cancel-btn-color" />
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <CentralPopup
        isOpen={isOpen}
        onClose={onClose}
        title={popupType === "approve" ? "Approve Refund" : "Cancel Refund"}
        className=" lg:min-w-100 "
      >
        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        <div className="w-full card form-grid-2 ">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Patient Name:</span>
            <span className="truncate">{formatValue(displayItem?.PatientName)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Token No:</span>
            <span className="truncate">{formatValue(displayItem?.TokenNo)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">UHID:</span>
            <span className="truncate">{formatValue(displayItem?.UHID)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Age / Gender:</span>
            <span className="truncate">
              {formatValue(`${displayItem?.Age ?? ""}/${displayItem?.Gender ?? ""}`)}
            </span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Refund Approved By:</span>
            <span className="truncate">{formatValue(displayItem?.RefundApprovedName)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Refund Reason:</span>
            <span className="truncate">{formatValue(displayItem?.RefundReason)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Remark:</span>
            <span className="truncate">{formatValue(displayItem?.RefundRemark)}</span>
          </div>
        </div>

        <div className="w-full card form-grid-2 -mt-3">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Bill Amount:</span>
            <span className="truncate">{formatValue(displayItem?.TotalBillAmount)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Discount Amount:</span>
            <span className="truncate">{formatValue(displayItem?.TotalDiscountAmountOnBill)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Refund Amount:</span>
            <span className="truncate">{formatValue(displayItem?.TotalRefundAmount)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Total Discount Percentage:</span>
            <span className="truncate">{formatValue(displayItem?.TotalDiscountPerOnBill)}</span>
          </div>

          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Status:</span>
            <span className="truncate">{formatValue(displayItem?.Status)}</span>
          </div>
        </div>

        {renderComponent()}
      </CentralPopup>

      {!!loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default React.memo(ApproveCancelPopup);
