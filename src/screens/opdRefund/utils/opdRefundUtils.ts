import type { BillingValuesItem } from "@/components/BillingDetails/types";
import type {
  BillDetailsToRefundItem,
  BuildOpdRefundRequestApprovalPayloadArgs,
  BuildOpdRefundSavePayloadArgs,
  OpdRefundItemPayload,
  OpdRefundPaymentDetailPayload,
  OpdRefundRequestApprovalPayload,
  OpdRefundSavePayload,
  OpdRefundVisitDetailsPayload,
} from "../types";

export const OPD_REFUND_PACKAGE_CATEGORY_TYPE_ID = 11;

const MONTH_NAME_TO_NUMBER: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const pickValue = (source: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
};

const parseMonthValue = (value: string) => {
  const numericMonth = Number(value);
  if (Number.isFinite(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
    return numericMonth;
  }

  const monthKey = value.trim().slice(0, 3).toLowerCase();
  return MONTH_NAME_TO_NUMBER[monthKey] ?? 0;
};

export const parseDobToDate = (dob: string): Date | null => {
  const trimmed = String(dob ?? "").trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const dashedMatch = trimmed.match(/^(\d{1,2})-([A-Za-z0-9]{1,9})-(\d{4})/);
  if (dashedMatch) {
    const day = Number(dashedMatch[1]);
    const month = parseMonthValue(dashedMatch[2]);
    const year = Number(dashedMatch[3]);
    if (month > 0) {
      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const calculateAgeFromDob = (dob: string) => {
  const birthDate = parseDobToDate(dob);
  if (!birthDate) return null;

  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
  };
};

export const formatCurrentAgeFromDob = (dob: string): string => {
  const age = calculateAgeFromDob(dob);
  if (!age) return "";

  if (age.years > 0) {
    return `${age.years}Y`;
  }

  if (age.months > 0) {
    return `${age.months}M`;
  }

  if (age.days > 0) {
    return `${age.days}D`;
  }

  return "0D";
};

export const resolveCurrentAge = (details?: {
  DOB?: string;
  dob?: string;
  age?: string;
  Age?: string;
  currentAge?: string;
  CurrentAge?: string;
}) => {
  const dob = String(details?.DOB ?? details?.dob ?? "").trim();
  const ageFromDob = formatCurrentAgeFromDob(dob);
  if (ageFromDob) return ageFromDob;

  const existingAge = String(
    details?.currentAge ?? details?.CurrentAge ?? details?.age ?? details?.Age ?? ""
  ).trim();

  return existingAge;
};

export const getRefundDiscountAmount = (refundQty: number, rate: number, discPer: number) => {
  if (!refundQty) return 0;

  const grossAmt = rate * refundQty;
  return Number(((grossAmt * discPer) / 100).toFixed(2));
};

export const getRefundNetAmount = (refundQty: number, rate: number, discPer: number) => {
  if (!refundQty) return 0;

  const grossAmt = rate * refundQty;
  return Number((grossAmt - getRefundDiscountAmount(refundQty, rate, discPer)).toFixed(2));
};

export const calculateRefundBillingTotals = (items: BillDetailsToRefundItem[]) => {
  let totalGrossAmount = 0;
  let totalDiscountAmount = 0;

  items.forEach(item => {
    const refundQty = toNumber(item.RefundQty);
    if (!refundQty) return;

    const rate = toNumber(item.Rate);
    const discPer = toNumber(item.DiscPer);
    const grossAmt = rate * refundQty;
    const discountAmt = getRefundDiscountAmount(refundQty, rate, discPer);

    totalGrossAmount += grossAmt;
    totalDiscountAmount += discountAmt;
  });

  const netAmount = totalGrossAmount - totalDiscountAmount;
  const roundOff = Math.round(netAmount) - netAmount;
  const finalNetAmount = Math.round(netAmount);

  return {
    grossBillAmount: Number(totalGrossAmount.toFixed(2)),
    totalDiscAmtOnBill: Number(totalDiscountAmount.toFixed(2)),
    totalDiscPerOnBill:
      totalGrossAmount > 0
        ? Number(((totalDiscountAmount / totalGrossAmount) * 100).toFixed(2))
        : 0,
    roundOff: Number(roundOff.toFixed(2)),
    netAmount: Number(finalNetAmount.toFixed(2)),
    balanceAmount: Number(finalNetAmount.toFixed(2)),
  };
};

const mapRecordToRefundItemPayload = (
  source: Record<string, unknown>,
  fallback?: Partial<BillDetailsToRefundItem>
): OpdRefundItemPayload => {
  const qty = toNumber(pickValue(source, "qty", "Qty", "refundQty", "RefundQty"), 0);
  const rate = toNumber(pickValue(source, "rate", "Rate"), toNumber(fallback?.Rate));
  const discPer = toNumber(pickValue(source, "discPer", "DiscPer"), toNumber(fallback?.DiscPer));
  const grossAmt = toNumber(pickValue(source, "grossAmt", "GrossAmt"), qty * rate);
  const discAmt = toNumber(
    pickValue(source, "discAmt", "DiscAmt"),
    getRefundDiscountAmount(qty, rate, discPer)
  );
  const netAmt = toNumber(pickValue(source, "netAmt", "NetAmt"), grossAmt - discAmt);

  return {
    ftdId: toNumber(pickValue(source, "ftdId", "FTDId"), toNumber(fallback?.FTDId)),
    serviceItemId: toNumber(
      pickValue(source, "serviceItemId", "ServiceItemId"),
      toNumber(fallback?.ServiceItemId)
    ),
    subSubCategoryId: toNumber(
      pickValue(source, "subSubCategoryId", "SubSubCategoryId"),
      toNumber(fallback?.SubSubCategoryId)
    ),
    subCategoryId: toNumber(
      pickValue(source, "subCategoryId", "SubCategoryId"),
      toNumber(fallback?.SubCategoryId)
    ),
    categoryId: toNumber(pickValue(source, "categoryId", "CategoryId"), toNumber(fallback?.CategoryId)),
    serviceName: String(pickValue(source, "serviceName", "ServiceName") ?? fallback?.ServiceName ?? ""),
    code: String(pickValue(source, "code", "Code", "serviceCode", "ServiceCode") ?? fallback?.ServiceCode ?? ""),
    corporateAlias: String(
      pickValue(source, "corporateAlias", "CorporateAlias") ?? fallback?.CorporateAlias ?? ""
    ),
    corporateCode: String(
      pickValue(source, "corporateCode", "CorporateCode") ?? fallback?.CorporateCode ?? ""
    ),
    isNonPayable: toNumber(pickValue(source, "isNonPayable", "IsNonPayable")),
    rateListId: toNumber(pickValue(source, "rateListId", "RateListId")),
    doctorId: toNumber(pickValue(source, "doctorId", "DoctorId"), toNumber(fallback?.DoctorId)),
    qty,
    rate,
    discPer,
    discAmt: Number(discAmt.toFixed(2)),
    grossAmt: Number(grossAmt.toFixed(2)),
    netAmt: Number(netAmt.toFixed(2)),
    isUnderPackage: toNumber(
      pickValue(source, "isUnderPackage", "IsUnderPackage"),
      toNumber(fallback?.IsUnderPackage)
    ),
  };
};

export const mapRefundRowToPayload = (item: BillDetailsToRefundItem): OpdRefundItemPayload => {
  const refundQty = toNumber(item.RefundQty);
  const rate = toNumber(item.Rate);
  const discPer = toNumber(item.DiscPer);
  const grossAmt = refundQty * rate;
  const discAmt = getRefundDiscountAmount(refundQty, rate, discPer);
  const netAmt = getRefundNetAmount(refundQty, rate, discPer);

  return {
    ftdId: toNumber(item.FTDId),
    serviceItemId: toNumber(item.ServiceItemId),
    subSubCategoryId: toNumber(item.SubSubCategoryId),
    subCategoryId: toNumber(item.SubCategoryId),
    categoryId: toNumber(item.CategoryId),
    serviceName: item.ServiceName ?? "",
    code: item.ServiceCode ?? "",
    corporateAlias: item.CorporateAlias ?? "",
    corporateCode: item.CorporateCode ?? "",
    isNonPayable: 0,
    rateListId: 0,
    doctorId: toNumber(item.DoctorId),
    qty: refundQty,
    rate,
    discPer,
    discAmt,
    grossAmt: Number(grossAmt.toFixed(2)),
    netAmt,
    isUnderPackage: toNumber(item.IsUnderPackage),
  };
};

export const buildRefundItemsPayload = async ({
  refundRows,
  fetchPackageServices,
}: Pick<BuildOpdRefundSavePayloadArgs, "refundRows" | "fetchPackageServices">) => {
  const refundItems: OpdRefundItemPayload[] = [];

  for (const item of refundRows) {
    const refundQty = toNumber(item.RefundQty);
    if (!refundQty) continue;

    if (Number(item.CategoryTypeId) === OPD_REFUND_PACKAGE_CATEGORY_TYPE_ID) {
      const packageServices = await fetchPackageServices(item.VisitId, item.ServiceItemId);

      if (!Array.isArray(packageServices) || packageServices.length === 0) {
        refundItems.push(mapRefundRowToPayload(item));
        continue;
      }

      packageServices.forEach(service => {
        refundItems.push(
          mapRecordToRefundItemPayload(service as Record<string, unknown>, item)
        );
      });
      continue;
    }

    refundItems.push(mapRefundRowToPayload(item));
  }

  return refundItems;
};

export const buildVisitDetailsPayload = ({
  headerItem,
  billingValues,
  branchId,
  roleId,
  currentAgeFallback = "",
}: {
  headerItem: BillDetailsToRefundItem | null;
  billingValues: BillingValuesItem;
  branchId: number;
  roleId: number;
  currentAgeFallback?: string;
}): OpdRefundVisitDetailsPayload => ({
  patientId: toNumber(headerItem?.PatientId),
  uhid: headerItem?.UHID ?? "",
  branchId,
  roleId,
  currentAge: resolveCurrentAge(headerItem ?? undefined) || String(currentAgeFallback).trim(),
  insuranceCompanyId: toNumber(headerItem?.InsuranceCompanyId),
  corporateId: toNumber(headerItem?.CorporateId),
  doctorId: toNumber(headerItem?.DoctorId),
  referDoctorId: toNumber(headerItem?.ReferDoctorId),
  grossBillAmount: toNumber(billingValues.grossBillAmount),
  totalDiscPerOnBill: toNumber(billingValues.totalDiscPerOnBill),
  totalDiscAmtOnBill: toNumber(billingValues.totalDiscAmtOnBill),
  roundOff: toNumber(billingValues.roundOff),
  netAmount: toNumber(billingValues.netAmount),
  discApprovedById: toNumber(billingValues.discApprovedById),
  discountReason: billingValues.discountReason ?? "",
  remarks: billingValues.remarks ?? "",
  uniqueId: "",
  mlc: "",
  pi: "",
  remark: "",
  policyNo: "",
  policyCardNo: "",
  expiryDate: "",
  cardHolder: "",
  referalNo: "",
  referalDate: "",
  diagnosisId: 0,
  proId: 0,
  proName: "",
  isSendMRD: 0,
});

export const buildPaymentDetailsPayload = (
  payments: Array<Record<string, unknown>>
): OpdRefundPaymentDetailPayload[] =>
  payments
    .filter(payment => toNumber(payment.amount) > 0 && toNumber(payment.paymentModeId) > 0)
    .map(payment => ({
      paymentModeId: toNumber(payment.paymentModeId),
      paymentModeTypeId: toNumber(payment.paymentModeTypeId),
      amount: toNumber(payment.amount),
      isCopaymentReceipt: toNumber(payment.isCopaymentReceipt),
      isPatientAdvanceAmount: toNumber(payment.isPatientAdvanceAmount),
      bankId: toNumber(payment.bankId),
      refNo: String(payment.refNo ?? ""),
      plutusTransactionReferenceID: String(payment.plutusTransactionReferenceID ?? ""),
      transactionLogId: String(payment.transactionLogId ?? ""),
    }));

export const buildOpdRefundSavePayload = async ({
  headerItem,
  refundRows,
  billingValues,
  payments,
  branchId,
  roleId,
  fetchPackageServices,
  currentAgeFallback = "",
}: BuildOpdRefundSavePayloadArgs): Promise<OpdRefundSavePayload> => ({
  visitDetails: buildVisitDetailsPayload({
    headerItem,
    billingValues,
    branchId,
    roleId,
    currentAgeFallback,
  }),
  refundItems: await buildRefundItemsPayload({
    refundRows,
    fetchPackageServices,
  }),
  paymentDetails: buildPaymentDetailsPayload(payments),
});

export const buildOpdRefundRequestApprovalPayload = ({
  headerItem,
  refundRows,
  billingValues,
  branchId,
  roleId,
}: BuildOpdRefundRequestApprovalPayloadArgs): OpdRefundRequestApprovalPayload => ({
  visitDetails: {
    branchId,
    roleId,
    patientId: toNumber(headerItem?.PatientId),
    visitId: toNumber(headerItem?.VisitId),
    grossBillAmount: toNumber(billingValues.grossBillAmount),
    totalDiscPerOnBill: toNumber(billingValues.totalDiscPerOnBill),
    totalDiscAmtOnBill: toNumber(billingValues.totalDiscAmtOnBill),
    roundOff: toNumber(billingValues.roundOff),
    netAmount: toNumber(billingValues.netAmount),
    refundApprovedID: toNumber(billingValues.discApprovedById),
    refundApprovedName: billingValues.discApprovedName ?? "",
    refundReason: billingValues.discountReason ?? "",
    refundRemark: billingValues.remarks ?? "",
  },
  billingItems: refundRows
    .filter(item => toNumber(item.RefundQty) > 0)
    .map(item => ({
      ftdId: toNumber(item.FTDId),
      refundQty: toNumber(item.RefundQty),
    })),
});

export const mapRefundRequestDetailsToBillRows = (data: unknown): BillDetailsToRefundItem[] => {
  const wrapper =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;

  const headerSource =
    wrapper ??
    (Array.isArray(data) && data[0] && typeof data[0] === "object"
      ? (data[0] as Record<string, unknown>)
      : null);

  const headerCorporateId = headerSource
    ? toNumber(pickValue(headerSource, "CorporateId", "corporateId"))
    : 0;

  const headerDefaults = {
    VisitId: headerSource ? toNumber(pickValue(headerSource, "VisitId", "visitId")) : 0,
    UHID: headerSource ? String(pickValue(headerSource, "UHID", "uhid") ?? "") : "",
    PatientName: headerSource
      ? String(pickValue(headerSource, "PatientName", "patientName") ?? "")
      : "",
    PatientId: headerSource ? toNumber(pickValue(headerSource, "PatientId", "patientId")) : 0,
    DOB: headerSource ? String(pickValue(headerSource, "DOB", "dob") ?? "") : "",
    Age: headerSource
      ? String(pickValue(headerSource, "Age", "age", "CurrentAge", "currentAge") ?? "")
      : "",
    CorporateName: headerSource
      ? String(pickValue(headerSource, "CorporateName", "corporateName") ?? "")
      : "",
    BillNo: headerSource ? String(pickValue(headerSource, "BillNo", "billNo") ?? "") : "",
    BillDate: headerSource ? String(pickValue(headerSource, "BillDate", "billDate") ?? "") : "",
    CorporateId: headerCorporateId || 1,
  };

  const rows = Array.isArray(data)
    ? data
    : Array.isArray(wrapper?.items)
      ? (wrapper?.items as unknown[])
      : Array.isArray(wrapper?.billingItems)
        ? (wrapper?.billingItems as unknown[])
        : Array.isArray(wrapper?.refundItems)
          ? (wrapper?.refundItems as unknown[])
          : Array.isArray(wrapper?.serviceItems)
            ? (wrapper?.serviceItems as unknown[])
            : data
              ? [data]
              : [];

  return rows.map((row: unknown) => {
    const source = (row ?? {}) as Record<string, unknown>;

    return {
      VisitId: toNumber(pickValue(source, "VisitId", "visitId")) || headerDefaults.VisitId,
      UHID: String(pickValue(source, "UHID", "uhid") ?? "") || headerDefaults.UHID,
      PatientName:
        String(pickValue(source, "PatientName", "patientName") ?? "") || headerDefaults.PatientName,
      PatientId:
        toNumber(pickValue(source, "PatientId", "patientId")) || headerDefaults.PatientId,
      DOB: String(pickValue(source, "DOB", "dob") ?? "") || headerDefaults.DOB,
      Age:
        String(pickValue(source, "Age", "age", "CurrentAge", "currentAge") ?? "") ||
        headerDefaults.Age,
      ReferDoctorId: toNumber(pickValue(source, "ReferDoctorId", "referDoctorId"), 0) || null,
      CorporateName:
        String(pickValue(source, "CorporateName", "corporateName") ?? "") ||
        headerDefaults.CorporateName,
      DoctorName: String(pickValue(source, "DoctorName", "doctorName") ?? ""),
      BillNo: String(pickValue(source, "BillNo", "billNo") ?? "") || headerDefaults.BillNo,
      BillDate: String(pickValue(source, "BillDate", "billDate") ?? "") || headerDefaults.BillDate,
      TotalBillAmount: toNumber(pickValue(source, "TotalBillAmount", "totalBillAmount")),
      TotalPaidAmount: toNumber(pickValue(source, "TotalPaidAmount", "totalPaidAmount")),
      ServiceName: String(pickValue(source, "ServiceName", "serviceName") ?? ""),
      ServiceCode: String(pickValue(source, "ServiceCode", "serviceCode", "Code", "code") ?? ""),
      FTDId: toNumber(pickValue(source, "FTDId", "ftdId")),
      ServiceItemId: toNumber(pickValue(source, "ServiceItemId", "serviceItemId")),
      SubSubCategoryId: toNumber(pickValue(source, "SubSubCategoryId", "subSubCategoryId")),
      SubCategoryId: toNumber(pickValue(source, "SubCategoryId", "subCategoryId")),
      CorporateAlias: String(pickValue(source, "CorporateAlias", "corporateAlias") ?? ""),
      CorporateCode: String(pickValue(source, "CorporateCode", "corporateCode") ?? ""),
      DoctorId: toNumber(pickValue(source, "DoctorId", "doctorId")),
      CorporateId:
        toNumber(pickValue(source, "CorporateId", "corporateId")) || headerDefaults.CorporateId,
      InsuranceCompanyId: toNumber(pickValue(source, "InsuranceCompanyId", "insuranceCompanyId")),
      Rate: toNumber(pickValue(source, "Rate", "rate")),
      Qty: toNumber(pickValue(source, "Qty", "qty")),
      DiscPer: toNumber(pickValue(source, "DiscPer", "discPer")),
      CategoryId: toNumber(pickValue(source, "CategoryId", "categoryId")),
      CategoryTypeId: toNumber(pickValue(source, "CategoryTypeId", "categoryTypeId")),
      RefundQty: toNumber(
        pickValue(source, "RefundQty", "refundQty", "RefundQuantity", "refundQuantity")
      ),
      IsUnderPackage: toNumber(pickValue(source, "IsUnderPackage", "isUnderPackage")),
    } as BillDetailsToRefundItem;
  });
};

export const mergeRefundQtyOntoBillDetails = (
  billRows: BillDetailsToRefundItem[],
  refundRows: BillDetailsToRefundItem[]
): BillDetailsToRefundItem[] => {
  const refundQtyByKey = new Map<string, number>();

  refundRows.forEach(item => {
    const ftdKey = Number(item.FTDId) > 0 ? `ftd:${item.FTDId}` : "";
    const serviceKey = Number(item.ServiceItemId) > 0 ? `svc:${item.ServiceItemId}` : "";
    const qty = toNumber(item.RefundQty);

    if (ftdKey) refundQtyByKey.set(ftdKey, qty);
    if (serviceKey) refundQtyByKey.set(serviceKey, qty);
  });

  return billRows.map(item => {
    const ftdKey = Number(item.FTDId) > 0 ? `ftd:${item.FTDId}` : "";
    const serviceKey = Number(item.ServiceItemId) > 0 ? `svc:${item.ServiceItemId}` : "";
    const refundQty =
      (ftdKey ? refundQtyByKey.get(ftdKey) : undefined) ??
      (serviceKey ? refundQtyByKey.get(serviceKey) : undefined) ??
      item.RefundQty ??
      0;

    const matchedRefund =
      refundRows.find(
        row =>
          (Number(item.FTDId) > 0 && Number(row.FTDId) === Number(item.FTDId)) ||
          (Number(item.ServiceItemId) > 0 && Number(row.ServiceItemId) === Number(item.ServiceItemId))
      ) ?? refundRows[0];

    return {
      ...item,
      Age: item.Age || matchedRefund?.Age || "",
      DOB: item.DOB || matchedRefund?.DOB || "",
      PatientName: item.PatientName || matchedRefund?.PatientName || "",
      UHID: item.UHID || matchedRefund?.UHID || "",
      CorporateName: item.CorporateName || matchedRefund?.CorporateName || "",
      BillNo: item.BillNo || matchedRefund?.BillNo || "",
      BillDate: item.BillDate || matchedRefund?.BillDate || "",
      RefundQty: refundQty,
    };
  });
};

