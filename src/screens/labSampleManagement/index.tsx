import { Barcode, Building2, ChevronDown, Download, Plus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import TableData from "./components/TableData";

const LabSampleManagement = () => {
  const navigate = useNavigate();

  const handleActionClick = actionName => {
    alert(`${actionName} clicked`);
  };

  return (
    <div className="page-container">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="page-heading">Lab Sample Management</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Lab Sample Management</span>
          </nav>
        </div>

        {/* action button */}
        <div className="flex shrink-0 items-center justify-end">
          <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
            {/* Choose Center */}
            <button
              type="button"
              onClick={() => handleActionClick("Select Center")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Building2 size={15} strokeWidth={2.5} />

              <span>Center</span>
            </button>

            {/* New Sample */}
            <button
              type="button"
              onClick={() => handleActionClick("New Sample")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Plus size={15} strokeWidth={2.5} />

              <span>New Sample</span>
            </button>

            {/* Scan Barcode */}
            <button
              type="button"
              onClick={() => handleActionClick("Scan Barcode")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Barcode size={16} strokeWidth={2} />

              <span>Scan Barcode</span>
            </button>

            {/* Bulk Receive */}
            <button
              type="button"
              onClick={() => navigate("/bulk-receive")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Upload size={15} strokeWidth={2} />

              <span>Bulk Receive</span>
            </button>

            {/* Export */}
            <button
              type="button"
              onClick={() => handleActionClick("Export")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Download size={15} strokeWidth={2} />

              <span>Export</span>

              <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* data */}

      <FilterBar />

      <SearchBar />

      <TableData />
    </div>
  );
};

export default LabSampleManagement;
