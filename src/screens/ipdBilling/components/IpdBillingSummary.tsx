import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import BaseTable from "@/components/shared/BaseTable";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import useGetPreDefinedQueryResult from "@/hooks/useGetPreDefinedQueryResult";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { MRT_ColumnDef, MRT_RowSelectionState } from "material-react-table";
import { useCallback, useContext, useMemo, useState } from "react";
import {
  BillFilterItem,
  IpdPatientItem,
  IpdSummaryBillingTableList,
  PaymentListItem,
} from "../types";
import DiscountAmountPopup from "./DiscountAmountPopup";
import DiscountPercentagePopup from "./DiscountPercentagePopup";
import FilterPopup from "./FilterPopup";
import PackagePopup from "./PackagePopup";
import QuantityUpdatePopup from "./QuantityUpdatePopup";
import RatePopup from "./RatePopup";
import RemovePopup from "./RemovePopup";

type TableView = "billing" | "department";

const IpdBillingSummary = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();

  const branchId = useContext(BranchContext)?.branchId ?? 1;

  const [selectedBillId, setSelectedBillId] = useState<number>(0);

  const [selectedTable, setSelectedTable] = useState<TableView>("billing");

  const [selectedFilteredData, setSelectedFilteredData] = useState<IpdSummaryBillingTableList[]>(
    []
  );

  const [groupBy, setGroupBy] = useState<string[]>([]);

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const [openFilterPopup, setOpenFilterPopup] = useState(false);

  const [renderFilterPopup, setRenderFilterPopup] = useState(false);

  const [openQuantityUpdatePopup, setOpenQuantityUpdatePopup] = useState(false);
  const [renderQuantityUpdatePopup, setRenderQuantityUpdatePopup] = useState(false);

  const [openRateUpdatePopup, setOpenRateUpdatePopup] = useState(false);
  const [renderRateUpdatePopup, setRenderRateUpdatePopup] = useState(false);

  const [openDiscountPercentagePopup, setOpenDiscountPercentagePopup] = useState(false);
  const [renderDiscountPercentagePopup, setRenderDiscountPercentagePopup] = useState(false);

  const [openDiscountAmountPopup, setOpenDiscountAmountPopup] = useState(false);
  const [renderDiscountAmountPopup, setRenderDiscountAmountPopup] = useState(false);

  const [openPackagePopup, setOpenPackagePopup] = useState(false);
  const [renderPackagePopup, setRenderPackagePopup] = useState(false);
  const [openRemovePopup, setOpenRemovePopup] = useState(false);
  const [renderRemovePopup, setRenderRemovePopup] = useState(false);

  // Payment History

  const paymentSummaryHistory =
    useGetPreDefinedQueryResult({
      queryName: "GetReceiptListByVisitId",
      filter1: patient?.VisitId,
    })?.predefinedQueryResult ?? [];

  //  bill summary details

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

  const { data: ipdBillingSummaryData = {}, refetch } = useQuery({
    queryKey: ["getBillSummaryDetails", patient],
    queryFn: getBillSummaryDetails,
  });

  // IPD Billing Summary

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

  const {
    data: getIpdBillingSummaryLists = [],
    isLoading,
    refetch: refetchIpdBillingSummaryLists,
  } = useQuery({
    queryKey: ["ipdBillingSummaryLists", branchId, patient?.VisitId],
    queryFn: getIpdBillingSummaryDetails,
  });
  console.log("getIpdBillingSummaryLists:", getIpdBillingSummaryLists);

  // Bill Filter Values

  const getFilterValue =
    useGetPreDefinedQueryResult({
      queryName: "GetIPDBillNoListByVisitId",
      filter1: patient?.VisitId,
    })?.predefinedQueryResult ?? [];

  // Currency Formatter
  const formatCurrency = useCallback((val: number | string | undefined | null) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(val ?? 0));
  }, []);

  const renderGroupedCellWithTotal = useCallback(
    ({ cell, row }: { cell: any; row: any }) => {
      const groupTotal = row.leafRows.reduce(
        (sum: number, leaf: any) => sum + (Number(leaf.original?.NetAmt) || 0),
        0
      );
      return (
        <span className="font-semibold text-blue-950">
          {String(cell.getValue() ?? "")} ({row.subRows?.length ?? 0} items — Total: ₹
          {formatCurrency(groupTotal)})
        </span>
      );
    },
    [formatCurrency]
  );

  // Table Columns

  const columns = useMemo<MRT_ColumnDef<IpdSummaryBillingTableList>[]>(
    () => [
      {
        accessorKey: "BillingDate",
        header: "Billing Date",
        minSize: 100,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },

      {
        accessorKey: "CategoryName",
        header: "Category",
        minSize: 130,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },

      {
        accessorKey: "SubCategoryName",
        header: "Sub Category",
        minSize: 120,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },

      {
        accessorKey: "SubSubCategoryName",
        header: "Sub Sub Category",
        minSize: 130,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },

      {
        id: "PrintGroupName",
        accessorKey: "SubSubCategoryName",
        header: "Print Group Name",
        minSize: 130,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },

      {
        accessorKey: "CreatedOnWithTime",
        header: "Date Time",
        minSize: 200,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },

      {
        accessorKey: "ServiceName",
        header: "Service / Item",
        minSize: 200,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },

      {
        accessorKey: "Code",
        header: "Code",
        minSize: 100,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },

      {
        accessorKey: "DoctorName",
        header: "Doctor",
        minSize: 150,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },

      {
        accessorKey: "IsUnderPackage",
        header: "Is Under Package",
        minSize: 150,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
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
        aggregationFn: "sum",
        AggregatedCell: ({ cell }) => (
          <span className="font-semibold text-blue-900">{cell.getValue<number>() ?? 0}</span>
        ),
      },

      {
        accessorKey: "Rate",
        header: "Rate",
        minSize: 100,
        enableGrouping: true,
        Cell: ({ cell }) => formatCurrency(cell.getValue<number>()),
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
        Cell: ({ cell }) => formatCurrency(cell.getValue<number>()),
        aggregationFn: "sum",
        AggregatedCell: ({ cell }) => (
          <span className="font-semibold text-blue-900">
            {formatCurrency(cell.getValue<number>())}
          </span>
        ),
      },

      {
        accessorKey: "NetAmt",
        header: "Amount",
        minSize: 100,
        enableGrouping: true,
        Cell: ({ cell }) => formatCurrency(cell.getValue<number>()),
        aggregationFn: "sum",
        AggregatedCell: ({ cell }) => (
          <span className="font-bold text-blue-900">
            ₹{formatCurrency(cell.getValue<number>())}
          </span>
        ),
      },

      {
        accessorKey: "UserName",
        header: "User Name",
        minSize: 100,
        enableGrouping: true,
        GroupedCell: renderGroupedCellWithTotal,
      },
    ],
    [formatCurrency, renderGroupedCellWithTotal]
  );

  // Filter Billing Data

  const filteredBillingLists = useMemo(() => {
    if (Number(selectedBillId) === 0) {
      return getIpdBillingSummaryLists;
    }

    return getIpdBillingSummaryLists.filter(
      (item: IpdSummaryBillingTableList) => String(item?.BillId) === String(selectedBillId)
    );
  }, [getIpdBillingSummaryLists, selectedBillId]);

  // Final Data Shown In Table

  const tableData = useMemo(() => {
    return selectedFilteredData.length > 0 ? selectedFilteredData : filteredBillingLists;
  }, [selectedFilteredData, filteredBillingLists]);

  // COMPLETE SELECTED ROW OBJECTS

  const selectedItems = useMemo<IpdSummaryBillingTableList[]>(() => {
    return tableData.filter((item: IpdSummaryBillingTableList) => {
      const rowId = String(item?.FTDId);

      return Boolean(rowSelection[rowId]);
    });
  }, [tableData, rowSelection]);

  console.log("rowSelection:", rowSelection);

  console.log("Selected complete rows:", selectedItems);

  // Filter Popup

  const handleFilterClick = () => {
    setOpenFilterPopup(true);
    setRenderFilterPopup(true);
  };

  // quantity update handler

  const quantityUpdateHandler = () => {
    if (!selectedItems || selectedItems.length === 0) {
      showWarning("Please select at least one item to update the quantity.");
      return;
    }
    setOpenQuantityUpdatePopup(true);
    setRenderQuantityUpdatePopup(true);
  };

  // rate update handler
  const rateUpdateHandler = () => {
    if (!selectedItems || selectedItems.length === 0) {
      showWarning("Please select at least one item to update the rate.");
      return;
    }
    setOpenRateUpdatePopup(true);
    setRenderRateUpdatePopup(true);
  };

  // discount percentage update handler
  const discountPercentageUpdateHandler = () => {
    if (!selectedItems || selectedItems.length === 0) {
      showWarning("Please select at least one item to update the discount percentage.");
      return;
    }
    setOpenDiscountPercentagePopup(true);
    setRenderDiscountPercentagePopup(true);
  };

  // discount amount update handler
  const discountAmountUpdateHandler = () => {
    if (!selectedItems || selectedItems.length === 0) {
      showWarning("Please select at least one item to update the discount amount.");
      return;
    }
    setOpenDiscountAmountPopup(true);
    setRenderDiscountAmountPopup(true);
  };

  //create payload
  const createPayload = () => {
    return {
      visitId: selectedItems?.[0]?.VisitId!,
      ftdIdList: selectedItems!.map(item => item?.FTDId).join(","),
      isNonPayable: 1,
    };
  };

  // non payable handler
  const nonPayableHandler = async () => {
    if (!selectedItems || selectedItems.length === 0) {
      showWarning("Please select at least one item to update the non-payable status.");
      return;
    }
    const payload = createPayload();

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_IPD_SERVICE_CORPORATE_NON_PAYABLE,
      payload,
      {},
      { component: "IpdBillingSummary" }
    );
    if (!resp?.result) {
      showError(resp?.message || "Failed to update non payable.");
      return;
    }
    showSuccess(resp?.message || "Non payable updated successfully.");
    refetch?.();
  };

  //create payable payload
  const createPayablePayload = () => {
    return {
      visitId: selectedItems?.[0]?.VisitId!,
      ftdIdList: selectedItems!.map(item => item?.FTDId).join(","),
      isNonPayable: 0,
    };
  };

  //  payable handler
  const payableHandler = async () => {
    if (!selectedItems || selectedItems.length === 0) {
      showWarning("Please select at least one item to update the payable status.");
      return;
    }
    const payload = createPayablePayload();

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_IPD_SERVICE_CORPORATE_NON_PAYABLE,
      payload,
      {},
      { component: "IpdBillingSummary" }
    );
    if (!resp?.result) {
      showError(resp?.message || "Failed to update payable.");
      return;
    }
    showSuccess(resp?.message || "Payable updated successfully.");
    refetch?.();
  };

  // package handler
  const packageHandler = async () => {
    if (!selectedItems || selectedItems.length === 0) {
      showWarning("Please select at least one item to update the package.");
      return;
    }
    setOpenPackagePopup(true);
    setRenderPackagePopup(true);
  };

  const removeHandler = () => {
    if (!selectedItems.length) {
      showWarning("Please select at least one item to remove.");
      return;
    }

    setOpenRemovePopup(true);
    setRenderRemovePopup(true);
  };

  return (
    <div className="w-full flex flex-col gap-2 p-1">
      {/* MAIN GRID */}

      <div className="grid grid-cols-12 gap-2 items-start">
        {/* LEFT COLUMN */}

        <div className="col-span-12 lg:col-span-9 flex flex-col gap-2">
          {/* Billing Items Card */}

          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-4">
            {/* Header */}

            <div className="flex items-center justify-between gap-6 px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tableView"
                  value="billing"
                  checked={selectedTable === "billing"}
                  onChange={() => setSelectedTable("billing")}
                />

                <span className="text-md font-bold ">Billing Items</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tableView"
                  value="department"
                  checked={selectedTable === "department"}
                  onChange={() => setSelectedTable("department")}
                />

                <span className="text-md font-bold">Department Details</span>
              </label>

              {/* Bill Filter */}

              {selectedTable === "billing" ? (
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
              ) : (
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
              )}
            </div>

            {/* BILLING TABLE */}

            {selectedTable === "billing" && (
              <>
                <BaseTable
                  columns={columns}
                  data={tableData}
                  showIndex
                  enableRowSelection={row => Number(row.IsSupplementaryBill) === 0}
                  rowSelection={rowSelection}
                  onRowSelectionChange={setRowSelection}
                  getRowId={row => String(row.FTDId)}
                  enableGrouping
                  groupBy={groupBy}
                  onGroupingChange={setGroupBy}
                  enableGroupingOnHeaderDoubleClick
                />

                <div className="flex items-center justify-end gap-2 flex-wrap overflow-auto">
                  <button className="save-btn" onClick={handleFilterClick}>
                    Filter
                  </button>

                  <button className="save-btn" onClick={rateUpdateHandler}>
                    Rate
                  </button>

                  <button className="save-btn" onClick={quantityUpdateHandler}>
                    Quantity
                  </button>

                  <button className="save-btn" onClick={discountPercentageUpdateHandler}>
                    Disc(%)
                  </button>

                  <button className="save-btn" onClick={discountAmountUpdateHandler}>
                    Disc(Amt)
                  </button>

                  <button className="save-btn" onClick={nonPayableHandler}>
                    Non Payable
                  </button>

                  <button className="save-btn" onClick={payableHandler}>
                    Payable
                  </button>

                  <button className="save-btn" onClick={packageHandler}>
                    Package
                  </button>

                  <button className="save-btn" onClick={removeHandler}>
                    Remove
                  </button>
                </div>
              </>
            )}
            {selectedTable === "department" && (
              <div className="bg-slate-50 rounded-xl p-4 min-h-[400px] flex flex-col items-center justify-center">
                <p className="text-slate-500 text-lg">Department View</p>
              </div>
            )}
          </div>

          {/* PAYMENT HISTORY */}

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

                          <th className="table-th">Receipt No</th>

                          <th className="table-th">Amount</th>

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

                            <td className="table-td">{item?.ReceiptNo || "-"}</td>

                            <td className="table-td">{item?.Amount || "-"}</td>

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

        {/* RIGHT COLUMN */}

        <div className="col-span-10 lg:col-span-3 flex flex-col gap-2">
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

      {/* FILTER POPUP */}

      {renderFilterPopup && (
        <FilterPopup
          isOpen={openFilterPopup}
          onClose={() => setOpenFilterPopup(false)}
          dataList={getIpdBillingSummaryLists}
          selectedFilteredData={selectedFilteredData}
          setSelectedFilteredData={setSelectedFilteredData}
        />
      )}

      {/* quantity update */}

      {renderQuantityUpdatePopup && (
        <QuantityUpdatePopup
          isOpen={openQuantityUpdatePopup}
          onClose={() => setOpenQuantityUpdatePopup(false)}
          selectedItems={selectedItems}
          refetch={refetchIpdBillingSummaryLists}
        />
      )}

      {/* rate update */}

      {renderRateUpdatePopup && (
        <RatePopup
          isOpen={openRateUpdatePopup}
          onClose={() => setOpenRateUpdatePopup(false)}
          selectedItems={selectedItems}
          refetch={refetchIpdBillingSummaryLists}
        />
      )}

      {/* discount percentage update */}

      {renderDiscountPercentagePopup && (
        <DiscountPercentagePopup
          isOpen={openDiscountPercentagePopup}
          onClose={() => setOpenDiscountPercentagePopup(false)}
          selectedItems={selectedItems}
          refetch={refetchIpdBillingSummaryLists}
        />
      )}

      {/* discount amount update */}

      {renderDiscountAmountPopup && (
        <DiscountAmountPopup
          isOpen={openDiscountAmountPopup}
          onClose={() => setOpenDiscountAmountPopup(false)}
          selectedItems={selectedItems}
          refetch={refetchIpdBillingSummaryLists}
        />
      )}

      {/* package update */}

      {renderPackagePopup && (
        <PackagePopup
          isOpen={openPackagePopup}
          onClose={() => setOpenPackagePopup(false)}
          selectedItems={selectedItems}
          refetch={refetchIpdBillingSummaryLists}
        />
      )}

      {/* remove items */}

      {renderRemovePopup && (
        <RemovePopup
          isOpen={openRemovePopup}
          onClose={() => setOpenRemovePopup(false)}
          selectedItems={selectedItems}
          refetch={refetchIpdBillingSummaryLists}
          onSuccess={() => setRowSelection({})}
        />
      )}

      {/* Loader */}

      {(loading || isLoading) && <CustomLoader isLoading={loading || isLoading} />}
    </div>
  );
};

export default IpdBillingSummary;
