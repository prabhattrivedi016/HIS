import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import PatientData from "./components/PatientData";
import SearchPatientPopup from "./components/SearchPatientPopup";

const PatientRegistration = () => {
  const [openSearchPatientPopup, setOpenSearchPatientPopup] = useState<boolean>(false);
  const [renderSearchPatientPopup, setRenderSearchPatientPopup] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const [showTable, setShowTable] = useState<boolean>(false);

  const handleOpenSearchPatientPopup = () => {
    setOpenSearchPatientPopup(true);
    setRenderSearchPatientPopup(true);
  };

  const closeHandler = useCallback(() => {
    setOpenSearchPatientPopup(false);
  }, []);
  return (
    <div className="page-container">
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="page-heading">Patient Registration</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Patient Registration</span>
          </nav>
        </div>

        <div className="flex gap-3">
          <button type="button" className="save-btn" onClick={handleOpenSearchPatientPopup}>
            Search Old Patient
          </button>
        </div>
      </div>

      {/* form */}
      <PatientData selectedPatientId={selectedPatientId} />

      {/* search patient popup */}
      {renderSearchPatientPopup && (
        <SearchPatientPopup
          isOpen={openSearchPatientPopup}
          onClose={closeHandler}
          showTable={showTable}
          setShowTable={setShowTable}
          onSelectPatientId={setSelectedPatientId}
        />
      )}
    </div>
  );
};

export default PatientRegistration;
