import InputField from "@/components/customInputField";
import { Plus } from "lucide-react";
import BedStatsCards from "./components/BedCard";
import BedLayout from "./components/BedLayout";
import BedTables from "./components/BedTables";

const BedInfo = () => {
  const handleActionClick = actionName => {
    alert(`${actionName} clicked`);
  };

  return (
    <div className="page-container">
      <div className="flex  justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">Bed Details</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Bed Details</span>
          </nav>
        </div>

        <div className="w-full flex justify-center sm: flex-1 lg:justify-end">
          {/* Responsive Filters & Button */}
          <div className="w-full flex justify-start lg:justify-end overflow-x-auto pb-1 lg:pb-0 [&::-webkit-scrollbar]:h-1 mt-2 items-center">
            <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap py-1">
              <div className="shrink-0">
                <InputField label="Hospital" className="flex flex-row gap-2 cursor-pointer text-xs">
                  <select name="hospital" className="input-field cursor-pointer text-xs py-1.5">
                    <option value="main hospital">Main Hospital</option>
                    <option value="shubham">Shubham Hospital</option>
                  </select>
                </InputField>
              </div>

              <div className="shrink-0">
                <InputField label="Floor" className="flex flex-row gap-2 text-xs">
                  <select name="floor" className="input-field cursor-pointer text-xs py-1.5">
                    <option value="All floor">All Floors</option>
                    <option value="second">Second</option>
                  </select>
                </InputField>
              </div>

              <div className="shrink-0">
                <InputField label="Ward" className="flex flex-row gap-2 text-xs">
                  <select name="ward" className="input-field cursor-pointer text-xs py-1.5">
                    <option value="all ward">All Wards</option>
                    <option value="icu ward">ICU</option>
                  </select>
                </InputField>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => handleActionClick("Admit Patient")}
                  className="save-btn flex items-center mt-[-7px]"
                >
                  <Plus size={15} />
                  <span>Admit Patient</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* data */}
      <BedStatsCards />
      <BedTables />
      <BedLayout />
    </div>
  );
};

export default BedInfo;
