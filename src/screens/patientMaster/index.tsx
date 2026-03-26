import { ErrorMessage } from "@/components/infoText";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { patientMasterConfig } from "@/config/masterConfig/patientMasterConfig";
import { VIEWTYPE } from "@/constants/constants";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGlobalApi from "@/hooks/useGlobalApi";
import { transformDataWithConfig } from "@/utils/utilities";
import { useCallback, useEffect, useState } from "react";
import AddPatientDrawer from "./components/AddPatientDrawer";
import GridRightTopButtons from "./components/GridRightTopButtons";
import { PatientMasterGridItem, PatientMasterListItem } from "./types";

const PatientMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const config = useConfigMaster("patientMaster");
  const patientConfig = config?.configDataValue;

  const [patientMasterGridData, setCorporateMasterGridData] = useState<PatientMasterGridItem[]>([]);
  const [patientMasterListData, setCorporateMasterListData] = useState<PatientMasterListItem[]>([]);

  const [gridFilteredData, setGridFilteredData] = useState<PatientMasterGridItem[]>([]);
  const [listFilteredData, setListFilteredData] = useState<PatientMasterListItem[]>([]);
  const [openAddPatient, setOpenAddPatient] = useState<boolean>(false);
  const [renderAddPatient, setRenderAddPatient] = useState<boolean>(false);

  const [patientIdToEdit, setPatientIdToEdit] = useState<number | null>(null);

  const [cardView, setCardView] = useState(VIEWTYPE?.GRID);

  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const [showRightCardPopup, setShowRightCardPopup] = useState<boolean>(false);
  const [gridBtnPopup, setGridBtnPopup] = useState(null);
  const [gridRightTopBtn, setGridRightTopBtn] = useState(false);
  const [idGridBtn, setIdGridBtn] = useState<number | null>(null);

  const getPatientMaster = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_MASTER,
      {},
      {},
      { component: "patientMaster" }
    );

    const activeConfig = patientMasterConfig;
    const transformed = transformDataWithConfig(activeConfig, resp);

    setCorporateMasterGridData(transformed?.gridView ?? []);
    setCorporateMasterListData(transformed.listView ?? []);

    setGridFilteredData(transformed.gridView ?? []);
    setListFilteredData(transformed.listView ?? []);

    setHasFetched(true);
  }, []);

  useEffect(() => {
    if (patientConfig) {
      getPatientMaster();
    }
  }, [patientConfig]);

  // card view handler
  const handleCardView = (view: string) => setCardView(view);

  // add update refer doctor master
  const addNewHandler = (id: number | null) => {
    if (id) {
      setPatientIdToEdit(id);
      setOpenAddPatient(true);
      setRenderAddPatient(true);
    } else {
      setPatientIdToEdit(null);
      setOpenAddPatient(true);
      setRenderAddPatient(true);
    }
  };

  const closeHandler = useCallback(() => {
    setOpenAddPatient(false);
  }, []);

  // card right top handler
  const cardRightTopHandler = (id: number, rect: { bottom: number; left: number }) => {
    if (gridRightTopBtn && idGridBtn === id) {
      setGridRightTopBtn(false);
      return;
    }
    setGridBtnPopup({
      top: rect.bottom + window.scrollY - 5,
      left: rect.left + window.scrollX + 5,
    });
    setIdGridBtn(id);
    setGridRightTopBtn(true);
  };

  // render component
  const renderComponent = (view: string) => {
    if (error) return <ErrorMessage text={error?.message} />;
    if (!patientConfig || loading || !hasFetched)
      return <div className="initial-message">Loading patient master...</div>;

    if (view === VIEWTYPE?.GRID) {
      if (!gridFilteredData.length || gridFilteredData?.length === 0)
        return <div className="no-data-message">No data found...</div>;
      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map(patient => (
            <GridView
              key={patient?.id}
              data={patient}
              openDrawer={addNewHandler}
              cardRightTopBtn={cardRightTopHandler}
            />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE?.LIST) {
      if (!listFilteredData.length || listFilteredData?.length === 0)
        return <div className="no-data-message">No data found...</div>;
      return (
        <div className="list-view-page-layout">
          <ListView
            data={listFilteredData}
            // columnVisibility={columnVisibility}
            openDrawer={addNewHandler}
          />
        </div>
      );
    }
  };
  return (
    <div className="master-page-size">
      <PageHeader
        title="Patient Master"
        view={cardView}
        onCardView={handleCardView}
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

      {/* render lists */}
      <div className="w-full">{renderComponent(cardView)}</div>

      {/* add patient drawer */}
      {!!renderAddPatient && <AddPatientDrawer isOpen={openAddPatient} onClose={closeHandler} />}

      {!!gridRightTopBtn ? (
        <GridRightTopButtons
          position={gridBtnPopup}
          onClose={() => setGridRightTopBtn(false)}
          data={idGridBtn}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default PatientMaster;
