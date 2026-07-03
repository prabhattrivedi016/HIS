import { OPDiscountItem } from "../types";

export const canShowSendForApproval = (item?: OPDiscountItem | null) =>
  !!item &&
  item.IsCancel !== 1 &&
  (!item.IsLevel1Approve ||
    !item.IsLevel2Approve ||
    !item.IsLevel3Approve ||
    !item.IsLevel4Approve) &&
  item.FlagId === 0 &&
  item.CanApprove === 0;

export const canShowApprove = (item?: OPDiscountItem | null) =>
  !!item && item.IsCancel !== 1 && item.CanApprove === 1 && item.FlagId === 1;

export const canShowCancel = (item?: OPDiscountItem | null) => !!item && item.IsCancel !== 1;

export const getOpDiscountItemById = (
  rawItemMap: Record<number, OPDiscountItem>,
  id?: number | null
) => (id ? rawItemMap[id] ?? null : null);
