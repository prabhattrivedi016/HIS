type ButtonAction =
  | "bulkPrint"
  | "previous"
  | "next"
  | "reRun"
  | "deltaCheck"
  | "patientDetails"
  | "addReport"
  | "printReport"
  | "approve"
  | "hold"
  | "save"
  | "close";
const Buttons = ({ onButtonClick }: { onButtonClick: (value: ButtonAction) => void }) => {
  return (
    <div
      className="fixed bottom-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg px-2 py-2"
      style={{ left: "var(--app-sidebar-width, 0px)" }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex shrink-0 gap-2">
          <button type="button" className="save-btn" onClick={() => onButtonClick("bulkPrint")}>
            Bulk Print
          </button>
        </div>

        {/* Right */}
        <div className="flex flex-nowrap items-center justify-end gap-2 overflow-x-auto">
          <button type="button" className="prevNext-btn" onClick={() => onButtonClick("previous")}>
            <i className="fa-solid fa-chevron-left"></i>
            Previous
          </button>

          <button type="button" className="prevNext-btn" onClick={() => onButtonClick("next")}>
            Next
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          {/* <button type="button" className="save-btn" onClick={() => onButtonClick("reRun")}>
            Re-Run
          </button> */}

          <button type="button" className="save-btn" onClick={() => onButtonClick("deltaCheck")}>
            Delta Check
          </button>

          <button
            type="button"
            className="save-btn"
            onClick={() => onButtonClick("patientDetails")}
          >
            Patient Details
          </button>

          <button type="button" className="save-btn" onClick={() => onButtonClick("addReport")}>
            Add Report
          </button>

          <button type="button" className="save-btn" onClick={() => onButtonClick("printReport")}>
            Print Report
          </button>

          <button type="button" className="approve-btn" onClick={() => onButtonClick("approve")}>
            Approve
          </button>

          <button type="button" className="hold-btn" onClick={() => onButtonClick("hold")}>
            Hold
          </button>

          <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
            Save
          </button>

          <button type="button" className="cancel-button" onClick={() => onButtonClick("close")}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Buttons;

// approve-btn
