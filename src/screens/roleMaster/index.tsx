import { roleMasterConfig } from "@/config/masterConfig/roleMasterConfig";
import { ColumnVisibility } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HideShowColumn from "../../components/buttonsPopup";
import DownloadPopup from "../../components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "../../components/customLoader";
import { ErrorMessage } from "../../components/infoText";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard";
import ListView from "../../components/profileCard/components/ListView";
import { ENDPOINTS } from "../../config/defaults";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import useGlobalApi from "../../hooks/useGlobalApi";
import { exportListViewData } from "../../utils/exportUtils";
import { filteredData } from "../../utils/filteredData";
import { transformDataWithConfig } from "../../utils/utilities";
import RoleMasterDrawer from "./components/RoleMasterDrawer";
import { roleMasterGridItem, roleMasterListItem } from "./type";

const RoleMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const configValue = useConfigMaster("roleMaster");
  const roleConfig = configValue?.configDataValue;

  const [roleMaterGridData, setRoleMasterGridData] = useState<roleMasterGridItem[]>([]);
  const [roleMasterListData, setRoleMasterListData] = useState<roleMasterListItem[]>([]);

  const [gridFilteredData, setGridFilteredData] = useState<roleMasterGridItem[]>([]);
  const [listFilteredData, setListFilteredData] = useState<roleMasterListItem[]>([]);

  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [openRoleDrawer, setOpenRoleDrawer] = useState(false);

  const [roleIdToEdit, setRoleIdToEdit] = useState<number | null>(null);

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [hideShowColumn, setHideShowColumn] = useState<boolean>(false);

  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const [onDownload, setOnDownload] = useState<boolean>(false);

  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);

  const hideShowBtnRef = useRef<HTMLButtonElement>(null);

  const downloadBtnRef = useRef<HTMLButtonElement>(null);

  /*------------------role master data---------------------- */

  const fetchRoleMasterData = async (roleId = null) => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.ROLE_MASTER_LIST,
      {},
      roleId ? { params: { roleId } } : {},
      { component: "RoleMaster" }
    );

    const activeConfig = roleConfig || roleMasterConfig;
    const transformed = transformDataWithConfig(activeConfig, response);

    setRoleMasterGridData(transformed.gridView ?? []);
    setRoleMasterListData(transformed.listView ?? []);

    setGridFilteredData(transformed.gridView ?? []);
    setListFilteredData(transformed.listView ?? []);

    setHasFetched(true);
  };

  useEffect(() => {
    if (roleConfig) {
      fetchRoleMasterData();
    }
  }, [roleConfig]);

  /*--------------------card view handler---------- */

  const handleCardView = (view: string) => setCardView(view);

  /*---------------------update doctor master status----------------- */

  const updateRoleMasterStatus = async ({
    isActive,
    roleId,
  }: {
    isActive: number;
    roleId?: number;
  }) => {
    await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_ROLE_MASTER_STATUS,
      {},
      { params: { roleId, isActive } },
      { component: "RoleMaster" }
    );
    fetchRoleMasterData();
  };

  /*------------------handle refresh--------------------- */

  const handleRefresh = () => {
    fetchRoleMasterData();
    setSearchQuery("");
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

  /*--------------search handler---------------- */
  const searchHandler = useCallback(
    (keyInput: string, selectedValue: string) => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue,
        listData: roleMasterListData,
        gridData: roleMaterGridData,
        setListFilteredData,
        setGridFilteredData,
      });
    },
    [roleMasterListData, roleMaterGridData]
  );

  /*------------------add update role master-------------------------- */

  const addNewHandler = (id: number | null) => {
    if (id) {
      setRoleIdToEdit(id);
    } else {
      setRoleIdToEdit(null);
    }
    setOpenRoleDrawer(true);
  };

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

  /*----------------hide show column handler------------ */

  const hideShowHandler = () => {
    if (!hideShowBtnRef.current) return;

    const rect = hideShowBtnRef.current.getBoundingClientRect();
    setPopupPos({
      top: rect.bottom + window.scrollY - 10,
      left: rect.left + window.scrollX + 10,
    });

    setHideShowColumn(prev => !prev);
  };

  /*--------------------column names--------------- */

  const columnNames = useMemo(() => {
    if (cardView === VIEWTYPE?.LIST && listFilteredData.length > 0) {
      return listFilteredData[0]?.columns?.map((col: any) => col?.label) || [];
    }
    return [];
  }, [listFilteredData, cardView]);

  /*---------------------drop down filter------------------- */

  const filterDropDown = roleMasterListData?.[0]?.columns;

  /*-----------------------drawer handler---------------------- */
  const closeHandler = useCallback(() => {
    setOpenRoleDrawer(false);
  }, []);

  /*----------------------------render grid & list view component------------------------ */
  const renderComponent = (view: string) => {
    if (error) return <ErrorMessage text={error?.message} />;

    if (!roleConfig || loading || !hasFetched)
      return <div className="initial-message">Loading role master...</div>;

    if (view === VIEWTYPE.GRID) {
      if (!gridFilteredData.length || gridFilteredData?.length === 0)
        return <div className="no-data-message">No data found...</div>;

      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map((role, index) => (
            <GridView
              key={index}
              data={role}
              onStatusChange={updateRoleMasterStatus}
              openDrawer={addNewHandler}
            />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE.LIST) {
      if (!listFilteredData.length || listFilteredData?.length === 0)
        return <div className="no-data-message">No data found...</div>;
      return (
        <div className="list-view-page-layout">
          <ListView
            data={listFilteredData}
            onStatusChange={updateRoleMasterStatus}
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
        title="Role Master"
        view={cardView}
        onCardView={handleCardView}
        buttonTitle="Add Role"
        onRefresh={handleRefresh}
        onSearch={searchHandler}
        searchValue={searchQuery}
        onAddNew={addNewHandler}
        onDownload={downloadHandler}
        onFilter={filterDropDown}
        onToggleColumnModal={hideShowHandler}
        hideShowBtnRef={hideShowBtnRef}
        downloadBtnRef={downloadBtnRef}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {openRoleDrawer && (
        <RoleMasterDrawer
          isOpen={openRoleDrawer}
          onClose={closeHandler}
          roleId={roleIdToEdit}
          onCloseDrawer={handleRefresh}
        />
      )}

      {/*---------- Hide/Show Columns Popup ------------*/}
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

      {/*---------------download popup ------------*/}
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
            exportListViewData(transformedData, "RoleMasterList", "pdf");
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
            exportListViewData(transformedData, "RoleMasterList", "excel");
            setOnDownload(false);
          }}
        />
      )}

      {!!loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default RoleMaster;
