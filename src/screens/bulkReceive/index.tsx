import { StepBack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FilterBar from "./components/FilterBar";
import ReceiveDetails from "./components/ReceieveDetalis";
import SearchBar from "./components/SearchBar";
import TableData from "./components/TableData";

const BulkReceive = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">Bulk Receive</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Bulk Receive</span>
          </nav>
        </div>
        <div className="flex justify-end flex-1">
          {/* Back Button */}
          <div className="flex justify-around flex-wrap items-center gap-2">
            <button
              className="sample-button cursor-pointer flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-2xs"
              onClick={() => navigate("/lab-sample-management")}
            >
              <StepBack size={15} strokeWidth={2.5} className="text-blue-600" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
      {/* data */}
      <FilterBar />
      <SearchBar />
      <TableData />
      <ReceiveDetails />
    </div>
  );
};

export default BulkReceive;
