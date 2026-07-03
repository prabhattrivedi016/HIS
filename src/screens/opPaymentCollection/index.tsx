import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { OpPaymentCollectionTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { BranchItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import ApproveCancelPopup from "../opDiscountApproval/components/ApproveCancelPopup";
import ViewDetailsPopup from "../opDiscountApproval/components/ViewDetailsPopup";
import { OPPaymentItem } from "./types";
const OPPaymentCollection = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchLists = useGetBranchList()?.branchList?.data ?? [];
  const branchId = Number(useContext(AuthContext)?.user?.branchId) ?? 1;
  const [selectedBranchId, setSelectedBranchId] = useState<number>(branchId);
  const today = new Date().toISOString().split("T")[0];
  const [queryValue, setQueryValue] = useState({ branchId, fromDate: today, toDate: today });
  const [popupType, setPopupType] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<OPPaymentItem | null>(null);
  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [viewItem, setViewItem] = useState<OPPaymentItem | null>(null);
  const [renderViewPopup, setRenderViewPopup] = useState<boolean>(false);
  const [openViewPopup, setOpenViewPopup] = useState<boolean>(false);

  const branchChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedBranchId(value);
    setQueryValue(prev => ({
      ...prev,
      branchId: value,
    }));
  };

  const fromDateChangeHandler = (value: string) => {
    setQueryValue(prev => ({
      ...prev,
      fromDate: value,
    }));
  };

  const toDateChangeHandler = (value: string) => {
    setQueryValue(prev => ({
      ...prev,
      toDate: value,
    }));
  };

  const getOpDiscountList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OPD_BOOKING_DETAILS_FOR_PAYMENT_COLLECTION,
      {},
      { params: queryValue },
      { component: "OPPaymentCollection" }
    );
    return resp?.data ?? [];
  };

  const { data: opDiscountList = [], refetch } = useQuery({
    queryKey: ["getOpDiscountList"],
    queryFn: getOpDiscountList,
    enabled: !!queryValue.branchId,
  });

  const searchHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    refetch?.();
  };

  //   cancel type handler
  const cancelHandler = (item: OPPaymentItem, popupType: string) => {
    if (!item) {
      setSelectedItem(null);
      setPopupType("");
      setRenderPopup(false);
      setOpenPopup(false);
      return;
    }
    setSelectedItem(item);
    setPopupType(popupType);
    setRenderPopup(true);
    setOpenPopup(true);
  };

  //   close handler
  const closeHandler = useCallback(() => {
    setOpenPopup(false);
    setTimeout(() => {
      setRenderPopup(false);
      setSelectedItem(null);
      setPopupType("");
    }, 300);
  }, []);

  //   view details handler
  const viewHandler = (item: OPPaymentItem) => {
    if (!item) return;
    setViewItem(item);
    setRenderViewPopup(true);
    setOpenViewPopup(true);
  };

  //   close view popup handler
  const closeViewHandler = useCallback(() => {
    setOpenViewPopup(false);
    setTimeout(() => {
      setRenderViewPopup(false);
      setViewItem(null);
    }, 300);
  }, []);

  const popupSuccessHandler = useCallback(() => {
    void refetch?.();
  }, [refetch]);

  return (
    <div className="page-container">
      <h1 className="page-heading">OP Payment Collection</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>OP Payment Collection</span>
      </nav>

      {/* form  */}
      <div className="card">
        <form onSubmit={searchHandler}>
          <div className="form-grid-4">
            <InputField label="Branch" required>
              <select
                className="input-field"
                value={selectedBranchId}
                onChange={branchChangeHandler}
                name="branchId"
              >
                <option>--Select--</option>
                {branchLists.map((b: BranchItem) => (
                  <option key={b?.branchId} value={b?.branchId}>
                    {b?.branchName}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField label="From Date">
              <CustomDateInput value={queryValue?.fromDate} onChange={fromDateChangeHandler} />
            </InputField>
            <InputField label="To Date">
              <CustomDateInput value={queryValue?.toDate} onChange={toDateChangeHandler} />
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {"Search"}
            </button>
          </div>
        </form>
      </div>
      {/* table */}

      <div className="table-container mt-1 ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-120">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {OpPaymentCollectionTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {opDiscountList?.length === 0 && (
                  <tr>
                    <td colSpan={OpPaymentCollectionTableHeader.length} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {opDiscountList.map((item: OPPaymentItem, idx: number) => (
                  <tr key={item?.BookingId} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.TokenNo || "-"}</td>
                    <td className="table-td">{item?.UHID || "-"}</td>
                    <td className="table-td">{item?.PatientName || "-"}</td>
                    <td className="table-td">{item?.Age || "-"}</td>{" "}
                    <td className="table-td">{item?.Gender || "-"}</td>
                    <td className="table-td">{item?.CorporateName || "-"}</td>
                    <td className="table-td">{item?.TotalApprovedDiscountPerOnBill || "-"}</td>
                    <td className="table-td">{item?.TotalBillAmount || "-"}</td>
                    <td className="table-td">
                      <button
                        type="button"
                        onClick={() => viewHandler(item)}
                        aria-label="View details"
                      >
                        <i className="fa-solid fa-eye text-xl icon-color-button" />
                      </button>
                    </td>
                    {item?.IsPaymentCollected !== 1 ? (
                      <td className="table-td">
                        <button type="button" className="save-btn" aria-label="Collect payment">
                          Collect Payment
                        </button>
                      </td>
                    ) : (
                      <td className="table-td"></td>
                    )}
                    {item?.IsPaymentCollected !== 1 && item?.IsCancel === 0 ? (
                      <td className="table-td">
                        <button
                          className="delete-btn"
                          onClick={() => cancelHandler(item, "cancel")}
                        >
                          Cancel
                        </button>
                      </td>
                    ) : (
                      <td className="table-td"></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!!renderPopup && (
        <ApproveCancelPopup
          isOpen={openPopup}
          popupType={popupType}
          item={selectedItem}
          onClose={closeHandler}
          onSuccess={popupSuccessHandler}
        />
      )}

      {!!renderViewPopup && (
        <ViewDetailsPopup isOpen={openViewPopup} item={viewItem} onClose={closeViewHandler} />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default OPPaymentCollection;
