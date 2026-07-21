import type { OpdBillingFormData, OpdBookingDetailsResponse } from "@/screens/opdBilling/types";
import type { Dispatch, SetStateAction } from "react";

type BankItems = {
  bankId: number;
  bankName: string;
  isActive: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type PaymentModeItems = {
  paymentModeId: number;
  paymentModeName: string;
  payModeType: string;
  payModeTypeId: number;
  showBankField: number;
  showReferenceNumberField: number;
  isExcludedFromPaymentList: number;
};

/** @deprecated Use PaymentModeItems — kept as alias for refund billing. */
type PaymentItems = PaymentModeItems;

type DiscountApproveItem = {
  id: number;
  name: string;
  isActive: number;
  discountType: string;
  branchName: string;
  firstName: string;
};

type BillingDetailsHandle = {
  validateForm: () => Promise<boolean>;
  validateDiscountFields: () => boolean;
  getPayload: () => Record<string, unknown>;
  getNetAmount: () => number;
  reset: () => void;
};

type PaymentMethodPayloadItem = {
  paymentModeId: number;
  paymentModeTypeId: number;
  amount: number;
  bankId: number;
  refNo: string;
  isCopaymentReceipt: number;
  isPatientAdvanceAmount?: number;
  plutusTransactionReferenceID: string;
  transactionLogId: string;
};

type PaymentMethodsHandle = {
  validatePayments: () => boolean;
  getPaymentPayload: () => PaymentMethodPayloadItem[] | null;
};

type BillingPaymentFormItem = {
  paymentModeId?: number;
  paymentModeTypeId?: number;
  amount?: unknown;
  bankId?: unknown;
  refNo?: unknown;
  isCopaymentReceipt?: unknown;
};

type BillingFormValues = {
  payments?: BillingPaymentFormItem[];
  [key: string]: unknown;
};

type BillingValuesItem = {
  grossBillAmount: number;
  totalDiscPerOnBill: number;
  totalDiscAmtOnBill: number;
  roundOff: number;
  netAmount: number;
  balanceAmount: number;
  discApprovedById: number;
  discApprovedName: string;
  discountReason: string;
  remarks: string;
};

type PaymentBillingSummary = {
  grossBillAmount?: number;
  totalDiscPerOnBill?: number;
  totalDiscAmtOnBill?: number;
  netAmount?: number;
};

type BillingDetailsProps = {
  setOpdBilling?: Dispatch<SetStateAction<OpdBillingFormData>>;
  setBillingValues?: (
    value: BillingValuesItem | ((prev: BillingValuesItem) => BillingValuesItem)
  ) => void;
  billingValues?: BillingValuesItem;
  paymentBilling?: PaymentBillingSummary;
  maxDiscountPercentage?: number;
  creditCopayment?: boolean;
  showPaymentMode?: boolean;
  hasDiscountApplied?: boolean;
  bookingDetails?: OpdBookingDetailsResponse | null;
  hideBillingSection?: boolean;
  relaxPaymentAmountLimit?: boolean;
  maxPaymentAmount?: number | null;
  paymentAmountExceededMessage?: string;
  patientAdvanceEnabled?: boolean;
  patientAdvanceAmount?: number;
  disableDiscountEditing?: boolean;
  approvalFieldLabels?: {
    approvedBy?: string;
    approvedReason?: string;
    remark?: string;
  };
  approvalValidationMessages?: {
    approvedByRequired?: string;
    approvedReasonRequired?: string;
    remarkRequired?: string;
  };
  requireApprovalFields?: boolean;
  corporateId?: number;
  isRefundPaymentModes?: number;
};

export type {
  BankItems,
  BillingDetailsHandle,
  BillingDetailsProps,
  BillingFormValues,
  BillingPaymentFormItem,
  BillingValuesItem,
  DiscountApproveItem,
  PaymentBillingSummary,
  PaymentItems,
  PaymentMethodPayloadItem,
  PaymentMethodsHandle,
  PaymentModeItems,
};
