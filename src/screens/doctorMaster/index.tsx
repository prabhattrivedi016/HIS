import { doctorMasterConfig } from "@/config/masterConfig/doctorMasterConfig";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HideShowColumn from "../../components/buttonsPopup";
import DownloadPopup from "../../components/buttonsPopup/components/DownloadPopup";
import { ErrorMessage } from "../../components/infoText";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard";
import ListView from "../../components/profileCard/components/ListView";
import { ENDPOINTS } from "../../config/defaults";
import { Status, VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import useGlobalApi from "../../hooks/useGlobalApi";
import { ColumnVisibility } from "../../types";
import { exportListViewData } from "../../utils/exportUtils";
import { filteredData } from "../../utils/filteredData";
import { transformDataWithConfig } from "../../utils/utilities";
import CardRightButtonPopup from "./components/CardRightButtonPopup";
import DoctorMasterDrawer from "./components/DoctorMasterDrawer";
import UnitMasterDrawer from "./components/UnitMasterDrawer";
import { DoctorMasterGridCard, DoctorMasterListCard } from "./types";

const DoctorMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const configData = useConfigMaster("doctorMasterConfig");
  const doctorConfig = configData?.configDataValue;

  const [doctorMasterGridData, setDoctorMasterGridData] = useState<DoctorMasterGridCard[]>([]);
  const [doctorMasterListData, setDoctorMasterListData] = useState<DoctorMasterListCard[]>([]);

  const [gridFilteredData, setGridFilteredData] = useState<DoctorMasterGridCard[]>([]);
  const [listFilteredData, setListFilteredData] = useState<DoctorMasterListCard[]>([]);

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  const [cardView, setCardView] = useState(VIEWTYPE?.GRID);

  const [openUnitDrawer, setOpenUnitDrawer] = useState<boolean>(false);

  const [openDoctorDrawer, setOpenDoctorDrawer] = useState<boolean>(false);
  const [drawerButtonTitle, setDrawerButtonTitle] = useState<string>("Create");
  const [doctorDrawerTitle, setDoctorDrawerTitle] = useState<string>("Add New Doctor");
  const [doctorIdToEdit, setDoctorIdToEdit] = useState<number | null>(null);

  const [gridRightTopBtn, setGridRightTopBtn] = useState(false);
  const [gridBtnPopup, setGridBtnPopup] = useState<{ top: number; left: number } | null>(null);
  const [idGridBtn, setIdGridBtn] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [onDownload, setOnDownload] = useState<boolean>(false);
  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);

  const downloadBtnRef = useRef<HTMLButtonElement>(null);

  /*------------------doctor master list--------------------------- */
  const getDoctorsLists = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      { params: { isDoctorUnit: Status.INACTIVE } },
      { component: "DoctorMaster" }
    );

    const activeConfig = doctorConfig || doctorMasterConfig;

    const transformed = transformDataWithConfig(activeConfig, resp);

    setDoctorMasterGridData(transformed?.gridView ?? []);
    setDoctorMasterListData(transformed.listView ?? []);

    setGridFilteredData(transformed.gridView ?? []);
    setListFilteredData(transformed.listView ?? []);
  }, [configData]);

  useEffect(() => {
    getDoctorsLists();
  }, []);

  /*--------------------card view handler---------- */
  const handleCardView = (view: string) => setCardView(view);

  /*---------------------update doctor master status----------------- */
  const updateDoctorMasterStatus = useCallback(
    async ({ isActive, id }: { isActive: number; id?: number }) => {
      if (id === undefined) return;
      await fetchApi(
        "PATCH",
        ENDPOINTS.UPDATE_DOCTOR_MASTER_STATUS,
        {},
        { params: { doctorId: id, isActive } }
      );
      getDoctorsLists();
    },
    [getDoctorsLists]
  );

  /*----------------------------unit drawer handler------------------------ */
  const addUnitHandler = () => {
    setOpenUnitDrawer(true);
  };

  const handleCloseDrawer = useCallback(() => {
    setOpenUnitDrawer(false);
  }, []);

  /*------------------add update doctor master-------------------------- */
  const addNewHandler = useCallback((id: number | null) => {
    if (id) {
      setDrawerButtonTitle("Update");
      setDoctorDrawerTitle("Update Existing Doctor");
      setDoctorIdToEdit(id);
    } else {
      setDrawerButtonTitle("Create");
      setDoctorDrawerTitle("Add New Doctor");
      setDoctorIdToEdit(null);
    }
    setOpenDoctorDrawer(true);
  }, []);

  /*------------------handle refresh--------------------- */
  const handleRefresh = useCallback(async () => {
    await getDoctorsLists();
    setSearchQuery("");
  }, [getDoctorsLists]);

  /*--------------search handler---------------- */
  const searchHandler = useCallback(
    (keyInput: string, selectedValue: string) => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue,
        listData: doctorMasterListData,
        gridData: doctorMasterGridData,
        setListFilteredData,
        setGridFilteredData,
      });
    },
    [doctorMasterListData, doctorMasterGridData]
  );

  /*-------------initial column visibility------------------- */
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const visibility: Record<string, boolean> = {};
      listFilteredData[0].columns.forEach(col => {
        visibility[col?.label] = true;
      });
      setColumnVisibility(visibility);
    }
  }, [listFilteredData]);

  // DOWNLOAD POPUP HANDLER
  const downloadHandler = () => {
    if (!downloadBtnRef.current) return;

    const rect = downloadBtnRef.current.getBoundingClientRect();
    setDownloadPopup({
      top: rect.bottom + window.scrollY - 12,
      left: rect.left + window.scrollX + 12,
    });

    setOnDownload(prev => !prev);
  };

  const [hideShowColumn, setHideShowColumn] = useState<boolean>(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const hideShowBtnRef = useRef<HTMLButtonElement>(null);

  // HIDE SHOW COLUMN HANDLER
  const hideShowHandler = useCallback(() => {
    if (hideShowBtnRef.current) {
      const rect = hideShowBtnRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + 5,
        left: rect.left,
      });
    }
    setHideShowColumn(prev => !prev);
  }, []);

  // COLUMN NAMES
  const columnNames = useMemo(() => {
    if (cardView === VIEWTYPE?.LIST && listFilteredData.length > 0) {
      return listFilteredData[0]?.columns?.map((col: any) => col?.label) || [];
    }
    return [];
  }, [listFilteredData, cardView]);
  // DROPDOWN FILTER
  const filterDropDown = doctorMasterListData?.[0]?.columns;

  /*---------------------card right button handler----------------- */
  const cardRightTopHandler = (doctorId: number, rect: DOMRect) => {
    if (gridRightTopBtn && idGridBtn === doctorId) {
      setGridRightTopBtn(false);
      return;
    }
    setGridBtnPopup({
      top: rect.bottom + window.scrollY - 5,
      left: rect.left + window.scrollX + 5,
    });
    setIdGridBtn(doctorId);
    setGridRightTopBtn(true);
  };

  /*--------------render component handler----------- */
  const renderComponent = (view: string) => {
    if (error) return <ErrorMessage text={error?.message} />;
    if (loading) return <div className="initial-message">Loading doctor master...</div>;

    if (view === VIEWTYPE?.GRID) {
      if (!gridFilteredData.length) return <div className="no-data-message">No data found...</div>;
      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map((doctor, idx) => (
            <GridView
              key={doctor?.id}
              data={{
                ...doctor,
                cardLeftTop: doctor.cardLeftTop.map(item => ({
                  ...item,
                  value: typeof item.value === "string" ? undefined : item.value,
                })),
              }}
              onStatusChange={updateDoctorMasterStatus}
              openDrawer={addNewHandler}
              buttonTitle={setDrawerButtonTitle}
              drawerTitle={setDoctorDrawerTitle}
              cardRightTopBtn={cardRightTopHandler}
            />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE?.LIST) {
      if (!listFilteredData?.length) return <div className="no-data-message">No data found...</div>;
      return (
        <div className="list-view-page-layout">
          <ListView
            data={listFilteredData}
            onStatusChange={updateDoctorMasterStatus}
            columnVisibility={columnVisibility}
            openDrawer={addNewHandler}
            buttonTitle={setDrawerButtonTitle}
            drawerTitle={setDoctorDrawerTitle}
          />
        </div>
      );
    }
  };

  return (
    <div className="master-page-size">
      <PageHeader
        title="Doctor Master"
        view={cardView}
        onCardView={handleCardView}
        buttonTitle="Add Doctor"
        unitButton="Add Unit "
        onRefresh={handleRefresh}
        onSearch={searchHandler}
        onAddNew={addNewHandler}
        onAddUnit={addUnitHandler}
        onDownload={downloadHandler}
        onFilter={filterDropDown}
        onToggleColumnModal={hideShowHandler}
        hideShowBtnRef={hideShowBtnRef}
        downloadBtnRef={downloadBtnRef}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {openUnitDrawer && <UnitMasterDrawer isOpen={openUnitDrawer} onClose={handleCloseDrawer} />}

      {openDoctorDrawer && (
        <DoctorMasterDrawer
          isOpen={openDoctorDrawer}
          onClose={() => setOpenDoctorDrawer(false)}
          buttonTitle={drawerButtonTitle}
          drawerTitle={doctorDrawerTitle}
          doctorId={doctorIdToEdit}
          onCloseDrawer={handleRefresh}
        />
      )}

      {/* Hide/Show Columns Popup */}
      {hideShowColumn && popupPos && (
        <HideShowColumn
          columnNames={columnNames}
          anchorRef={hideShowBtnRef as React.RefObject<HTMLElement>}
          position={popupPos}
          onClose={() => setHideShowColumn(false)}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
        />
      )}

      {/* DOWNLOAD POPUP */}
      {onDownload && downloadPopup && (
        <DownloadPopup
          anchorRef={downloadBtnRef as React.RefObject<HTMLElement>}
          position={downloadPopup}
          onClose={() => setOnDownload(false)}
          onDownloadPdf={() => {
            const transformedData = listFilteredData.map(item => ({
              ...item,
              columns: item.columns.map(col => ({
                ...col,
                value: col.value ?? "",
              })),
            }));
            exportListViewData(transformedData, "DoctorMasterList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            const transformedData = listFilteredData.map(item => ({
              ...item,
              columns: item.columns.map(col => ({
                ...col,
                value: col.value ?? "",
              })),
            }));
            exportListViewData(transformedData, "DoctorMasterList", "excel");
            setOnDownload(false);
          }}
        />
      )}

      {/* grid right top button popup handler */}
      {gridRightTopBtn ? (
        <CardRightButtonPopup
          doctorId={idGridBtn}
          position={gridBtnPopup}
          onClose={() => setGridRightTopBtn(false)}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default DoctorMaster;
