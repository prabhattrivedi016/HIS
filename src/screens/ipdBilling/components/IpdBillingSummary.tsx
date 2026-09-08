import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import BaseTable from "@/components/shared/BaseTable";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import useGetPreDefinedQueryResult from "@/hooks/useGetPreDefinedQueryResult";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useQuery } from "@tanstack/react-query";
import { MRT_ColumnDef, MRT_RowSelectionState } from "material-react-table";
import { useContext, useMemo, useState } from "react";
import {
  BillFilterItem,
  IpdPatientItem,
  IpdSummaryBillingTableList,
  PaymentListItem,
} from "../types";
import FilterPopup from "./FilterPopup";

const IpdBillingSummary = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();

  const branchId = useContext(BranchContext)?.branchId ?? 1;

  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────

  const [isSupplementaryBill, setIsSupplementaryBill] = useState<0 | 1>(0);

  const [selectedBillId, setSelectedBillId] = useState<number>(0);

  const [selectedFilteredData, setSelectedFilteredData] = useState<IpdSummaryBillingTableList[]>(
    []
  );

  const [groupBy, setGroupBy] = useState<string[]>([]);

  /**
   * MRT row selection state.
   *
   * Example:
   * {
   *   "101": true,
   *   "105": true
   * }
   */
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const [openFilterPopup, setOpenFilterPopup] = useState(false);

  const [renderFilterPopup, setRenderFilterPopup] = useState(false);

  // ─────────────────────────────────────────────
  // Payment History
  // ─────────────────────────────────────────────

  const paymentSummaryHistory =
    useGetPreDefinedQueryResult({
      queryName: "GetReceiptListByVisitId",
      filter1: patient?.VisitId,
    })?.predefinedQueryResult ?? [];

  // ─────────────────────────────────────────────
  // Bill Summary Details
  // ─────────────────────────────────────────────

  const getBillSummaryDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_PATIENT_BILL_AMOUNTS,
      {},
      {
        params: {
          visitId: patient?.VisitId,
          patientId: patient?.PatientId,
        },
      },
      {
        component: "IpdBillingSummary",
      }
    );

    return resp?.data?.[0] ?? {};
  };

  const { data: ipdBillingSummaryData = {} } = useQuery({
    queryKey: ["getBillSummaryDetails", patient],
    queryFn: getBillSummaryDetails,
  });

  // ─────────────────────────────────────────────
  // IPD Billing Summary
  // ─────────────────────────────────────────────

  const getIpdBillingSummaryDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_BILLING_SUMMARY,
      {},
      {
        params: {
          branchId,
          visitId: patient?.VisitId,
        },
      },
      {
        component: "IpdBillingSummary",
      }
    );

    return resp?.data ?? [];
  };

  const { data: getIpdBillingSummaryLists = [] } = useQuery({
    queryKey: ["ipdBillingSummaryLists", branchId, patient?.VisitId],
    queryFn: getIpdBillingSummaryDetails,
  });

  // ─────────────────────────────────────────────
  // Bill Filter Values
  // ─────────────────────────────────────────────

  const getFilterValue =
    useGetPreDefinedQueryResult({
      queryName: "GetIPDBillNoListByVisitId",
      filter1: patient?.VisitId,
    })?.predefinedQueryResult ?? [];

  // ─────────────────────────────────────────────
  // Table Columns
  // ─────────────────────────────────────────────

  const columns = useMemo<MRT_ColumnDef<IpdSummaryBillingTableList>[]>(
    () => [
      {
        accessorKey: "BillingDate",
        header: "Billing Date",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "CategoryName",
        header: "Category",
        minSize: 130,
        enableGrouping: true,
      },

      {
        accessorKey: "SubCategoryName",
        header: "Sub Category",
        minSize: 120,
        enableGrouping: true,
      },

      {
        accessorKey: "SubSubCategoryName",
        header: "Sub Sub Category",
        minSize: 130,
        enableGrouping: true,
      },

      {
        id: "PrintGroupName",
        accessorKey: "SubSubCategoryName",
        header: "Print Group Name",
        minSize: 130,
        enableGrouping: true,
      },

      {
        accessorKey: "CreatedOnWithTime",
        header: "Date Time",
        minSize: 200,
        enableGrouping: true,
      },

      {
        accessorKey: "ServiceName",
        header: "Service / Item",
        minSize: 200,
        enableGrouping: true,
      },

      {
        accessorKey: "Code",
        header: "Code",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "DoctorName",
        header: "Doctor",
        minSize: 150,
        enableGrouping: true,
      },

      {
        accessorKey: "IsUnderPackage",
        header: "Is Under Package",
        minSize: 150,
        enableGrouping: true,

        Cell: ({ cell }) => {
          const value = cell.getValue<number>();

          const isUnderPackage = value === 1;

          return (
            <span className="flex items-center">
              <span className="ml-2 text-sm text-gray-700">{isUnderPackage ? "Yes" : "No"}</span>
            </span>
          );
        },
      },

      {
        accessorKey: "Qty",
        header: "Qty",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "Rate",
        header: "Rate",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "DiscPer",
        header: "Discount (%)",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "DiscAmt",
        header: "Discount",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "NetAmt",
        header: "Amount",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "UserName",
        header: "User Name",
        minSize: 100,
        enableGrouping: true,
      },
    ],
    []
  );

  // ─────────────────────────────────────────────
  // Currency Formatter
  // ─────────────────────────────────────────────

  const formatCurrency = (val: number | undefined | null) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(val ?? 0));
  };

  // ─────────────────────────────────────────────
  // Filter Billing Data
  // ─────────────────────────────────────────────

  const filteredBillingLists = useMemo(() => {
    if (Number(selectedBillId) === 0) {
      return getIpdBillingSummaryLists;
    }

    return getIpdBillingSummaryLists.filter(
      (item: IpdSummaryBillingTableList) => String(item?.BillId) === String(selectedBillId)
    );
  }, [getIpdBillingSummaryLists, selectedBillId]);

  // ─────────────────────────────────────────────
  // Final Data Shown In Table
  // ─────────────────────────────────────────────

  const tableData = useMemo(() => {
    return selectedFilteredData.length > 0 ? selectedFilteredData : filteredBillingLists;
  }, [selectedFilteredData, filteredBillingLists]);

  // ─────────────────────────────────────────────
  // COMPLETE SELECTED ROW OBJECTS
  // ─────────────────────────────────────────────

  const selectedItems = useMemo<IpdSummaryBillingTableList[]>(() => {
    return tableData.filter((item: IpdSummaryBillingTableList) => {
      /**
       * IMPORTANT:
       *
       * BillDetailId must be unique
       * for every billing-detail row.
       */
      const rowId = String(item?.FTDId);

      return Boolean(rowSelection[rowId]);
    });
  }, [tableData, rowSelection]);

  // ─────────────────────────────────────────────
  // Debug Selected Rows
  // ─────────────────────────────────────────────

  console.log("rowSelection:", rowSelection);

  console.log("Selected complete rows:", selectedItems);

  // ─────────────────────────────────────────────
  // Filter Popup
  // ─────────────────────────────────────────────

  const handleFilterClick = () => {
    setOpenFilterPopup(true);
    setRenderFilterPopup(true);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="w-full flex flex-col gap-5 p-1">
      {/* ═══════════════════════════════════════ */}
      {/* MAIN GRID */}
      {/* ═══════════════════════════════════════ */}

      <div className="grid grid-cols-12 gap-5 items-start">
        {/* ═══════════════════════════════════════ */}
        {/* LEFT COLUMN */}
        {/* ═══════════════════════════════════════ */}

        <div className="col-span-12 lg:col-span-9 flex flex-col gap-3">
          {/* Billing Items Card */}

          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-4">
            {/* Header */}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-slate-800 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-list-check text-[#0B5394]"></i>
                Billing Items
              </h3>

              {/* Bill Filter */}

              <InputField>
                <select
                  className="input-field"
                  value={selectedBillId}
                  onChange={e => setSelectedBillId(Number(e.target.value))}
                >
                  <option value={0}>All Items</option>

                  {getFilterValue.map((f: BillFilterItem) => (
                    <option key={f?.BillId} value={f?.BillId}>
                      {f?.BillNo}
                    </option>
                  ))}
                </select>
              </InputField>
            </div>

            {/* ═══════════════════════════════ */}
            {/* BILLING TABLE */}
            {/* ═══════════════════════════════ */}

            <BaseTable
              columns={columns}
              data={tableData}
              showIndex
              enableRowSelection={row => Number(row.IsSupplementaryBill) === 0}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              /**
               * IMPORTANT:
               * Use your actual unique billing
               * detail ID here.
               */
              getRowId={row => String(row.FTDId)}
              enableGrouping
              groupBy={groupBy}
              onGroupingChange={setGroupBy}
              enableGroupingOnHeaderDoubleClick
            />

            {/* ═══════════════════════════════ */}
            {/* ACTION BUTTONS */}
            {/* ═══════════════════════════════ */}

            <div className="flex items-center justify-end gap-3 flex-wrap">
              <button className="save-btn" onClick={handleFilterClick}>
                Filter
              </button>

              <button className="save-btn">Rate</button>

              <button className="save-btn">Discount (%)</button>

              <button className="save-btn">Discount (Amt)</button>

              <button className="save-btn">Non Payable</button>

              <button className="save-btn">Payable</button>

              <button className="save-btn">Package</button>

              <button className="save-btn">Remove</button>
            </div>

            {/* ═══════════════════════════════ */}
            {/* SELECTED ROW INFORMATION */}
            {/* ═══════════════════════════════ */}

            {selectedItems.length > 0 && (
              <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-900">Selected Items</span>

                  <span className="text-sm font-bold text-blue-700">{selectedItems.length}</span>
                </div>

                <pre className="text-xs text-slate-700 overflow-auto max-h-48">
                  {JSON.stringify(selectedItems, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* PAYMENT HISTORY */}
          {/* ═══════════════════════════════════════ */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-4 bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3">
              <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                Payment History
              </h4>

              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <div className="table-size lg:min-h-60 lg:max-h-60">
                    <table className="base-table">
                      <thead className="table-head">
                        <tr>
                          <th className="table-th">#</th>

                          <th className="table-th p-2">Bill Date</th>

                          <th className="table-th">Amount</th>

                          <th className="table-th">Receipt No</th>

                          <th className="table-th">Payment Mode</th>

                          <th className="table-th">User</th>
                        </tr>
                      </thead>

                      <tbody>
                        {paymentSummaryHistory?.length === 0 && (
                          <tr>
                            <td colSpan={6} className="table-empty">
                              No records found
                            </td>
                          </tr>
                        )}

                        {paymentSummaryHistory.map((item: PaymentListItem, idx: number) => (
                          <tr key={idx} className="table-row">
                            <td className="table-td">{idx + 1}</td>

                            <td className="table-td">{item?.BillDate || "-"}</td>

                            <td className="table-td">{item?.Amount || "-"}</td>

                            <td className="table-td">{item?.ReceiptNo || "-"}</td>

                            <td className="table-td">{item?.PaymentModeName || "-"}</td>

                            <td className="table-td">{item?.UserName || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* RIGHT COLUMN */}
        {/* ═══════════════════════════════════════ */}

        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* Bill Summary */}

          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3.5">
            <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Bill Summary
            </h4>

            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-between">
                <span>Total Bill Amount</span>

                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData?.TotalBillAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Total Discount(%)</span>

                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData?.TotalDiscountPerOnBill)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Total Discount</span>

                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData?.TotalDiscountAmountOnBill)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Round Off</span>

                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData?.RoundOff)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Total Payable Amount</span>

                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData?.TotalPayableAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Total Balance Amount</span>

                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData?.TotalBalanceAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Patient Advance Amt</span>

                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData?.PatientAdvanceAmt)}
                </span>
              </div>
            </div>
          </div>

          {/* Deposit Details */}

          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3">
            <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Deposit Details
            </h4>

            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-between">
                <span>Total Deposit</span>

                <span className="text-slate-900 font-bold">1,50,000.00</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Adjusted</span>

                <span className="text-slate-900 font-bold">1,41,000.00</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold text-emerald-600">
                <span>Balance Deposit</span>

                <span className="text-emerald-600 font-extrabold">9,000.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* FILTER POPUP */}
      {/* ═══════════════════════════════════════ */}

      {renderFilterPopup && (
        <FilterPopup
          isOpen={openFilterPopup}
          onClose={() => setOpenFilterPopup(false)}
          dataList={getIpdBillingSummaryLists}
          selectedFilteredData={selectedFilteredData}
          setSelectedFilteredData={setSelectedFilteredData}
        />
      )}

      {/* Loader */}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default IpdBillingSummary;
