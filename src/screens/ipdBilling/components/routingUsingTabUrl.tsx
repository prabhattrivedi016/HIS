import React from "react";
import BedTransfer from "./BedTransfer";
import CorporateTransfer from "./CorporateTransfer";
import DoctorTransfer from "./DoctorTransfer";
import IpdBillingComponent from "./IpdBillingComponent";

interface RoutingUsingTabUrlProps {
  tabViewUrl: string;
  patient?: any;
}

const RoutingUsingTabUrl: React.FC<RoutingUsingTabUrlProps> = ({ tabViewUrl, patient }) => {
  switch (tabViewUrl) {
    case "corporate-transfer":
      return <CorporateTransfer patient={patient} />;

    case "doctor-transfer":
      return <DoctorTransfer patient={patient} />;

    case "transfer-bed":
      return <BedTransfer patient={patient} />;

    case "ipd-billing":
      return <IpdBillingComponent patient={patient} />;

    default:
      return (
        <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <i className="fa-solid fa-folder-open text-3xl  text-gray-300"></i>
          <p className="text-sm">
            Displaying content for tab URL:{" "}
            <strong className="text-gray-700">"{tabViewUrl}"</strong>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            No specific component has been mapped for this URL yet.
          </p>
        </div>
      );
  }
};

export default RoutingUsingTabUrl;
