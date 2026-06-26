type BankItems = {
  bankId: number;
  bankName: string;
  isActive: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type PaymentItems = {
  paymentModeId: number;
  paymentModeName: string;
  payModeType: string;
  // API responses currently use mixed keys across modules.
  // Keep both to avoid runtime/type mismatches.
  payModeTypeId?: number;
  paymentModeTypeId?: number;
  isRefundAllowed: number;
  isActive: number;
};

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
export type {
  BankItems,
  BillingDetailsHandle,
  BillingFormValues,
  BillingPaymentFormItem,
  DiscountApproveItem,
  PaymentMethodPayloadItem,
  PaymentMethodsHandle,
  PaymentItems,
};
