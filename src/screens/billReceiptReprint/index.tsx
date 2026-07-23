import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CancelButton from "@/components/globalButtons/CancelButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import { billReceiptReprintTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { ChangeEvent, useContext, useEffect, useState } from "react";
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

    console.log(name, value);
  };
  const dateChangeHandler = (name: string, value: string) => {
    setQueryData(prev => ({
      ...prev,
      [name]: formatToDDMMYYYY(value),
    }));
  };

  //   search key change handler
  const searchKeyChangeHandler = (e: ChangeEvent<HTMLInputElement>, headerName: string) => {
    console.log(headerName, e.target.value);
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
        <div className="table-container mt-1 ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-110 lg:max-h-110">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {billReceiptReprintTableHeader.map((header, index) => (
                      <th key={index} className="table-th ">
                        {header !== "#" && header !== "Re-Print" && header !== "Card Print" ? (
                          <div className="flex flex-col">
                            <span>{header} </span>
                            <div className="relative w-30">
                              <input
                                type="text"
                                className="input-field w-full h-8 pl-8 pr-1"
                                onChange={e => searchKeyChangeHandler(e, header)}
                                placeholder="Search..."
                              />
                            </div>
                          </div>
                        ) : (
                          <span>{header}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {billReceiptTableData.length === 0 ? (
                    <tr>
                      <td colSpan={billReceiptReprintTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    billReceiptTableData.map((item: BillReceiptReprintItem, idx: number) => (
                      <tr key={item?.VisitId ?? idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.Type ?? "-"}</td>
                        <td className="table-td">{item?.BillDate ?? "-"}</td>
                        <td className="table-td">{item?.ReceiptNo ?? "-"}</td>

                        <td className="table-td">{item?.BillNo ?? "-"}</td>
                        <td className="table-td">{item?.UHID ?? "-"}</td>
                        <td className="table-td">{item?.PatientName ?? "-"}</td>
                        <td className="table-td">{item?.Age ?? "-"}</td>
                        <td className="table-td">{item?.NetAmount ?? "-"}</td>

                        <td
                          className={`table-td ${
                            item.Status === "Active" ? "active-text" : "inactive-text"
                          }`}
                        >
                          {item.Status === "Active" ? "Active" : "Inactive"}
                        </td>

                        <td className="table-td">
                          <button type="button">
                            <i className="fa-solid fa-print icon-color-button" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};
export default BillReceiptReprint;
