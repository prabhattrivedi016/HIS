import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CancelButton from "@/components/globalButtons/CancelButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import BaseTable from "@/components/shared/BaseTable";
import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { MRT_ColumnDef } from "material-react-table";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { BillReceiptReprintItem } from "./types";

const BillReceiptReprint = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [groupBy, setGroupBy] = useState<string[]>([]);

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
        enableGrouping: true,
      },

      {
        accessorKey: "BillDate",
        header: "Bill Date",
        minSize: 130,
        enableGrouping: true,
      },

      {
        accessorKey: "ReceiptNo",
        header: "Receipt No",
        minSize: 130,
        enableGrouping: true,
      },

      {
        accessorKey: "BillNo",
        header: "Bill No",
        minSize: 110,
        enableGrouping: true,
      },

      {
        accessorKey: "UHID",
        header: "UHID",
        minSize: 130,
        enableGrouping: true,
      },

      {
        accessorKey: "PatientName",
        header: "Patient Name",
        minSize: 200,
        enableGrouping: true,
      },

      {
        accessorKey: "Age",
        header: "Age",
        minSize: 80,
        enableGrouping: true,
      },

      {
        accessorKey: "NetAmount",
        header: "Net Amount",
        minSize: 120,
        enableGrouping: true,

        Cell: ({ cell }) => (
          <span className="font-semibold text-green-600">₹ {cell.getValue<number>()}</span>
        ),
      },

      {
        accessorKey: "Status",
        header: "Status",
        minSize: 100,
        enableGrouping: true,

        Cell: ({ cell }) => {
          const status = cell.getValue<string>();

          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {status}
            </span>
          );
        },
      },

      {
        id: "action",
        header: "Action",
        size: 70,

        enableSorting: false,
        enableColumnOrdering: false,
        enableGrouping: false,

        Cell: () => (
          <button
            className="
            w-8
            h-8
            rounded-full
            bg-blue-50
            text-blue-600
            hover:bg-blue-600
            hover:text-white
            duration-200
            flex
            items-center
            justify-center
            mx-auto
          "
            title="Print"
          >
            <i className="fa-solid fa-print text-sm" />
          </button>
        ),
      },
    ],
    []
  );

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
        <div className="mt-1 rounded">
          <BaseTable
            columns={columns}
            data={billReceiptTableData}
            showIndex
            enableGrouping
            groupBy={groupBy}
            onGroupingChange={setGroupBy}
            enableGroupingOnHeaderDoubleClick
          />
        </div>
      ) : (
        <></>
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};
export default BillReceiptReprint;
