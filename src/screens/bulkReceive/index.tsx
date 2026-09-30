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
            <button className="save-btn" onClick={() => navigate("/lab-sample-management")}>
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
