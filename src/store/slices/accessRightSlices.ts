import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/config/defaults";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

type AccessRightsMap = Record<string, number | boolean | string | null>;

type FetchUserRightAccessPayload = {
  branchId: number;
  roleId: number;
};

type AccessRightsState = {
  accessRights: AccessRightsMap;
  loading: boolean;
  error: string | null;
};

const initialState: AccessRightsState = {
  accessRights: {},
  loading: false,
  error: null,
};

export const fetchUserRightAccess = createAsyncThunk<
  AccessRightsMap,
  FetchUserRightAccessPayload,
  { rejectValue: string }
>("accessRights/fetchUserAccessRights", async ({ branchId, roleId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.GET_USER_ACCESS_RIGHTS, {
      params: { branchId, roleId },
    });

    const rights = response?.data?.data;

    return rights && typeof rights === "object" && !Array.isArray(rights) ? rights : {};
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to fetch user access rights");
  }
});

const accessRightSlice = createSlice({
  name: "accessRights",
  initialState,
  reducers: {
    clearAccessRights: state => {
      state.accessRights = {};
      state.error = null;
      state.loading = false;
    },
    setAccessRights: (state, action: PayloadAction<AccessRightsMap>) => {
      state.accessRights =
        action.payload && typeof action.payload === "object" ? action.payload : {};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserRightAccess.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRightAccess.fulfilled, (state, action) => {
        state.loading = false;
        state.accessRights = action.payload;
      })
      .addCase(fetchUserRightAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user access rights";
      });
  },
});

export const { clearAccessRights, setAccessRights } = accessRightSlice.actions;
export default accessRightSlice.reducer;
