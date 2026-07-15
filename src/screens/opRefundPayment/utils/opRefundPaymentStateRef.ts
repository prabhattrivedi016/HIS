import { OpRefundApprovalFilterValues } from "../../opRefundApproval/components/OpRefundFilterModal";
import { OPRefundPaymentItem, OpRefundPaymentGridCard, OpRefundPaymentListCard } from "../types";

export type OpRefundPaymentCachedState = {
  queryValue: OpRefundApprovalFilterValues;
  opRefundPaymentGridData: OpRefundPaymentGridCard[];
  opRefundPaymentListData: OpRefundPaymentListCard[];
  gridFilteredData: OpRefundPaymentGridCard[];
  listFilteredData: OpRefundPaymentListCard[];
  rawItemMap: Record<number, OPRefundPaymentItem>;
  hasFetched: boolean;
  cardView: string;
  shouldRefreshOnReturn?: boolean;
};

export const opRefundPaymentStateRef: {
  current: OpRefundPaymentCachedState | null;
} = { current: null };

export const getDefaultOpRefundPaymentFilters = (
  branchId: number,
  today: string
): OpRefundApprovalFilterValues => ({
  branchId: branchId || 1,
  fromDate: today,
  toDate: today,
});

export const saveOpRefundPaymentState = (state: OpRefundPaymentCachedState) => {
  opRefundPaymentStateRef.current = state;
};

export const markOpRefundPaymentRefreshOnReturn = () => {
  if (!opRefundPaymentStateRef.current) return;

  opRefundPaymentStateRef.current = {
    ...opRefundPaymentStateRef.current,
    shouldRefreshOnReturn: true,
  };
};
