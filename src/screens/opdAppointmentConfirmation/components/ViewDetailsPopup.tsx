import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useEffect, useState } from "react";
import { OpdAppointmentConfirmationItem } from "../types";

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const ViewDetailsPopup = ({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: OpdAppointmentConfirmationItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !item?.AppId) return;

    let isActive = true;

    const getDetails = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_DOCTOR_APPOINTMENT_PRE_BOOKING_DETAILS,
        {},
        { params: { id: Number(item.AppId) } },
        { component: "ViewDetailsPopup", silent: true }
      );

      if (isActive) {
        const rawData = resp?.data;
        const mapped = Array.isArray(rawData) ? rawData[0] : rawData;
        setDetail(mapped ?? null);
      }
    };

    void getDetails();

    return () => {
      isActive = false;
    };
  }, [isOpen, item?.AppId]);

  useEffect(() => {
    if (!isOpen) {
      setDetail(null);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  // Use fetched details if available, fallback to list item
  const activeData = detail || item;

  const patientDetails = [
    { label: "Token No", value: activeData.TokenNo },
    { label: "UHID", value: activeData.UHID },
    { label: "Patient Name", value: activeData.PatientName },
    { label: "Age / Gender", value: `${activeData.Age || "-"} / ${activeData.Gender || "-"}` },
    { label: "DOB", value: activeData.DOB },
    { label: "Contact Number", value: activeData.ContactNumber || activeData.SelfContactNumber },
  ];

  const addressDetails = [
    { label: "Address", value: activeData.Address },
    { label: "City", value: activeData.City },
    { label: "District", value: activeData.District },
    { label: "State", value: activeData.STATE || activeData.State },
    { label: "Country", value: activeData.Country },
  ];

  const appointmentDetails = [
    { label: "Doctor Name", value: activeData.DoctorName },
    { label: "Service Name", value: activeData.ServiceName },
    { label: "Amount", value: activeData.Amount !== undefined ? `₹${activeData.Amount}` : "-" },
    { label: "Appointment Date Time", value: activeData.AppDateTime },
    { label: "Slot ID", value: activeData.SlotId },
    { label: "Source Type", value: activeData.SourceType },
    { label: "Status", value: activeData.STATUS },
  ];

  const systemDetails = [
    { label: "Created By", value: activeData.CreatedBy },
    { label: "Created On", value: activeData.CreatedOn },
    { label: "Confirm By", value: activeData.ConfirmBy },
    { label: "Confirm On", value: activeData.ConfirmOn },
    { label: "Reschedule By", value: activeData.RescheduleBy },
    { label: "Reschedule On", value: activeData.RescheduleOn },
    { label: "Cancel By", value: activeData.CancelBy },
    { label: "Cancel On", value: activeData.CancelOn },
    { label: "Cancel Reason", value: activeData.CancelReason },
  ];

  return (
    <CentralPopup
      title="Patient Booking Details"
      onClose={onClose}
      isOpen={isOpen}
      className="w-[92vw] lg:min-w-280"
    >
      <div className="p-1 space-y-3 relative min-h-[100px]">
        {loading && <CustomLoader isLoading={loading} />}

        {/* Patient Details Card */}
        <div className="card w-full mb-1">
          <h3 className="card-header text-lg font-semibold italic">Patient Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {patientDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label} :</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Address Details Card */}
        <div className="card w-full mb-1">
          <h3 className="card-header text-lg font-semibold italic">Address Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {addressDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label} :</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Details Card */}
        <div className="card w-full mb-1">
          <h3 className="card-header text-lg font-semibold italic">Appointment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {appointmentDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label} :</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Details Card */}
        <div className="card w-full mb-1">
          <h3 className="card-header text-lg font-semibold italic">System Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {systemDetails.map(detail => (
              <div key={detail.label} className="flex flex-row gap-1">
                <span className="name-header whitespace-nowrap">{detail.label} :</span>
                <span className="truncate">{formatValue(detail.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CentralPopup>
  );
};

export default ViewDetailsPopup;
