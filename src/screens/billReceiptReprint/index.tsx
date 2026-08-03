import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CancelButton from "@/components/globalButtons/CancelButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { BillReceiptReprintItem } from "./types";

const BillReceiptReprint = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [billReceiptTableData, setBillReceiptTableData] = useState<BillReceiptReprintItem[]>([]);
  const [showTable, setShowTable] = useState<boolean>(false);
  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;
  const today = new Date().toISOString().split("T")[0];
  const [searchKey, setSearchKey] = useState("");
  const [originalBillReceiptTableData, setOriginalBillReceiptTableData] = useState<
    BillReceiptReprintItem[]
  >([]);

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const columns = useMemo<MRT_ColumnDef<BillReceiptReprintItem>[]>(
    () => [
      {
        accessorKey: "Type",
        header: "Type",
        minSize: 100,
      },
      {
        accessorKey: "BillDate",
        header: "Bill Date",
        minSize: 140,
      },
      {
        accessorKey: "ReceiptNo",
        header: "Receipt No",
        minSize: 150,
      },
      {
        accessorKey: "BillNo",
        header: "Bill No",
        minSize: 130,
      },
      {
        accessorKey: "UHID",
        header: "UHID",
        minSize: 130,
      },
      {
        accessorKey: "PatientName",
        header: "Patient Name",
        minSize: 220,
      },
      {
        accessorKey: "Age",
        header: "Age",
        minSize: 90,
      },
      {
        accessorKey: "NetAmount",
        header: "Net Amount",
        minSize: 130,

        Cell: ({ cell }) => (
          <span className="font-semibold text-green-600">₹ {cell.getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "Status",
        header: "Status",
        size: 120,

        Cell: ({ cell }) => {
          const status = cell.getValue<string>();

          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold
            ${status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {status}
            </span>
          );
        },
      },

      {
        id: "print",
        header: "Action",
        size: 40,

        Cell: ({ row }) => (
          <button
            className="w-9 h-9 rounded-full bg-blue-50 text-blue-600
          hover:bg-blue-600 hover:text-white duration-200"
          >
            <i className="fa-solid fa-print" />
          </button>
        ),
      },
    ],
    []
  );

  // const table = useMaterialReactTable({
  //   columns,
  //   data: billReceiptTableData,

  //   // ===========================
  //   // FEATURES
  //   // ===========================

  //   enableColumnOrdering: true,
  //   enableColumnResizing: true,
  //   enableColumnPinning: true,
  //   enableSorting: true,
  //   enableColumnFilters: true,
  //   enableGlobalFilter: true,
  //   enablePagination: true,
  //   enableStickyHeader: true,
  //   enableStickyFooter: true,
  //   enableDensityToggle: true,
  //   enableFullScreenToggle: true,
  //   enableColumnActions: true,
  //   enableHiding: true,
  //   enableRowNumbers: true,
  //   enableRowSelection: false,

  //   // ===========================
  //   // INITIAL STATE
  //   // ===========================

  //   initialState: {
  //     density: "compact",

  //     pagination: {
  //       pageIndex: 0,
  //       pageSize: 10,
  //     },

  //     showGlobalFilter: true,

  //     showColumnFilters: false,
  //   },

  //   // ===========================
  //   // SEARCH BOX
  //   // ===========================

  //   muiSearchTextFieldProps: {
  //     placeholder: "Search Patients...",
  //     variant: "outlined",
  //     size: "small",

  //     sx: {
  //       minWidth: 350,

  //       "& .MuiOutlinedInput-root": {
  //         borderRadius: "30px",
  //         background: "#fff",
  //       },
  //     },
  //   },

  //   // ===========================
  //   // PAPER
  //   // ===========================

  //   muiTablePaperProps: {
  //     elevation: 0,

  //     sx: {
  //       borderRadius: "14px",
  //       border: "1px solid #E5E7EB",
  //       overflow: "hidden",
  //     },
  //   },

  //   // ===========================
  //   // TABLE CONTAINER
  //   // ===========================

  //   muiTableContainerProps: {
  //     sx: {
  //       maxHeight: "65vh",
  //     },
  //   },

  //   // ===========================
  //   // HEADER
  //   // ===========================

  //   muiTableHeadCellProps: {
  //     sx: {
  //       backgroundColor: "#0F172A",
  //       color: "#fff",
  //       fontWeight: 700,
  //       fontSize: "14px",
  //       textAlign: "center",

  //       whiteSpace: "normal",
  //       wordBreak: "break-word",
  //       lineHeight: 1.3,

  //       "& .Mui-TableHeadCell-Content": {
  //         justifyContent: "center",
  //       },

  //       "& .MuiSvgIcon-root": {
  //         color: "#fff",
  //       },

  //       "& .MuiButtonBase-root": {
  //         color: "#fff",
  //       },
  //     },
  //   },

  //   // ===========================
  //   // BODY CELLS
  //   // ===========================

  //   muiTableBodyCellProps: {
  //     sx: {
  //       fontSize: "13px",

  //       borderBottom: "1px solid #E5E7EB",

  //       whiteSpace: "nowrap",
  //     },
  //   },

  //   // ===========================
  //   // ROWS
  //   // ===========================

  //   muiTableBodyRowProps: {
  //     hover: true,

  //     sx: {
  //       transition: "all .2s",

  //       "&:nth-of-type(even)": {
  //         background: "#FAFAFA",
  //       },

  //       "&:hover": {
  //         background: "#EFF6FF",
  //       },
  //     },
  //   },

  //   // ===========================
  //   // PAGINATION
  //   // ===========================

  //   muiPaginationProps: {
  //     color: "primary",
  //     shape: "rounded",
  //     variant: "outlined",
  //   },

  //   // ===========================
  //   // TOOLBAR
  //   // ===========================

  //   positionGlobalFilter: "left",

  //   // renderTopToolbarCustomActions: () => (
  //   //   <div className="flex items-center gap-2">
  //   //     <button className="rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700">
  //   //       Export Excel
  //   //     </button>

  //   //     <button className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
  //   //       Refresh
  //   //     </button>
  //   //   </div>
  //   // ),
  // });

  const table = useMaterialReactTable({
    columns,
    data: billReceiptTableData,

    // ===========================
    // FEATURES
    // ===========================

    enableTopToolbar: false,
    enableBottomToolbar: true,

    enableColumnOrdering: true,
    enableColumnResizing: true,
    enableColumnPinning: true,
    enableSorting: true,
    enableColumnFilters: true,
    enableGlobalFilter: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableColumnActions: true,
    enableHiding: true,
    enableRowNumbers: true,
    enableRowSelection: false,

    // ===========================
    // INITIAL STATE
    // ===========================

    initialState: {
      density: "compact",

      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },

      showColumnFilters: false,
    },

    // ===========================
    // TABLE PAPER
    // ===========================

    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        justifyContent: "space-between",
      },
    },

    // ===========================
    // TABLE CONTAINER
    // ===========================

    muiTableContainerProps: {
      sx: {
        maxHeight: "65vh",
        overflow: "auto",
        justifyContent: "left",
      },
    },

    // ===========================
    // HEADER
    // ===========================

    muiTableHeadCellProps: {
      align: "center",
      sx: {
        backgroundColor: "#0d4db3ff",
        justifyContent: "center",

        color: "#fff",
        fontWeight: 700,
        fontSize: "15px",
        height: 56,
        padding: "0 12px",
        borderRight: "1px solid #374151",

        "& .Mui-TableHeadCell-Content": {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "left",

          gap: "8px",
          width: "100%",
          height: "100%",
        },

        "& .Mui-TableHeadCell-Content-Labels": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          flexWrap: "nowrap",
          fontWeight: 700,
          color: "#fff",
        },

        "& .MuiSvgIcon-root": {
          color: "#CBD5E1",
          fontSize: "18px",
        },

        "& .MuiIconButton-root": {
          color: "#CBD5E1",
          padding: "4px",
        },
      },
    },

    // ===========================
    // BODY CELLS
    // ===========================

    muiTableBodyCellProps: {
      sx: {
        fontSize: "13px",
        py: 1.2,
        borderBottom: "1px solid #E5E7EB",
      },
    },

    // ===========================
    // BODY ROWS
    // ===========================

    muiTableBodyRowProps: {
      hover: true,
      sx: {
        transition: "0.2s",

        "&:nth-of-type(even)": {
          backgroundColor: "#FAFAFA",
        },

        "&:hover": {
          backgroundColor: "#EFF6FF",
        },
      },
    },

    // ===========================
    // PAGINATION
    // ===========================

    muiPaginationProps: {
      color: "primary",
      shape: "rounded",
      variant: "outlined",
      rowsPerPageOptions: [10, 20, 50, 100],
    },

    // ===========================
    // TABLE LAYOUT
    // ===========================

    layoutMode: "semantic",
    columnResizeMode: "onChange",

    displayColumnDefOptions: {
      "mrt-row-numbers": {
        size: 60,
        grow: false,
      },
    },
  });

  useEffect(() => {
    setQueryData(prev => ({
      ...prev,
      toDate: formatToDDMMYYYY(today),
      fromDate: formatToDDMMYYYY(today),
    }));
  }, [today]);

  const [queryData, setQueryData] = useState({
    branchId: branchId ?? 1,
    fromDate: "",
    toDate: "",
    uhid: "",
    name: "",
    type: 0,
    billNo: "",
    receiptNo: "",
  });
  const searchHandler = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BILL_RECEIPT_PRINT_DETAILS,
      {},
      { params: queryData },
      { component: "BillReceiptReprint" }
    );
    if (!resp?.result) {
      setBillReceiptTableData([]);
      setOriginalBillReceiptTableData([]);
      setShowTable(false);
      return;
    }
    setBillReceiptTableData(resp?.data);
    setOriginalBillReceiptTableData(resp?.data);
    setShowTable(true);
  };

  const clearHandler = () => {
    setQueryData({
      branchId: branchId ?? 1,
      fromDate: "",
      toDate: "",
      uhid: "",
      name: "",
      type: 0,
      billNo: "",
      receiptNo: "",
    });
  };

  //   input change handler
  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQueryData(prev => ({ ...prev, [name]: value.trim() }));
  };
  const dateChangeHandler = (name: string, value: string) => {
    setQueryData(prev => ({
      ...prev,
      [name]: formatToDDMMYYYY(value),
    }));
  };

  //   search key change handler
  const searchKeyChangeHandler = (e: ChangeEvent<HTMLInputElement>, headerName: string) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) {
      setBillReceiptTableData(originalBillReceiptTableData);
      return;
    }
    switch (headerName) {
      case "Type": {
        return setBillReceiptTableData(
          originalBillReceiptTableData.filter(b => b?.Type.toLowerCase().includes(value))
        );
      }
      case "Date": {
        return setBillReceiptTableData(
          originalBillReceiptTableData.filter(b => b?.BillDate.toLowerCase().includes(value))
        );
      }
      case "Receipt No": {
        return setBillReceiptTableData(
          originalBillReceiptTableData.filter(b => b?.ReceiptNo.toLowerCase().includes(value))
        );
      }
      case "Bill No": {
        return setBillReceiptTableData(
          originalBillReceiptTableData.filter(b => b?.BillNo.toLowerCase().includes(value))
        );
      }
      case "UHID": {
        return setBillReceiptTableData(
          originalBillReceiptTableData.filter(b => b?.UHID.toLowerCase().includes(value))
        );
      }
      case "Patient Name": {
        return setBillReceiptTableData(
          originalBillReceiptTableData.filter(b => b?.PatientName.toLowerCase().includes(value))
        );
      }
      case "Age": {
        return setBillReceiptTableData(
          originalBillReceiptTableData.filter(b => b?.Age.toLowerCase().includes(value))
        );
      }

      case "Net Amount": {
        return setBillReceiptTableData(
          originalBillReceiptTableData.filter(b =>
            String(b?.NetAmount).toLowerCase().includes(value)
          )
        );
      }
      case "Status": {
        return setBillReceiptTableData(
          originalBillReceiptTableData.filter(b => b?.Status.toLowerCase().includes(value))
        );
      }
    }
  };
  return (
    <div className="page-container">
      <h1 className="page-heading">Bill Receipt Reprint</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Bill Receipt Reprint</span>
      </nav>

      <div className="card">
        <form>
          <div className="form-grid-4">
            <InputField label="UHID">
              <input
                type="text"
                className="input-field"
                placeholder="Enter UHID "
                name="uhid"
                value={queryData?.uhid}
                onChange={inputChangeHandler}
              />
            </InputField>
            <InputField label="Patient Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter patient name "
                name="name"
                value={queryData?.name}
                onChange={inputChangeHandler}
              />
            </InputField>
            <InputField label="Type">
              <select
                className="input-field"
                name="type"
                value={queryData?.type}
                onChange={inputChangeHandler}
              >
                <option value="0">All</option>
                <option value="2">OPD</option>
                <option value="3">IPD</option>
              </select>
            </InputField>
            <InputField label="Bill Number">
              <input
                type="text"
                className="input-field"
                placeholder="Enter Bill Number "
                name="billNo"
                value={queryData?.billNo}
                onChange={inputChangeHandler}
              />
            </InputField>
            <InputField label="Receipt Number">
              <input
                type="text"
                className="input-field"
                placeholder="Enter Receipt Number"
                name="receiptNo"
                value={queryData?.receiptNo}
                onChange={inputChangeHandler}
              />
            </InputField>
            <InputField label="From Date">
              <CustomDateInput
                value={queryData?.fromDate}
                name="fromDate"
                onChange={(value: string) => dateChangeHandler("fromDate", value)}
              />
            </InputField>
            <InputField label="To Date">
              <CustomDateInput
                name="toDate"
                value={queryData?.toDate}
                onChange={(value: string) => dateChangeHandler("toDate", value)}
              />
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <SubmitButton
              label="Search"
              className="save-btn-color"
              type="submit"
              onClick={searchHandler}
            />
            <CancelButton
              label="Clear"
              className="cancel-btn-color"
              type="button"
              onClick={clearHandler}
            />
          </div>
        </form>
      </div>

      {/* table */}
      {!!billReceiptTableData && showTable ? (
        <div className="mt-3 rounded">
          <MaterialReactTable table={table} />
        </div>
      ) : (
        <></>
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};
export default BillReceiptReprint;
