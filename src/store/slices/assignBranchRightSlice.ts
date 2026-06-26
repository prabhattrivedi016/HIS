import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/config/defaults";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AssignBranchRight = {
  IsOPDBillingAllowedForIPDPatient: number;
  IsOPDBillingDiscountApprovalRequired: number;
  IsOutstandingAllowedForCashCorporate: number;
  IsSeparateCollectionCounterEnabled: number;
};

type FetchAssignBranchRightPayload = {
  branchId: number;
};

type FetchAssignBranchRightResult = {
  branchId: number;
  rights: AssignBranchRight | null;
};

export type AssignBranchRightState = {
  branchId: number | null;
  rights: AssignBranchRight | null;
  loading: boolean;
  error: string | null;
};

const initialState: AssignBranchRightState = {
  branchId: null,
  rights: null,
  loading: false,
  error: null,
};

export const fetchAssignBranchRight = createAsyncThunk<
  FetchAssignBranchRightResult,
  FetchAssignBranchRightPayload,
  { rejectValue: string }
>("assignBranchRight/fetchAssignBranchRight", async ({ branchId }, { rejectWithValue }) => {
  try {
    if (!branchId) {
      return rejectWithValue("Branch ID is required");
    }

    const response = await axiosInstance.get(ENDPOINTS.GET_ASSIGN_BRANCH_RIGHT, {
      params: { branchId },
    });

    const data = response?.data?.data;
    const rights = Array.isArray(data) ? (data[0] ?? null) : null;

    return { branchId, rights };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch assign branch right"
    );
  }
});

const assignBranchRightSlice = createSlice({
  name: "assignBranchRight",
  initialState,
  reducers: {
    clearAssignBranchRight: () => initialState,
    setAssignBranchRight: (
      state,
      action: PayloadAction<{ branchId: number; rights: AssignBranchRight | null }>
    ) => {
      state.branchId = action.payload.branchId;
      state.rights = action.payload.rights;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAssignBranchRight.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignBranchRight.fulfilled, (state, action) => {
        state.loading = false;
        state.branchId = action.payload.branchId;
        state.rights = action.payload.rights;
      })
      .addCase(fetchAssignBranchRight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch assign branch right";
      });
  },
});

export const { clearAssignBranchRight, setAssignBranchRight } = assignBranchRightSlice.actions;
export default assignBranchRightSlice.reducer;
