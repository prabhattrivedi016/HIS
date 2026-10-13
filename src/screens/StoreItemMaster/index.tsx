import { ChevronDown, Download, Plus, Printer, SaveIcon } from "lucide-react";
import BatchExpiry from "./components/BatchExpiry";
import StoreItemMasterForm from "./components/StoreItemMasterForm";
import StoreTabs from "./components/StoreTab";
const StoreItemMaster = () => {
  const handleActionClick = actionName => {
    alert(`${actionName} clicked`);
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">Store Item Master</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Store Item Master</span>
          </nav>
        </div>

        <div className="w-full flex justify-center sm: flex-1 lg:justify-end">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 ">
            {/* New Item Button */}
            <button
              onClick={() => handleActionClick("New Item")}
              className="save-btn flex items-center justify-center gap-1 flex-1 sm:flex-initial"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New Item</span>
            </button>

            {/* Import Excel Button */}
            <button
              onClick={() => handleActionClick("Import Excel")}
              className="flex items-center justify-center save-btn gap-1 flex-1 sm:flex-initial"
            >
              <SaveIcon size={15} strokeWidth={2.5} />
              <span>Save</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={() => handleActionClick("Export Excel")}
              className="flex items-center justify-center gap-1 save-btn flex-1 sm:flex-initial"
            >
              <Download size={16} strokeWidth={2} />
              <span>Save & New</span>
            </button>

            {/* Print Label Button */}
            <button
              onClick={() => handleActionClick("Print Label")}
              className="flex items-center justify-center gap-1.5 save-btn flex-1 sm:flex-initial"
            >
              <Printer size={15} strokeWidth={2} />
              <span>Print Barcode</span>
            </button>

            {/* List View Button */}
            <button
              onClick={() => handleActionClick("List View")}
              className="flex items-center justify-center gap-1.5 save-btn flex-1 sm:flex-initial"
            >
              <span>More</span>
              <ChevronDown size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* data */}
      <StoreTabs />
      <StoreItemMasterForm />
      <BatchExpiry />
    </div>
  );
};

export default StoreItemMaster;
