import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { formatBookingDate } from "@/utils/dateConvertHandler";
import React, { useEffect, useState } from "react";
import { BookingItemDetails, OtBookingDetailsItem } from "../types";

interface ViewDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: OtBookingDetailsItem | null;
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const ViewDetailsPopup: React.FC<ViewDetailsPopupProps> = ({ isOpen, onClose, item }) => {
  const { loading, fetchApi } = useGlobalApi();
  const [bookingItems, setBookingItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen || !item?.OTBookingId) {
      setBookingItems([]);
      return;
    }

    let isActive = true;

    const fetchItemDetails = async () => {
      try {
        const resp = await fetchApi(
          "GET",
          ENDPOINTS.GET_OT_BOOKING_ITEM_DETAILS,
          {},
          { params: { otBookingId: Number(item.OTBookingId) } },
          { component: "ViewDetailsPopup", silent: true }
        );

        if (isActive && resp?.data) {
          const list = Array.isArray(resp.data) ? resp.data : [resp.data];
          setBookingItems(list);
        }
      } catch (err) {
        console.error("Failed to fetch OT booking item details", err);
      }
    };

    void fetchItemDetails();

    return () => {
      isActive = false;
    };
  }, [isOpen, item?.OTBookingId]);

  if (!isOpen || !item) return null;

  const patientDetails = [
    { label: "UHID", value: item.UHID },
    { label: "Patient Name", value: item.PatientName },
    { label: "Age / Gender", value: `${item.Age || "-"} / ${item.Gender || "-"}` },
    { label: "Contact Number", value: item.ContactNumber },
    { label: "IPD No", value: item.IPDNo },
  ];

  const bookingDetails = [
    { label: "OT Booking No", value: item.OTBookingNo || `#${item.OTBookingId}` },
    { label: "Booking Date", value: formatBookingDate(item.OTBookingDate) },
    {
      label: "Time Slot",
      value:
        item.OTBookingFromTime && item.OTBookingToTime
          ? `${item.OTBookingFromTime} – ${item.OTBookingToTime}`
          : item.OTBookingFromTime || "-",
    },
    { label: "OT Theater", value: item.OTId ? `OT ${item.OTId}` : "-" },
    { label: "OT Type", value: item.OTType },
    {
      label: "Status",
      value:
        item.Status ||
        (item.IsConfirm === 1 ? "Confirmed" : item.IsCancel === 1 ? "Cancelled" : "Booked"),
    },
  ];

  const surgicalTeamDetails = [
    { label: "Surgeon(s)", value: item.SurgeonNameList },
    { label: "Assistant Surgeon 1", value: item.AssistantSurgeon1Name },
    { label: "Assistant Surgeon 2", value: item.AssistantSurgeon2Name },
    { label: "Anesthetist", value: item.AnesthetistName },
    { label: "Assistant Anesthetist", value: item.AssistantAnesthetistName },
    { label: "Anesthesia Type", value: item.Anesthesia },
    { label: "Scrub Nurse", value: item.ScrubNurseUserName },
    { label: "Circulating Nurse", value: item.CirculatingNurseUserName },
    { label: "OT Technician", value: item.OTTechnicianUserName },
    { label: "Perfusionist", value: item.PerfusionistUserName },
  ];

  const clinicalDetails = [
    { label: "Diagnosis", value: item.DiagnosisName },
    { label: "SNOMED Code", value: item.DiagnosisSNOMEDCode },
    {
      label: "Blood Required",
      value: item.IsBloodRequired ? `Yes (${item.NumberOfBloodUnits || 1} Units)` : "No",
    },
    { label: "Ventilator Required", value: item.IsVentilatorRequired ? "Yes" : "No" },
    { label: "ICU Required", value: item.IsICURequired ? "Yes" : "No" },
    { label: "Under Package", value: item.IsUnderPackage ? "Yes" : "No" },
    {
      label: "Infectious Case",
      value: item.IsInfectiousCase
        ? `Yes${item.InfectiousCaseRemarks ? ` (${item.InfectiousCaseRemarks})` : ""}`
        : "No",
    },
    { label: "Equipment Requested", value: item.IsEquipmentRequest ? "Yes" : "No" },
  ];

  const systemDetails = [
    { label: "Created By", value: item.CreatedBy },
    { label: "Created On", value: item.CreatedOn },
    { label: "Last Modified By", value: item.LastModifiedBy },
    { label: "Last Modified On", value: item.LastModifiedOn },
    ...(item.IsCancel === 1
      ? [
          { label: "Cancelled By", value: item.CancelBy },
          { label: "Cancelled On", value: item.CancelOn },
          { label: "Cancel Reason", value: item.CancelReason },
        ]
      : []),
  ];

  return (
    <CentralPopup
      title={"OT Booking Details"}
      onClose={onClose}
      isOpen={isOpen}
      className="w-[92vw] lg:min-w-280 max-h-[90vh] overflow-y-auto"
    >
      <div className="p-2 space-y-4 relative min-h-[150px]">
        {loading && <CustomLoader isLoading={loading} />}

        {/* Patient Details */}
        <div className="card w-full mb-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {patientDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label}:</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
            {bookingDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label} :</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Details */}
        <div className="card w-full mb-1">
          {/* <h3 className="card-header text-base font-semibold italic text-blue-900">
            OT Schedule Details
          </h3> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {bookingDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label} :</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
            {surgicalTeamDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label} :</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Surgical Team */}
        {/* <div className="card w-full mb-1">
          <h3 className="card-header text-base font-semibold italic text-blue-900">
            Surgical & Anesthesia Team
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {surgicalTeamDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1 text-xs">
                <span className="name-header font-medium text-slate-600 whitespace-nowrap">
                  {detail.label} :
                </span>
                <span className="font-semibold text-slate-800 truncate">
                  {formatValue(detail.value)}
                </span>
              </div>
            ))}
          </div>
        </div> */}

        {/* Clinical & Requirements */}
        <div className="card w-full mb-1">
          {/* <h3 className="card-header text-base font-semibold italic text-blue-900">
            Clinical & Case Requirements
          </h3> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {clinicalDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label} :</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
            {systemDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label} :</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Details */}
        {/* <div className="card w-full mb-1">
          <h3 className="card-header text-base font-semibold italic text-blue-900">
            System & Audit Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {systemDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1 text-xs">
                <span className="name-header font-medium text-slate-600 whitespace-nowrap">
                  {detail.label} :
                </span>
                <span className="font-semibold text-slate-800 truncate">
                  {formatValue(detail.value)}
                </span>
              </div>
            ))}
          </div>
        </div> */}

        {/* Booking Items / Services if any */}
        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-30 lg:max-h-60">
              <table className="base-table w-full">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Service Name</th>
                    <th className="table-th">From Time</th>
                    <th className="table-th">To Time</th>
                    <th className="table-th">Main Surgery</th>
                  </tr>
                </thead>

                <tbody>
                  {bookingItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {bookingItems.map((bi: BookingItemDetails, idx: number) => (
                    <tr key={bi.Id ?? idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>

                      <td className="table-td">{bi?.ServiceItemName || "-"}</td>

                      <td className="table-td">{bi?.OTBookingFromTime || "-"}</td>

                      <td className="table-td">{bi?.OTBookingToTime || "-"}</td>

                      <td className="table-td">{bi?.IsMainSurgery === 1 ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </CentralPopup>
  );
};

export default React.memo(ViewDetailsPopup);
