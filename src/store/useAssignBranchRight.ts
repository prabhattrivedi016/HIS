import { useCallback, useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "./hooks";
import { fetchAssignBranchRight } from "./slices/assignBranchRightSlice";
import type { RootState } from "./store";

const toFlag = (value: number | undefined | null) => Number(value ?? 0) === 1;

export const selectAssignBranchRightState = (state: RootState) => state.assignBranchRight;

export const useAssignBranchRight = () => {
  const dispatch = useAppDispatch();
  const { branchId, rights, loading, error } = useAppSelector(selectAssignBranchRightState);

  const refetchAssignBranchRight = useCallback(
    (targetBranchId?: number) => {
      const resolvedBranchId = Number(targetBranchId ?? branchId ?? 0);
      if (!resolvedBranchId) return Promise.reject(new Error("Branch ID is required"));

      return dispatch(fetchAssignBranchRight({ branchId: resolvedBranchId })).unwrap();
    },
    [branchId, dispatch]
  );

  return {
    branchId,
    rights,
    loading,
    error,
    refetchAssignBranchRight,
    isOPDBillingAllowedForIPDPatient: toFlag(rights?.IsOPDBillingAllowedForIPDPatient),
    isOPDBillingDiscountApprovalRequired: toFlag(
      rights?.IsOPDBillingDiscountApprovalRequired
    ),
    isOutstandingAllowedForCashCorporate: toFlag(rights?.IsOutstandingAllowedForCashCorporate),
    isSeparateCollectionCounterEnabled: toFlag(rights?.IsSeparateCollectionCounterEnabled),
  };
};

export const AssignBranchRightInitializer = () => {
  const authContext = useContext(AuthContext);
  const dispatch = useAppDispatch();
  const branchId = Number(authContext?.user?.branchId ?? 0);

  useEffect(() => {
    if (!authContext?.isInitialized || !authContext?.token || !branchId) return;

    dispatch(fetchAssignBranchRight({ branchId }));
  }, [authContext?.isInitialized, authContext?.token, branchId, dispatch]);

  return null;
};
