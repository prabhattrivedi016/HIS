import { OpDiscountFilterValues } from "../../opDiscountApproval/components/OpDiscountFilterModal";
import { OPPaymentItem, OpPaymentGridCard, OpPaymentListCard } from "../types";

export type OpPaymentCollectionCachedState = {
  queryValue: OpDiscountFilterValues;
  opPaymentGridData: OpPaymentGridCard[];
  opPaymentListData: OpPaymentListCard[];
  gridFilteredData: OpPaymentGridCard[];
  listFilteredData: OpPaymentListCard[];
  rawItemMap: Record<number, OPPaymentItem>;
  hasFetched: boolean;
  cardView: string;
  shouldRefreshOnReturn?: boolean;
};

export const opPaymentCollectionStateRef: {
  current: OpPaymentCollectionCachedState | null;
} = { current: null };

export const getDefaultOpPaymentFilters = (
  branchId: number,
  today: string
): OpDiscountFilterValues => ({
  branchId: branchId || 1,
  fromDate: today,
  toDate: today,
});

export const saveOpPaymentCollectionState = (state: OpPaymentCollectionCachedState) => {
  opPaymentCollectionStateRef.current = state;
};

export const markOpPaymentCollectionRefreshOnReturn = () => {
  if (!opPaymentCollectionStateRef.current) return;

  opPaymentCollectionStateRef.current = {
    ...opPaymentCollectionStateRef.current,
    shouldRefreshOnReturn: true,
  };
};
