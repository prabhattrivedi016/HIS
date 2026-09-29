import { File, Printer, Share, StepBack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProgressSteps from "./components/ProgessSteps";
import SampleCard from "./components/SampleCard";
import TableData from "./components/TableData";
import TurnAroundTimeDetails from "./components/TurnAroundTimeDetails";

const SampleJourney = () => {
  const naviagte = useNavigate();
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
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-blue-700 border border-blue-500 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
              onClick={() => {
                naviagte("/lab-sample-management");
              }}
            >
              <StepBack size={15} strokeWidth={2.5} className="sample-button-text" />
              <span className="sample-button-text">Back</span>
            </button>

            {/* Scan Barcode Button -> Navigates to Bulk Receive */}
            <button className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-500 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer">
              <Printer size={16} strokeWidth={2} className="sample-button-text" />
              <span className="sample-button-text">Print Journey</span>
            </button>

            {/* Bulk Receive Button -> Navigates to Bulk Receive */}
            <button className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-500 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer">
              <File size={15} strokeWidth={2} className="sample-button-text" />
              <span className="sample-button-text">Download PDf</span>
            </button>

            {/* share Receive Button -> Navigates to Bulk Receive */}
            <button className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-500 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer">
              <Share size={15} strokeWidth={2} className="sample-button-text" />
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
