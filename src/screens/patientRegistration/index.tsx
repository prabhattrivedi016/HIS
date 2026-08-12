import UhidGlobalSearch from "@/components/SingledrawerAndPopup/components/UhidGlobalSearch";
import { showWarning } from "@/utils/alert";
import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import PatientData from "./components/PatientData";
import SearchPatientPopup from "./components/SearchPatientPopup";

const PatientRegistration = () => {
  const [openSearchPatientPopup, setOpenSearchPatientPopup] = useState<boolean>(false);
  const [renderSearchPatientPopup, setRenderSearchPatientPopup] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [uhidSearchResetKey, setUhidSearchResetKey] = useState(0);

  const [showTable, setShowTable] = useState<boolean>(false);

  const handleOpenSearchPatientPopup = () => {
    setSelectedPatientId(null);
    setUhidSearchResetKey(prev => prev + 1);
    setOpenSearchPatientPopup(true);
    setRenderSearchPatientPopup(true);
  };

  const closeHandler = useCallback(() => {
    setOpenSearchPatientPopup(false);
  }, []);

  const handleUhidPatientSelect = useCallback(async (patientId: number) => {
    if (!patientId) {
      showWarning("Invalid patient selected.");
      return false;
    }

    setSelectedPatientId(patientId);
    return true;
  }, []);

  const handleRegistrationSuccess = useCallback(() => {
    setSelectedPatientId(null);
    setUhidSearchResetKey(prev => prev + 1);
  }, []);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">Patient Registration</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Patient Registration</span>
          </nav>
        </div>

        <div className="flex justify-center flex-1">
          <UhidGlobalSearch
            onPatientSelect={handleUhidPatientSelect}
            resetKey={uhidSearchResetKey}
            className="mt-1"
          />
        </div>

        <div className="flex justify-end flex-1">
          <button type="button" className="save-btn" onClick={handleOpenSearchPatientPopup}>
            Search Old Patient
          </button>
        </div>
      </div>

      {/* form */}
      <PatientData
        selectedPatientId={selectedPatientId}
        onRegistrationSuccess={handleRegistrationSuccess}
      />

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
