import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { decryptRouteId } from "@/utils/routeEncryption";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProgressSteps from "./components/ProgessSteps";
import SampleCard from "./components/SampleCard";
import TableData from "./components/TableData";
import TurnAroundTimeDetails from "./components/TurnAroundTimeDetails";
import { SampleJourneyItem } from "./types";

const SampleJourney = () => {
  const { loading, fetchApi } = useGlobalApi();
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const patientInvestigationId = patientId ? decryptRouteId?.(patientId) : 0;

  const [sampleJourneyValue, setSampleJourneyValue] = useState<SampleJourneyItem | null>(null);
  const [nextStep, setNextStep] = useState<string>("");

  const getSampleJourneyRecord = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SAMPLE_JOURNEY_BY_PATIENT_INVESTIGATION_ID,
      {},
      { params: { patientInvestigationId } },
      { component: "SampleJourney" }
    );
    setSampleJourneyValue(resp?.data?.[0] ?? {});
  };

  useEffect(() => {
    if (patientInvestigationId) getSampleJourneyRecord();
  }, [patientInvestigationId]);

  if (!patientInvestigationId) return null;
  return (
    <div className="page-container">
      <div className="flex  justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">Sample Journey</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Sample Journey</span>
          </nav>
        </div>

        <div className="flex flex-1 justify-center lg:justify-end overflow-x-auto w-full py-1 [&::-webkit-scrollbar]:h1">
          {/* Action Buttons */}
          <div className="flex flex-nowrap items-center gap-2 shrink-0">
            {/* Active Back Button */}
            <button
              className="save-btn shrink-0 whitespace-nowrap"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/lab-sample-management");
                }
              }}
            >
              <span className="sample-button-text">Back</span>
            </button>

            {/* Scan Barcode Button -> Navigates to Bulk Receive */}
            <button className="save-btn shrink-0 whitespace-nowrap">
              <span className="sample-button-text">Print Journey</span>
            </button>

            {/* Bulk Receive Button -> Navigates to Bulk Receive */}
            <button className="save-btn shrink-0 whitespace-nowrap">
              <span className="sample-button-text">Download PDF</span>
            </button>

            {/* share Receive Button -> Navigates to Bulk Receive */}
            <button className="save-btn shrink-0 whitespace-nowrap">
              <span className="sample-button-text">Share</span>
            </button>
          </div>
        </div>
      </div>
      {/* data */}
      <SampleCard sampleJourneyValue={sampleJourneyValue} />
      <ProgressSteps sampleJourneyValue={sampleJourneyValue} setNextStep={setNextStep} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 items-start">
        <div className="lg:col-span-9 min-w-0">
          <TableData sampleJourneyValue={sampleJourneyValue} />
        </div>
        <div className="lg:col-span-3 min-w-0">
          <TurnAroundTimeDetails sampleJourneyValue={sampleJourneyValue} nextStep={nextStep} />
        </div>
      </div>
    </div>
  );
};

export default SampleJourney;
