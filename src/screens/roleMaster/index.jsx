import { useEffect, useMemo, useRef, useState } from "react";
import HideShowColumn from "../../components/buttonsPopup";
import DownloadPopup from "../../components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "../../components/customLoader";
import { ErrorMessage } from "../../components/infoText";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard";
import ListView from "../../components/profileCard/components/ListView";
import { ENDPOINTS } from "../../config/defaults";
import { roleMasterConfig } from "../../config/masterConfig/roleMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import useGlobalApi from "../../hooks/useGlobalApi";
import { exportListViewData } from "../../utils/exportUtils";
import { filteredData } from "../../utils/filteredData";
import { transformDataWithConfig } from "../../utils/utilities";
import RoleMasterDrawer from "./components/RoleMasterDrawer";

const RoleMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { configDataValue, getConfigMasterValue } = useConfigMaster();

  const [roleMaterGridData, setRoleMasterGridData] = useState([]);
  const [roleMasterListData, setRoleMasterListData] = useState([]);

  const [gridFilteredData, setGridFilteredData] = useState([]);
  const [listFilteredData, setListFilteredData] = useState([]);

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [openRoleDrawer, setOpenRoleDrawer] = useState(false);
  const [drawerButtonTitle, setDrawerButtonTitle] = useState("Create New Role");
  const [roleDrawerTitle, setRoleDrawerTitle] = useState("Add New Role");
  const [roleIdToEdit, setRoleIdToEdit] = useState(null);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState(null);

  const [onDownload, setOnDownload] = useState(false);
  const [downloadPopup, setDownloadPopup] = useState(null);

  const hideShowBtnRef = useRef(null);
  const downloadBtnRef = useRef(null);

  // FETCH CONFIG
  const fetchConfigRoleMaster = async () => {
    try {
      await getConfigMasterValue("roleMaster");
    } catch (err) {
      console.error("Error fetching roleMaster config:", err);
    }
  };

  useEffect(() => {
    fetchConfigRoleMaster();
  }, []);

  // FETCH ROLE MASTER LIST
  const fetchRoleMasterData = async (roleId = null) => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.ROLE_MASTER_LIST,
      {},
      roleId ? { params: { roleId } } : {}
    );

    if (!response) {
      setErrorMessage(error || "Something went wrong");
      return;
    }

    const activeConfig = configDataValue || roleMasterConfig;
    const transformed = transformDataWithConfig(activeConfig, response);

    setRoleMasterGridData(transformed.gridView);
    setRoleMasterListData(transformed.listView);

    setGridFilteredData(transformed.gridView);
    setListFilteredData(transformed.listView);

    setErrorMessage("");
  };

  useEffect(() => {
    fetchRoleMasterData();
  }, []);

  // INITIAL COLUMN VISIBILITY
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const visibility = {};
      listFilteredData[0].columns.forEach(col => {
        visibility[col.label] = true;
      });
      setColumnVisibility(visibility);
    }
  }, [listFilteredData]);

  // CARD VIEW HANDLER
  const handleCardView = view => setCardView(view);

  // UPDATE ROLE STATUS
  const updateRoleMasterStatus = async ({ isActive, roleId }) => {
    await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_ROLE_MASTER_STATUS,
      {},
      { params: { roleId, isActive } }
    );
    fetchRoleMasterData();
  };

  // REFRESH
  const handleRefresh = () => {
    fetchRoleMasterData();
    setSearchQuery("");
  };

  // SEARCH HANDLER
  const searchHandler = (keyInput, selectedValue) => {
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
  };

  // ADD / UPDATE ROLE
  const addNewHandler = id => {
    if (id) {
      setDrawerButtonTitle("Update Role");
      setRoleDrawerTitle("Update Existing Role");
      setRoleIdToEdit(id);
    } else {
      setDrawerButtonTitle("Create New Role");
      setRoleDrawerTitle("Add New Role");
      setRoleIdToEdit(null);
    }
    setOpenRoleDrawer(true);
  };

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

  // HIDE SHOW COLUMN HANDLER
  const hideShowHandler = () => {
    if (!hideShowBtnRef.current) return;

    const rect = hideShowBtnRef.current.getBoundingClientRect();
    setPopupPos({
      top: rect.bottom + window.scrollY - 10,
      left: rect.left + window.scrollX + 10,
    });

    setHideShowColumn(prev => !prev);
  };

  // COLUMN NAMES
  const columnNames = useMemo(() => {
    return listFilteredData.length > 0 ? listFilteredData[0].columns.map(col => col.label) : [];
  }, [listFilteredData]);

  // DROPDOWN FILTER
  const filterDropDown = roleMasterListData[0]?.columns;

  // RENDER GRID / LIST
  const renderComponent = view => {
    if (errorMessage || error) return <ErrorMessage text={errorMessage || error} />;
    if (loading) return <div className="initial-message">Loading role master...</div>;

    if (view === VIEWTYPE.GRID) {
      if (!gridFilteredData.length) return <div className="no-data-message">No data found...</div>;
      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map((role, index) => (
            <GridView
              key={index}
              data={role}
              onStatusChange={updateRoleMasterStatus}
              openDrawer={addNewHandler}
              buttonTitle={setDrawerButtonTitle}
              drawerTitle={setRoleDrawerTitle}
            />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE.LIST) {
      if (!listFilteredData.length) return <div className="no-data-message">No data found...</div>;
      return (
        <div className="list-view-page-layout">
          <ListView
            data={listFilteredData}
            onStatusChange={updateRoleMasterStatus}
            columnVisibility={columnVisibility}
            openDrawer={addNewHandler}
            buttonTitle={setDrawerButtonTitle}
            drawerTitle={setRoleDrawerTitle}
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
        buttonTitle="Add New Role"
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
        <div className="fixed inset-0 z-999">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <RoleMasterDrawer
            isOpen={openRoleDrawer}
            onClose={() => setOpenRoleDrawer(false)}
            buttonTitle={drawerButtonTitle}
            drawerTitle={roleDrawerTitle}
            roleId={roleIdToEdit}
            onCloseDrawer={handleRefresh}
          />
        </div>
      )}

      {loading && <CustomLoader isLoading={loading} />}

      {/* Hide/Show Columns Popup */}
      {hideShowColumn && popupPos && (
        <HideShowColumn
          columnNames={columnNames}
          anchorRef={hideShowBtnRef}
          position={popupPos}
          onClose={() => setHideShowColumn(false)}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
        />
      )}

      {/* DOWNLOAD POPUP */}
      {onDownload && downloadPopup && (
        <DownloadPopup
          anchorRef={downloadBtnRef}
          position={downloadPopup}
          onClose={() => setOnDownload(false)}
          onDownloadPdf={() => {
            exportListViewData(listFilteredData, "RoleMasterList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "RoleMasterList", "excel");
            setOnDownload(false);
          }}
        />
      )}
    </div>
  );
};

export default RoleMaster;
