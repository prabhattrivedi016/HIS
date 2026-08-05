import { resolveVisitIdFromResponse } from "@/components/SingledrawerAndPopup/uploadVisitWiseDocuments";
import { ENDPOINTS } from "@/config/defaults";
import { openReceiptInNewTab } from "@/screens/opdBilling/components/OpdReceiptNewTab";
import { PatientReceiptItem, PaymentModeItem } from "@/screens/opdBilling/types";

type FetchApiFn = (
  ...args: Parameters<ReturnType<typeof import("@/hooks/useGlobalApi").default>["fetchApi"]>
) => ReturnType<ReturnType<typeof import("@/hooks/useGlobalApi").default>["fetchApi"]>;

export const fetchOpdRefundReceiptData = async (
  fetchApi: FetchApiFn,
  responseData: Record<string, unknown>
) => {
  const ftid = Number(
    responseData.ftid ?? responseData.FtId ?? responseData.FTDId ?? responseData.FtdId ?? 0
  );
  const resolvedVisitId =
    resolveVisitIdFromResponse(responseData) ||
    Number(responseData.visitId ?? responseData.VisitId ?? 0);
  const receiptId = Number(responseData.receiptId ?? responseData.receiptId ?? 0);
  const isReceipt =
    responseData?.isReceipt === true || Number(responseData?.isReceipt ?? 0) === 1 ? 1 : 0;

  const [receiptResult, paymentResult] = await Promise.allSettled([
    fetchApi(
      "GET",
      ENDPOINTS.GET_RECEIPT_DETAILS_BY_FTID,
      {},
      {
        params: {
          ftid: Number(responseData?.ftid ?? 0),
          isReceipt: Number(responseData?.receiptId ?? 0) > 0 ? 1 : 0,
          receiptId: Number(responseData?.receiptId ?? 0),
        },
      },
      { component: "OpdRefund" }
    ),
    fetchApi(
      "GET",
      ENDPOINTS.GET_OPD_RECEIPT_LIST,
      {},
      { params: { visitNo: resolvedVisitId } },
      { component: "OpdRefund" }
    ),
  ]);

  const receiptData: PatientReceiptItem[] =
    receiptResult.status === "fulfilled"
      ? (((receiptResult.value as { data?: PatientReceiptItem[] })?.data ??
          []) as PatientReceiptItem[])
      : [];

  const paymentModes: PaymentModeItem[] =
    paymentResult.status === "fulfilled"
      ? (((paymentResult.value as { data?: PaymentModeItem[] })?.data ?? []) as PaymentModeItem[])
      : [];

  const paidAmountFromApi = paymentModes.reduce((sum, item) => sum + Number(item?.Amount ?? 0), 0);
  const paidAmountFromReceipt = receiptData.reduce(
    (sum, item) => sum + Number(item?.NetAmt ?? item?.NetAmount ?? 0),
    0
  );
  const totalPaidAmount =
    paidAmountFromApi > 0
      ? paidAmountFromApi
      : paidAmountFromReceipt > 0
        ? paidAmountFromReceipt
        : Number(responseData.netAmount ?? responseData.NetAmount ?? 0);

  return {
    receiptData,
    paymentModes,
    totalPaidAmount,
  };
};

export const fetchAndPrintOpdRefundReceiptAfterSave = async (
  fetchApi: FetchApiFn,
  responseData: Record<string, unknown>,
  onDataReady: (data: {
    receiptData: PatientReceiptItem[];
    paymentModes: PaymentModeItem[];
    totalPaidAmount: number;
  }) => void
) => {
  const { receiptData, paymentModes, totalPaidAmount } = await fetchOpdRefundReceiptData(
    fetchApi,
    responseData
  );

  onDataReady({ receiptData, paymentModes, totalPaidAmount });

  await new Promise(resolve => window.setTimeout(resolve, 120));

  if (!receiptData.length) {
    return false;
  }

  openReceiptInNewTab(receiptData);
  return true;
};
