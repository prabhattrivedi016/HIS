import CentralPopup from "@/components/centralPopup";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CancelButton from "@/components/globalButtons/CancelButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import { filterBillTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showWarning } from "@/utils/alert";
import { formatToDDMMYYYY, toInputDate } from "@/utils/dateConvertHandler";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { WriteOffBillItem } from "../types";

const FilterBillPopup = ({
  isOpen,
  onClose,
  setSelectedBill,
}: {
  isOpen: boolean;
  onClose: () => void;
  setSelectedBill: Dispatch<SetStateAction<WriteOffBillItem | null>>;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const today = formatToDDMMYYYY(new Date().toISOString().split("T")[0]);
  const [billItemList, setBillItemList] = useState<WriteOffBillItem[]>([]);
  const [showTable, setShowTable] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState({
    fromDate: today,
    toDate: today,
    billNo: "",
    uhid: "",
    patientName: "",
    typeId: 0,
  });

  useEffect(() => {
    if (isOpen) {
      getBillDetails();
    }
  }, [isOpen]);

  const getBillDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BILL_FOR_WRITE_OFF,
      {},
      { params: searchQuery },
      { component: "WriteOff" }
    );
    if (!resp?.result) {
      setShowTable(false);
      showWarning(resp?.message ?? "No bill details found");
      return;
    }
    setShowTable(true);
    setBillItemList(resp?.data ?? []);
  };

  //   input change handler
  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setSearchQuery(prev => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const dateChangeHandler = (name: string, value: string) => {
    setSearchQuery(prev => ({
      ...prev,
      [name]: formatToDDMMYYYY(value),
    }));
  };

  //   search handler
  const searchHandler = async () => {
    await getBillDetails();
  };

  //   clear handler
  const clearHandler = () => {
    setSearchQuery({
      fromDate: today,
      toDate: today,
      billNo: "",
      uhid: "",
      patientName: "",
      typeId: 0,
    });
  };

  //   bill select handler
  const billSelectHandler = (item: WriteOffBillItem) => {
    setSelectedBill(item);
    onClose?.();
  };

  //   form submit
  const formSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await getBillDetails();
  };
  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Popup" className="lg:min-w-300">
      <div>
        <form onSubmit={formSubmitHandler}>
          <div className="form-grid-6">
            <InputField label="From Date">
              <CustomDateInput
                value={toInputDate(searchQuery.fromDate)}
                onChange={(value: string) => dateChangeHandler("fromDate", value)}
              />
            </InputField>
            <InputField label="To Date">
              <CustomDateInput
                value={toInputDate(searchQuery.toDate)}
                onChange={(value: string) => dateChangeHandler("toDate", value)}
              />
            </InputField>
            <InputField label="Bill No.">
              <input
                type="text"
                placeholder="Enter bill no."
                className="input-field"
                name="billNo"
                value={searchQuery.billNo}
                onChange={inputChangeHandler}
              />
            </InputField>
            <InputField label="UHID">
              <input
                type="text"
                className="input-field"
                placeholder="Enter UHID"
                name="uhid"
                value={searchQuery.uhid}
                onChange={inputChangeHandler}
              />
            </InputField>
            <InputField label="Patient Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter patient name"
                name="patientName"
                value={searchQuery.patientName}
                onChange={inputChangeHandler}
              />
            </InputField>
            <InputField label="Type">
              <select
                className="input-field"
                name="type"
                value={searchQuery.typeId}
                onChange={inputChangeHandler}
              >
                <option value={0}>Both</option>
                <option value={1}>OPD</option>
                <option value={2}>IPD</option>
              </select>
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
        {/* table */}
        {!!billItemList && showTable ? (
          <div className="table-container mt-1 ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-110 lg:max-h-110">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {filterBillTableHeader.map((header, index) => (
                        <th key={index} className="table-th ">
                          <span>{header}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {billItemList.length === 0 ? (
                      <tr>
                        <td colSpan={filterBillTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      billItemList.map((item: WriteOffBillItem, idx: number) => (
                        <tr
                          key={idx}
                          className="table-row cursor-pointer active:scale-99"
                          onDoubleClick={() => billSelectHandler(item)}
                        >
                          <td className="table-td">{item?.VisitId ?? "-"}</td>
                          <td className="table-td">{item?.PatientName ?? "-"}</td>
                          <td className="table-td">{item?.UHID ?? "-"}</td>

                          <td className="table-td">{item?.BillNo ?? "-"}</td>
                          <td className="table-td">{item?.BillDate ?? "-"}</td>
                          <td className="table-td">{item?.TotalBillAmount ?? "-"}</td>
                          <td className="table-td">{item?.TotalPaidAmount ?? "-"}</td>
                          <td className="table-td">{item?.Type ?? "-"}</td>
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
    </CentralPopup>
  );
};

export default FilterBillPopup;
