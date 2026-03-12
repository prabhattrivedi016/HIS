import PageHeader from "@/components/pageHeader";
import { useCallback, useState } from "react";
import AddPatientDrawer from "./components/AddPatientDrawer";

const PatientMaster = () => {
  const [openAddPatient, setOpenAddPatient] = useState<boolean>(false);
  const [patientIdToEdit, setPatientIdToEdit] = useState<number | null>(null);

  /*------------------add update refer doctor master-------------------------- */
  const addNewHandler = (id: number | null) => {
    if (id) {
      setPatientIdToEdit(id);
      setOpenAddPatient(true);
    } else {
      setPatientIdToEdit(null);
      setOpenAddPatient(true);
    }
  };

  const closeHandler = useCallback(() => {
    setOpenAddPatient(false);
  }, []);
  return (
    <div className="master-page-size">
      <PageHeader
        title="Patient Master"
        // view={cardView}
        // onCardView={handleCardView}
        buttonTitle="Add Patient"
        // onRefresh={handleRefresh}
        // onSearch={searchHandler}
        onAddNew={addNewHandler}
        // onDownload={downloadHandler}
        // onFilter={filterDropDown}
        // onToggleColumnModal={hideShowHandler}
        // hideShowBtnRef={hideShowBtnRef as React.RefObject<HTMLElement>}
        // downloadBtnRef={downloadBtnRef as React.RefObject<HTMLElement>}
      />

      {/* add patient drawer */}
      <AddPatientDrawer isOpen={openAddPatient} onClose={closeHandler} />
    </div>
  );
};

export default PatientMaster;
