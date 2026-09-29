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
    <div className="page-container ">
      <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">Lab Sample Management</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Lab Sample Management</span>
          </nav>
        </div>

        <div className="flex justify-end flex-1">
          <div className="flex justify-between flex-wrap items-center gap-2">
            {/* Choose Center Button */}
            <button
              onClick={() => handleActionClick("Select Center")}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Building2 size={15} strokeWidth={2.5} />
              <span>Center</span>
            </button>
            {/* New Sample Button */}
            <button
              onClick={() => handleActionClick("New Sample")}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New Sample</span>
            </button>

            {/* Scan Barcode Button */}
            <button
              onClick={() => handleActionClick("Scan Barcode")}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-blue-500 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Barcode size={16} strokeWidth={2} className="text-blue-600" />
              <span className="text-blue-600">Scan Barcode</span>
            </button>

            {/* Bulk Receive Button */}
            <button
              onClick={() => navigate("/bulk-receive")}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-blue-500 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Upload size={15} strokeWidth={2} className="text-blue-600" />
              <span className="text-blue-600">Bulk Receive</span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => handleActionClick("Export")}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Download size={15} strokeWidth={2} className="text-blue-600" />
              <span>Export</span>
              <ChevronDown size={13} className="text-gray-400 ml-0.5" />
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
