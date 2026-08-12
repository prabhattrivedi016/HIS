import React from "react";

interface CorporateTransferProps {
  patient?: any;
}

const CorporateTransfer: React.FC<CorporateTransferProps> = ({ patient }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="ipd-billing-text">Corporate Transfer</h3>
      <p className="text-sm text-gray-600">
        Selected Patient:{" "}
        <strong className="text-gray-800">{patient?.PatientName || "No Patient"}</strong> (UHID:{" "}
        {patient?.UHID || "-"})
      </p>

      {/* Dynamic contents for Corporate Transfer can be added here */}
      <div className="mt-4 p-3 bg-white border border-gray-100 rounded text-xs text-gray-500">
        This is the Corporate Transfer component mapped to tab URL "corporate-transfer".
      </div>
    </div>
  );
};

export default CorporateTransfer;
