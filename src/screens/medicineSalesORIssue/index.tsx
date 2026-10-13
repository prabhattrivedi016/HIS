import { ChevronDown, Download, File, Plus } from "lucide-react";
import MedicalFooter from "./components/MedicalFooter";
import MedicalInfoFilterBar from "./components/MedicalInfoFilterBar";
import MedicalTable from "./components/MedicalTable";
import MedicineActionCards from "./components/MedicineActionCards";
import MedicineTabs from "./components/MedicineTabs";
import PatientHeaderSection from "./components/PatientHeaderSection";

const MedicalSales = () => {
  const handleActionClick = actionName => {
    alert(`${actionName} clicked`);
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-2">
        <div className="flex-1 w-[250px]">
          <h1 className="page-heading">Medicine Sales/Issue</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Medicine Sales/Issue</span>
          </nav>
        </div>

        <div className="w-full flex justify-center lg:justify-end sm: flex-1">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 ">
            {/* New Item Button */}
            <button
              onClick={() => handleActionClick("New (F2)")}
              className="save-btn flex items-center justify-center gap-1 flex-1 sm:flex-initial"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New</span>
            </button>

            {/* Import Excel Button */}
            <button
              onClick={() => handleActionClick("Medicine Indent (IPD)")}
              className="flex items-center justify-center save-btn gap-1 flex-1 sm:flex-initial"
            >
              <Download size={15} strokeWidth={2.5} />
              <span>Medicine Indent</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={() => handleActionClick("OPD Prescription")}
              className="flex items-center justify-center gap-1 save-btn flex-1 sm:flex-initial"
            >
              <File size={16} strokeWidth={2} />
              <span>OPD Prescription</span>
            </button>

            {/* Print Label Button */}
            <button
              onClick={() => handleActionClick("Print Label")}
              className="flex items-center justify-center gap-1.5 save-btn flex-1 sm:flex-initial"
            >
              <span>Check Stock</span>
            </button>

            {/* List View Button */}
            <button
              onClick={() => handleActionClick("List View")}
              className="flex items-center justify-center gap-1.5 save-btn flex-1 sm:flex-initial"
            >
              <ChevronDown size={15} strokeWidth={2} />
              <span>More</span>
            </button>
          </div>
        </div>
      </div>

      {/* data */}

      <PatientHeaderSection />
      <MedicalInfoFilterBar />
      <MedicineTabs />
      <MedicineActionCards />
      <MedicalTable />
      <MedicalFooter />
    </div>
  );
};

export default MedicalSales;
