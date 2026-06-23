import HideShowColumn from "@/components/buttonsPopup";
import DownloadPopup from "@/components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage } from "@/components/infoText";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { corporateMasterConfig } from "@/config/masterConfig/corporateMasterConfig";
import { VIEWTYPE } from "@/constants/constants";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGlobalApi from "@/hooks/useGlobalApi";
import { ColumnVisibility } from "@/types";
import { exportListViewData } from "@/utils/exportUtils";
import { filteredData } from "@/utils/filteredData";
import { transformDataWithConfig } from "@/utils/utilities";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddNewCorporateMaster from "./components/AddNewCorporateMaster";
import { CorporateMasterGridItem, CorporateMasterListItem } from "./types";

const CorporateMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const config = useConfigMaster("corporateMaster");
  const corporateConfig = config?.configDataValue;

  const [corporateMasterGridData, setCorporateMasterGridData] = useState<CorporateMasterGridItem[]>(
    []
  );
  const [corporateMasterListData, setCorporateMasterListData] = useState<CorporateMasterListItem[]>(
    []
  );

  const [gridFilteredData, setGridFilteredData] = useState<CorporateMasterGridItem[]>([]);
  const [listFilteredData, setListFilteredData] = useState<CorporateMasterListItem[]>([]);

  const [corporateIdToEdit, setCorporateIdToEdit] = useState<number | null>(null);
  const [renderCorporateMasterDrawer, setRenderCorporateMasterDrawer] = useState<boolean>(false);
  const [openCorporateMasterDrawer, setOpenCorporateMasterDrawer] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [onDownload, setOnDownload] = useState<boolean>(false);
  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);

  const [cardView, setCardView] = useState(VIEWTYPE?.GRID);

  const downloadBtnRef = useRef<HTMLButtonElement>(null);

  const [hideShowColumn, setHideShowColumn] = useState<boolean>(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const hideShowBtnRef = useRef<HTMLButtonElement>(null);

  const getCorporateMaster = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_MASTER_LIST,
      {},
      {},
      { component: "ReferDoctorMaster" }
    );

    const activeConfig = corporateConfig ?? corporateMasterConfig;
    const transformed = transformDataWithConfig(activeConfig, resp);

    setCorporateMasterGridData(transformed?.gridView ?? []);
    setCorporateMasterListData(transformed.listView ?? []);

    setGridFilteredData(transformed.gridView ?? []);
    setListFilteredData(transformed.listView ?? []);

    setHasFetched(true);
  }, []);

  useEffect(() => {
    if (corporateConfig) {
      getCorporateMaster();
    }
  }, [corporateConfig]);

  // card view handler
  const handleCardView = (view: string) => setCardView(view);

  // create update corporate master
  const addNewHandler = (id: number | null) => {
    if (id) {
      setCorporateIdToEdit(id);
    } else {
      setCorporateIdToEdit(null);
    }
    setRenderCorporateMasterDrawer(true);
    setOpenCorporateMasterDrawer(true);
  };

  // /update corporate master status
  const updateReferDoctorMasterStatus = async ({
    isActive,
    corporateId,
  }: {
    isActive: number;
    corporateId?: number;
  }) => {
    console.log("corporateId", corporateId);

    if (!corporateId) return;
    await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_CORPORATE_MASTER_STATUS,
      {},
      { params: { corporateId, isActive } },
      {
        component: "CorporateMaster",
      }
    );
    getCorporateMaster();
  };

  // close handler
  const closeHandler = useCallback(() => {
    setOpenCorporateMasterDrawer(false);
    setCorporateIdToEdit(null);
  }, []);

  // search handler----------------
  const searchHandler = useCallback(
    (keyInput: string, selectedValue?: string) => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue: selectedValue || "",
        listData: corporateMasterListData,
        gridData: corporateMasterGridData,
        setListFilteredData,
        setGridFilteredData: setGridFilteredData as any,
      });
    },
    [corporateMasterListData, corporateMasterGridData]
  );

  // download popup handler----------
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
      listFilteredData?.[0].columns.forEach(col => {
        visibility[col?.label] = true;
      });
      setColumnVisibility(visibility);
    }
  }, [listFilteredData]);

  /*------------------handle refresh--------------------- */
  const handleRefresh = useCallback(async () => {
    await getCorporateMaster();
    setSearchQuery("");
  }, [getCorporateMaster]);

  // column names---------------
  const columnNames = useMemo(() => {
    if (cardView === VIEWTYPE?.LIST && listFilteredData.length > 0) {
      return listFilteredData[0]?.columns?.map((col: any) => col?.label) || [];
    }
    return [];
  }, [listFilteredData, cardView]);

  /*---------------------drop down filter------------------- */
  const filterDropDown = corporateMasterListData?.[0]?.columns;

  // hide show column handler------------
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

  // render component
  const renderComponent = (view: string) => {
    if (error) return <ErrorMessage text={error?.message} />;
    if (!corporateConfig || loading || !hasFetched)
      return <div className="initial-message">Loading corporate master...</div>;

    if (view === VIEWTYPE?.GRID) {
      if (!gridFilteredData.length || gridFilteredData?.length === 0)
        return <div className="no-data-message">No data found...</div>;
      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map(corporate => (
            <GridView
              key={corporate?.id}
              data={corporate}
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
        title="Corporate Master"
        view={cardView}
        onCardView={handleCardView}
        buttonTitle="Add Corporate"
        onRefresh={handleRefresh}
        onSearch={searchHandler}
        onAddNew={addNewHandler}
        onDownload={downloadHandler}
        onFilter={filterDropDown}
        onToggleColumnModal={hideShowHandler}
        hideShowBtnRef={hideShowBtnRef as React.RefObject<HTMLElement>}
        downloadBtnRef={downloadBtnRef as React.RefObject<HTMLElement>}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {/* corporate drawer */}
      {!!renderCorporateMasterDrawer && (
        <AddNewCorporateMaster
          isOpen={openCorporateMasterDrawer}
          onClose={closeHandler}
          corporateId={corporateIdToEdit}
          refreshData={getCorporateMaster}
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
            exportListViewData(transformedData, "CorporateMaster", "pdf");
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
            exportListViewData(transformedData, "CorporateMaster", "excel");
            setOnDownload(false);
          }}
        />
      )}

      {!!loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default CorporateMaster;
