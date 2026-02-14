import HideShowColumn from "@/components/buttonsPopup";
import DownloadPopup from "@/components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage } from "@/components/infoText";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { referDoctorMasterConfig } from "@/config/masterConfig/referDoctorMasterConfig";
import { VIEWTYPE } from "@/constants/constants";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGlobalApi from "@/hooks/useGlobalApi";
import { ColumnVisibility } from "@/types";
import { exportListViewData } from "@/utils/exportUtils";
import { filteredData } from "@/utils/filteredData";
import { transformDataWithConfig } from "@/utils/utilities";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReferDoctorMasterDrawer from "./components/ReferDoctorMasterDrawer";
import { ReferDoctorMasterGridItem, ReferDoctorMasterListItem } from "./types";

const ReferDoctorMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const config = useConfigMaster("referDoctorMaster");
  const referDoctorConfig = config?.configDataValue;

  const [referDoctorMasterGridData, setReferDoctorMasterGridData] = useState<
    ReferDoctorMasterGridItem[]
  >([]);
  const [referDoctorMasterListData, setReferDoctorMasterListData] = useState<
    ReferDoctorMasterListItem[]
  >([]);

  const [gridFilteredData, setGridFilteredData] = useState<ReferDoctorMasterGridItem[]>([]);
  const [listFilteredData, setListFilteredData] = useState<ReferDoctorMasterListItem[]>([]);

  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const [cardView, setCardView] = useState(VIEWTYPE?.GRID);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  const [onDownload, setOnDownload] = useState<boolean>(false);
  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);

  const [openReferDoctorDrawer, setOpenReferDoctorDrawer] = useState<boolean>(false);
  const [referDoctorIdToEdit, setReferDoctorIdToEdit] = useState<number | null>(null);

  const downloadBtnRef = useRef<HTMLButtonElement>(null);

  const [hideShowColumn, setHideShowColumn] = useState<boolean>(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const hideShowBtnRef = useRef<HTMLButtonElement>(null);

  /*------------------refer doctor data---------------------- */

  const getReferDoctor = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_REFER_DOCTOR_LIST,
      {},
      {},
      { component: "ReferDoctorMaster" }
    );

    const activeConfig = referDoctorConfig || referDoctorMasterConfig;

    const transformed = transformDataWithConfig(activeConfig, resp);

    setReferDoctorMasterGridData(transformed?.gridView ?? []);
    setReferDoctorMasterListData(transformed.listView ?? []);

    setGridFilteredData(transformed.gridView ?? []);
    setListFilteredData(transformed.listView ?? []);

    setHasFetched(true);
  };

  useEffect(() => {
    if (referDoctorConfig) {
      getReferDoctor();
    }
  }, [referDoctorConfig]);

  /*--------------------card view handler---------- */
  const handleCardView = (view: string) => setCardView(view);

  /*------------------handle refresh--------------------- */
  const handleRefresh = useCallback(async () => {
    await getReferDoctor();
    setSearchQuery("");
  }, [getReferDoctor]);

  /*------------------add update refer doctor master-------------------------- */
  const addNewHandler = (id: number | null) => {
    if (id) {
      setReferDoctorIdToEdit(id);
    } else {
      setReferDoctorIdToEdit(null);
    }
    setOpenReferDoctorDrawer(true);
  };

  /*---------------------update doctor master status----------------- */
  const updateReferDoctorMasterStatus = async ({
    isActive,
    referDoctorId,
  }: {
    isActive: number;
    referDoctorId?: number;
  }) => {
    if (!referDoctorId) return;
    await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_REFER_DOCTOR_MASTER_STATUS,
      {},
      { params: { referDoctorId, isActive } },
      {
        component: "ReferDoctorMaster",
      }
    );
    getReferDoctor();
  };

  /*--------------search handler---------------- */
  const searchHandler = useCallback(
    (keyInput: string, selectedValue: string) => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue,
        listData: referDoctorMasterListData,
        gridData: referDoctorMasterGridData,
        setListFilteredData,
        setGridFilteredData,
      });
    },
    [referDoctorMasterListData, referDoctorMasterGridData]
  );

  /*-----------------download popup handler---------- */
  const downloadHandler = () => {
    if (!downloadBtnRef.current) return;

    const rect = downloadBtnRef.current.getBoundingClientRect();
    setDownloadPopup({
      top: rect.bottom + window.scrollY - 12,
      left: rect.left + window.scrollX + 12,
    });

    setOnDownload(prev => !prev);
  };
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

  /*--------------------column names--------------- */
  const columnNames = useMemo(() => {
    if (cardView === VIEWTYPE?.LIST && listFilteredData.length > 0) {
      return listFilteredData[0]?.columns?.map((col: any) => col?.label) || [];
    }
    return [];
  }, [listFilteredData, cardView]);
  /*---------------------drop down filter------------------- */
  const filterDropDown = referDoctorMasterListData?.[0]?.columns;

  /*----------------hide show column handler------------ */
  const hideShowHandler = useCallback(() => {
    if (hideShowBtnRef.current) {
      const rect = hideShowBtnRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom - 10,
        left: rect.left + 15,
      });
    }
    setHideShowColumn(prev => !prev);
  }, []);

  /*--------------render component handler----------- */
  const renderComponent = (view: string) => {
    if (error) return <ErrorMessage text={error?.message} />;
    if (!referDoctorConfig || loading || !hasFetched)
      return <div className="initial-message">Loading refer doctor master...</div>;

    if (view === VIEWTYPE?.GRID) {
      if (!gridFilteredData.length || gridFilteredData?.length === 0)
        return <div className="no-data-message">No data found...</div>;
      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map(referDoctor => (
            <GridView
              key={referDoctor?.id}
              data={referDoctor}
              onStatusChange={updateReferDoctorMasterStatus}
              openDrawer={addNewHandler}
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
            onStatusChange={updateReferDoctorMasterStatus}
            columnVisibility={columnVisibility}
            openDrawer={addNewHandler}
          />
        </div>
      );
    }
  };
  return (
    <div className="master-page-size">
      <PageHeader
        title="Refer Doctor Master"
        view={cardView}
        onCardView={handleCardView}
        buttonTitle="Add Refer Doctor"
        onRefresh={handleRefresh}
        onSearch={searchHandler}
        onAddNew={addNewHandler}
        onDownload={downloadHandler}
        onFilter={filterDropDown}
        onToggleColumnModal={hideShowHandler}
        hideShowBtnRef={hideShowBtnRef}
        downloadBtnRef={downloadBtnRef}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {openReferDoctorDrawer && (
        <ReferDoctorMasterDrawer
          isOpen={openReferDoctorDrawer}
          onClose={() => setOpenReferDoctorDrawer(false)}
          referDoctorId={referDoctorIdToEdit}
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

      {!!loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default ReferDoctorMaster;
