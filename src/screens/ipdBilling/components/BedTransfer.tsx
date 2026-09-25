import { getUpdatedIpdPatientDetails } from "@/api/globalApiCall";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import { IpdPatientDetailsContext } from "@/context/IpdPatientDetailsContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { BillingTypeItem, IpdPatientItem, PreviousBedListItem, RoomItem } from "../types";

const BedTransfer = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = useContext(BranchContext)?.branchId ?? 1;

  const { setUpdatedIpdPatientDetails } = useContext(IpdPatientDetailsContext)!;

  const [billingTypeList, setBillingTypeList] = useState<BillingTypeItem[]>([]);
  const [availableBedStatus, setAvailableBedStatus] = useState({
    status: "",
    isResult: "",
  });

  const [queryValues, setQueryValues] = useState<{
    billingTypeId: number;
    roomTypeId: number;
    newBedId: number;
    currentBedId: number;
    visitId: number;
  }>({
    billingTypeId: patient?.BillingTypeId,
    roomTypeId: 0,
    newBedId: 0,
    currentBedId: patient?.BedId,
    visitId: patient?.VisitId,
  });

  // bed type list
  const getBillingType = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BED_TYPES,
      {},
      { params: { branchId, roomTypeId: 1 } },
      { component: "BedTransfer" }
    );
    setBillingTypeList(resp?.data?.bedTypes ?? []);
  };

  useEffect(() => {
    getBillingType();
  }, []);

  //   available beds
  const getAvailableBedsList = async () => {
    if (!queryValues?.roomTypeId) return [];

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_AVAILABLE_BEDS,
      {},
      { params: { branchId, typeId: Number(queryValues?.roomTypeId) } },
      { component: "IpdAdmission" }
    );
    return resp?.data ?? [];
  };

  const { data: roomList = [] } = useQuery({
    queryKey: ["getAvailableBedsList", branchId, queryValues?.roomTypeId],
    queryFn: getAvailableBedsList,
    enabled: Boolean(queryValues?.roomTypeId),
  });

  //   check bed status

  const getDuplicateBedStatus = async (bedId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.CHECK_BED_STATUS,
      {},
      { params: { bedId } },
      { component: "IpdAdmission" }
    );
    if (!resp?.result) {
      setAvailableBedStatus({
        status: resp?.data?.statusHint ?? "Bed is not available",
        isResult: "N",
      });
      return;
    }
    setAvailableBedStatus({ status: resp?.data?.statusHint ?? "Bed is available", isResult: "Y" });
  };

  //   input change handler
  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "newBedId") {
      getDuplicateBedStatus(Number(value));
    }
    setQueryValues(prev => ({ ...prev, [name]: Number(value) }));
  };

  //   submit button handler
  const transferButtonHandler = async () => {
    if (!queryValues?.roomTypeId || !queryValues?.newBedId) {
      showWarning("Please select room type and bed");
      return;
    }
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.TRANSFER_IPD_PATIENT_BED,
      { ...queryValues },
      {},
      { component: "BedTransfer" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Error while transferring bed");
      return;
    }
    const details = await getUpdatedIpdPatientDetails(fetchApi, branchId, patient?.UHID);
    if (details) {
      setUpdatedIpdPatientDetails(details);
    }
    setAvailableBedStatus({
      status: "",
      isResult: "",
    });
    showSuccess(resp?.data ?? "Data saved successfully");
    setQueryValues({
      billingTypeId: patient?.BillingTypeId,
      roomTypeId: 0,
      newBedId: 0,
      currentBedId: patient?.BedId,
      visitId: patient?.VisitId,
    });
    bedHistoryRefetch?.();
  };

  //   get previous bed
  const getPreviousBed = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_PATIENT_BED_HISTORY,
      {},
      { params: { visitId: patient?.VisitId } },
      { component: "BedTransfer" }
    );
    return resp?.data ?? [];
  };

  const { data: previousBedList = [], refetch: bedHistoryRefetch } = useQuery({
    queryKey: ["previousBedList", patient?.VisitId],
    queryFn: getPreviousBed,
    enabled: !!patient?.VisitId,
  });

  return (
    <div>
      {/* <h3 className="ipd-billing-text">Bed Transfer</h3> */}
      <div className="form-grid-4">
        <InputField label="Billing Type" required>
          <select
            className="input-field"
            value={queryValues?.billingTypeId}
            onChange={inputChangeHandler}
            name="billingTypeId"
          >
            <option value={0}>--Select--</option>
            {billingTypeList?.map((item: BillingTypeItem) => (
              <option key={item?.typeId} value={item?.typeId}>
                {item?.roomTypeName}
              </option>
            ))}
          </select>
        </InputField>
        <InputField label="Room Type" required>
          <select
            className="input-field"
            value={queryValues?.roomTypeId}
            onChange={inputChangeHandler}
            name="roomTypeId"
          >
            <option value={0}>--Select--</option>
            {billingTypeList?.map((item: BillingTypeItem) => (
              <option key={item?.typeId} value={item?.typeId}>
                {item?.roomTypeName} | Avl: {item?.availableBeds ?? 0} | Occ:{" "}
                {item?.occupiedBeds ?? 0}
              </option>
            ))}
          </select>
        </InputField>
        <InputField label="Ward / Bed" required>
          <select
            className="input-field"
            name="newBedId"
            value={queryValues?.newBedId}
            onChange={inputChangeHandler}
          >
            <option value={0}>--Select--</option>
            {roomList.map((item: RoomItem) => (
              <option key={item.bedId} value={item.bedId}>
                {item.bedName} ({item.gender})
              </option>
            ))}
          </select>

          {availableBedStatus?.status && (
            <p
              className={`mt-2 text-xs ${availableBedStatus?.isResult === "N" ? "input-field-error" : "input-field-success"}`}
            >
              {availableBedStatus?.status}
            </p>
          )}
        </InputField>

        <div className="col-span-1 md:col-span-3 lg:col-span-1 flex items-end justify-end mb-2">
          {/* <SubmitButton label="Transfer" onClick={transferButtonHandler} />
          
           */}
          <button
            className={`${availableBedStatus?.isResult === "N" ? " save-btn cursor-not-allowed opacity-50" : "save-btn"}`}
            disabled={availableBedStatus?.isResult === "N"}
            onClick={transferButtonHandler}
          >
            Transfer
          </button>
        </div>
      </div>

      <h3 className="ipd-billing-text mt-8 mb-3">Bed Transfer History</h3>
      <div className="overflow-x-auto">
        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size w-full">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Bed Type</th>
                    <th className="table-th">Ward Name</th>
                    <th className="table-th">Room Name</th>
                    <th className="table-th">Bed No</th>
                    <th className="table-th">Admitted By</th>
                    <th className="table-th">Admitted On</th>
                    <th className="table-th">Transferred By</th>
                    <th className="table-th">Transferred On</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previousBedList.length === 0 && (
                    <tr>
                      <td colSpan={10} className="table-empty text-center py-4">
                        No transfer history found
                      </td>
                    </tr>
                  )}
                  {previousBedList.map((item: PreviousBedListItem, index: number) => (
                    <tr
                      key={index}
                      className={`table-row ${item.IsCurrent === 1 ? "bg-green-300 text-green-800" : ""}`}
                    >
                      <td className="table-td">{index + 1}</td>
                      <td className="table-td">{item.BedType || "-"}</td>
                      <td className="table-td">{item.WardName || "-"}</td>
                      <td className="table-td">{item.RoomName || "-"}</td>
                      <td className="table-td">{item.BedNo || "-"}</td>
                      <td className="table-td">{item.AdmittedBy || "-"}</td>
                      <td className="table-td">{item.AdmittedOn || "-"}</td>
                      <td className="table-td">{item.TransferedBy || "-"}</td>
                      <td className="table-td">{item.TransferedOn || "-"}</td>
                      <td className="table-td">
                        {item.IsCurrent === 1 ? (
                          <span className="badge badge-success text-green-600 font-semibold bg-green-100 px-2 py-1 rounded">
                            Current
                          </span>
                        ) : (
                          <span className="badge badge-secondary text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">
                            Transferred
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default BedTransfer;
