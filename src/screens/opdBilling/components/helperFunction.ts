import { ServiceBindingItem } from "../types";

type ServiceRow = ServiceBindingItem & {
  qty?: string | number | null;
  dis?: string | number | null;
  netAmount?: string | number | null;
  discountPer?: string | number | null;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getServiceRowRemarks = (row: ServiceRow | ServiceBindingItem | Record<string, unknown>) => {
  const record = row as Record<string, unknown>;
  return String(record?.remarks ?? record?.Remarks ?? "");
};

const recalculateFromDiscountPercentage = (
  row: ServiceRow,
  discountPerInput: number,
  rateInput?: number
) => {
  const qty = toNumber(row?.qty) || 1;
  const rate = rateInput ?? toNumber(row?.rate);
  const grossAmt = qty * rate;
  const normalizedDiscountPer = Math.min(100, Math.max(0, discountPerInput));
  const dis = Number(((grossAmt * normalizedDiscountPer) / 100).toFixed(2));
  const netAmount = Number((grossAmt - dis).toFixed(2));

  return {
    ...row,
    qty,
    rate,
    discountPer: Number(normalizedDiscountPer.toFixed(2)),
    dis,
    netAmount,
    remarks: getServiceRowRemarks(row),
  };
};

const recalculateFromDiscountValue = (row: ServiceRow, discountValueInput: number) => {
  const qty = toNumber(row?.qty) || 1;
  const rate = toNumber(row?.rate);
  const grossAmt = qty * rate;
  const normalizedDiscountValue = Math.min(grossAmt, Math.max(0, discountValueInput));
  const discountPer = grossAmt > 0 ? (normalizedDiscountValue / grossAmt) * 100 : 0;
  const netAmount = Number((grossAmt - normalizedDiscountValue).toFixed(2));

  return {
    ...row,
    qty,
    discountPer: Number(discountPer.toFixed(2)),
    dis: Number(normalizedDiscountValue.toFixed(2)),
    netAmount,
    remarks: getServiceRowRemarks(row),
  };
};

const applyRateChange = (rows: ServiceBindingItem[], rowIndex: number, nextRateInput: unknown) => {
  const nextRate = toNumber(nextRateInput);
  return rows.map((service, index) => {
    if (index !== rowIndex) return service;
    return recalculateFromDiscountPercentage(
      service,
      toNumber((service as ServiceRow)?.discountPer),
      nextRate
    );
  });
};

const applyDiscountAmountChange = (
  rows: ServiceBindingItem[],
  rowIndex: number,
  nextDiscountInput: unknown
) => {
  const nextDiscount = toNumber(nextDiscountInput);
  return rows.map((service, index) => {
    if (index !== rowIndex) return service;
    return recalculateFromDiscountValue(service, nextDiscount);
  });
};

const applyDiscountPercentageChange = (
  rows: ServiceBindingItem[],
  rowIndex: number,
  nextDiscountPercentageInput: unknown
) => {
  const nextDiscountPercentage = toNumber(nextDiscountPercentageInput);
  return rows.map((service, index) => {
    if (index !== rowIndex) return service;
    return recalculateFromDiscountPercentage(service, nextDiscountPercentage);
  });
};

export {
  applyDiscountAmountChange,
  applyDiscountPercentageChange,
  applyRateChange,
  getServiceRowRemarks,
  recalculateFromDiscountPercentage,
  recalculateFromDiscountValue,
  toNumber,
};
