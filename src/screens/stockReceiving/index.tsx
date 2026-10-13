import { Plus } from "lucide-react";
import Footer from "./components/Footer";
import GRNDetails from "./components/GRNDetails";
import ItemEntryTab from "./components/ItemEntryTab";
import ItemTable from "./components/ItemTable";
import StockTable from "./components/StockTable";

const StockReceiving = () => {
  const handleActionClick = actionName => {
    alert(`${actionName} clicked`);
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">Stock Receiving (GRN Entry)</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Stock Receiving</span>
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
              <span>New</span>
            </button>
          </div>
        </div>
      </div>

      {/* data */}
      <GRNDetails />
      <ItemEntryTab />
      <StockTable />
      <ItemTable />
      <Footer />
    </div>
  );
};

export default StockReceiving;
