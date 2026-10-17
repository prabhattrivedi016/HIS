import { decryptRouteId } from "@/utils/routeEncryption";
import { useNavigate, useParams } from "react-router-dom";
import ProgressSteps from "./components/ProgessSteps";
import SampleCard from "./components/SampleCard";
import TableData from "./components/TableData";
import TurnAroundTimeDetails from "./components/TurnAroundTimeDetails";

const SampleJourney = () => {
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const patientInvestigationId = patientId ? decryptRouteId(patientId) : null;
  return (
    <div className="page-container">
      <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">Sample Journey</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Sample Journey</span>
          </nav>
        </div>

        <div className="flex justify-end flex-1">
          {/* Action Buttons */}
          <div className="flex justify-around flex-wrap items-center gap-2">
            {/* Active Back Button */}
            <button
              className="save-btn"
              onClick={() => {
                navigate("/lab-sample-management");
              }}
            >
              <span className="sample-button-text">Back</span>
            </button>

            {/* Scan Barcode Button -> Navigates to Bulk Receive */}
            <button className="save-btn">
              <span className="sample-button-text">Print Journey</span>
            </button>

            {/* Bulk Receive Button -> Navigates to Bulk Receive */}
            <button className="save-btn">
              <span className="sample-button-text">Download PDF</span>
            </button>

            {/* share Receive Button -> Navigates to Bulk Receive */}
            <button className="save-btn">
              <span className="sample-button-text">Share</span>
            </button>
          </div>
        </div>
      </div>
      {/* data */}
      <SampleCard />
      <ProgressSteps />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-9 min-w-0">
          <TableData />
        </div>
        <div className="lg:col-span-3 min-w-0">
          <TurnAroundTimeDetails />
        </div>
      </div>
    </div>
  );
};

export default SampleJourney;
