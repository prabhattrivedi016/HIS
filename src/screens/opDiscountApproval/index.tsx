import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { OpDiscountApprovalTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { BranchItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import ApproveCancelPopup from "./components/ApproveCancelPopup";
import { OPDiscountItem } from "./types";
const OPDiscountApproval = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchLists = useGetBranchList()?.branchList?.data ?? [];
  const branchId = Number(useContext(AuthContext)?.user?.branchId) ?? 1;
  const [selectedBranchId, setSelectedBranchId] = useState<number>(branchId);
  const today = new Date().toISOString().split("T")[0];
  const [queryValue, setQueryValue] = useState({ branchId, fromDate: today, toDate: today });
  const [popupType, setPopupType] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<OPDiscountItem | null>(null);
  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);

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
      ENDPOINTS.GET_OPD_BOOKING_DETAILS_FOR_DISCOUNT_APPROVAL,
      {},
      { params: queryValue },
      { component: "OPDiscountApproval" }
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

  //   approve type handler
  const approveHandler = (item: OPDiscountItem, popupType: string) => {
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

  //   cancel type handler
  const cancelHandler = (item: OPDiscountItem, popupType: string) => {
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

  const popupSuccessHandler = useCallback(() => {
    void refetch?.();
  }, [refetch]);

  return (
    <div className="page-container">
      <h1 className="page-heading">OP Discount Approval</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>OP Discount Approval</span>
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
                  {OpDiscountApprovalTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {opDiscountList?.length === 0 && (
                  <tr>
                    <td colSpan={OpDiscountApprovalTableHeader.length} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {opDiscountList.map((item: OPDiscountItem, idx: number) => (
                  <tr key={item?.BookingId} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.PatientName || "-"}</td>
                    {/* <td
                      className={`table-td ${
                        Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                    </td> */}
                    <td className="table-td">{item?.Age || "-"}</td>{" "}
                    <td className="table-td">{item?.Gender || "-"}</td>
                    {/* <td className="table-td">{item?.Gender || "-"}</td>{" "} */}
                    <td className="table-td">{item?.CorporateName || "-"}</td>
                    <td className="table-td">{item?.TotalBillAmount || "-"}</td>
                    <td
                      className={`table-td ${
                        Number(item?.IsPaymentCollected) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item?.IsPaymentCollected) === 1 ? "Yes" : "No"}
                    </td>
                    <td
                      className={`table-td ${
                        Number(item?.IsCancel) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item?.IsCancel) === 1 ? "Yes" : "No"}
                    </td>
                    <td className="table-td">
                      {item?.IsDiscountApproved === 0 ? (
                        <button
                          className="reset-btn"
                          onClick={() => approveHandler(item, "approve")}
                        >
                          Approve
                        </button>
                      ) : (
                        <></>
                      )}
                    </td>
                    <td className="table-td">
                      {item?.IsCancel === 0 ? (
                        <button
                          className="delete-btn"
                          onClick={() => cancelHandler(item, "cancel")}
                        >
                          Cancel
                        </button>
                      ) : (
                        <></>
                      )}
                    </td>
                    {/*   <td className="table-td">{item?.lastModifiedBy || "-"}</td>
                    <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                    <td className="table-td" onClick={() => editHandler(item)}>
                      <i className="fa-solid fa-edit text-xl icon-color-button" />
                    </td> */}
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

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default OPDiscountApproval;

/*
 {
            "BookingId": 6,
            "TokenNo": null,
            "BranchId": 1,
            "PatientId": 44,
            "UHID": "GWS/00000032",
            "PatientName": "MR. SHUBHAM KUMAR MAURYA",
            "Age": "28Y 0M 0D",
            "Gender": "MALE",
            "CorporateId": 1,
            "CorporateName": "CASH",
            "InsuranceCompanyId": 0,
            "ReferDoctorId": null,
            "TotalBillAmount": 111.000000,
            "TotalDiscountPerOnBill": 9.010000,
            "TotalDiscountAmountOnBill": 10.000000,
            "RoundOff": 0.000000,
            "TotalPatientPayableAmount": 101.000000,
            "PolicyNo": null,
            "PolicyCardNo": null,
            "ExpiryDate": null,
            "CardHolder": null,
            "ReferalNo": null,
            "ReferalDate": null,
            "IsPaymentCollected": 0,
            "IsDiscountApprovalRequired": 1,
            "IsDiscountApproved": 0,
            "IsLevel1Approve": null,
            "Level1ApproveId": null,
            "Level1ApproveOn": null,
            "IsLevel2Approve": null,
            "Level2ApproveId": null,
            "Level2ApproveOn": null,
            "IsLevel3Approve": null,
            "Level3ApproveId": null,
            "Level3ApproveOn": null,
            "IsLevel4Approve": null,
            "Level4ApproveId": null,
            "Level4ApproveOn": null,
            "IsCancel": 0,
            "CancelBy": null,
            "CancelOn": null,
            "CancelReason": null,
            "CreatedBy": "Prabhat  Trivedi (Prabhat)",
            "CreatedOn": "29-06-2026",
            "LastModifiedBy": null,
            "LastModifiedOn": null
        } */
