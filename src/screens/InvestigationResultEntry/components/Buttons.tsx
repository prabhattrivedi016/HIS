const Buttons = () => {
  return (
    <div
      className="fixed bottom-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg px-2 py-2"
      style={{ left: "var(--app-sidebar-width, 0px)" }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex shrink-0 gap-2">
          <button type="button" className="save-btn">
            Bulk Print
          </button>
        </div>

        {/* Right */}
        <div className="flex flex-nowrap items-center justify-end gap-2 overflow-x-auto">
          <button type="button" className="prevNext-btn">
            <i className="fa-solid fa-chevron-left"></i>
            Previous
          </button>

          <button type="button" className="prevNext-btn">
            Next
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          <button type="button" className="save-btn">
            Re-Run
          </button>

          <button type="button" className="save-btn">
            Delta Check
          </button>

          <button type="button" className="save-btn">
            Patient Details
          </button>

          <button type="button" className="save-btn">
            Add Report
          </button>

          <button type="button" className="save-btn">
            Print Report
          </button>

          <button type="button" className="approve-btn">
            Approve
          </button>

          <button type="button" className="hold-btn">
            Hold
          </button>

          <button type="button" className="save-btn">
            Save
          </button>

          <button type="button" className="cancel-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Buttons;

// approve-btn
