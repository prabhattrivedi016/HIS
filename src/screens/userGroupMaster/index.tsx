import { useEffect, useRef, useState } from "react";
import HideShowColumn from "../../components/buttonsPopup";
import DownloadPopup from "../../components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "../../components/customLoader";
import { ErrorMessage } from "../../components/infoText";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard";
import ListView from "../../components/profileCard/components/ListView";
import { ENDPOINTS } from "../../config/defaults";
import { userGroupMaster } from "../../config/masterConfig/userGroupMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import useGlobalApi from "../../hooks/useGlobalApi";
import { exportListViewData } from "../../utils/exportUtils";
import { filteredData } from "../../utils/filteredData";
import { transformDataWithConfig } from "../../utils/utilities";
import GridRightTopButtonMenu from "./components/GridRightTopButtonMenu";
import UserGroupDrawer from "./components/UserGroupDrawer";
import { updateUserGroupStatusProps } from "./type";

const UserGroupMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const { configDataValue, getConfigMasterValue } = useConfigMaster();

  const [userGroupMaterGridData, setUserGroupMasterGridData] = useState([]);
  const [userGroupMasterListData, setUserGroupMasterListData] = useState([]);
  const [gridFilteredData, setGridFilteredData] = useState([]);
  const [listFilteredData, setListFilteredData] = useState([]);

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [errorMessage, setErrorMessage] = useState("");

  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState(null);

  const [downloadPopup, setDownloadPopup] = useState(null);
  const [onDownload, setOnDownload] = useState(false);

  const [openUserGroupDrawer, setOpenUserGroupDrawer] = useState(false);
  const [drawerButtonTitle, setDrawerButtonTitle] = useState("Add New Group");
  const [userGroupDrawerTitle, setUserGroupDrawerTitle] = useState("Add New User Group");
  const [userGroupIdToEdit, setUserGroupIdToEdit] = useState(null);

  const [gridRightTopBtn, setGridRightTopBtn] = useState(false);
  const [gridBtnPopup, setGridBtnPopup] = useState(null);
  const [idGridBtn, setIdGridBtn] = useState(null);

  const hideShowBtnRef = useRef(null);
  const downloadBtnRef = useRef(null);

  const gridCardRightBtnRef = useRef(null);

  // FETCH CONFIG
  useEffect(() => {
    getConfigMasterValue("userGroupMasterConfig");
  }, []);

  // FETCH LIST
  const fetchUserGroupList = async () => {
    try {
      const response = await fetchApi("GET", ENDPOINTS.USER_GROUP_LIST);

      if (!response) {
        setErrorMessage(error || "Something went wrong");
        return;
      }

      const activeConfig = configDataValue || userGroupMaster;
      const transformedData = transformDataWithConfig(activeConfig, response);

      setUserGroupMasterGridData(transformedData.gridView);
      setUserGroupMasterListData(transformedData.listView);
      setGridFilteredData(transformedData.gridView);
      setListFilteredData(transformedData.listView);

      setErrorMessage("");
    } catch (err) {
      console.error("Error fetching user group list", err);
    }
  };

  useEffect(() => {
    fetchUserGroupList();
  }, [configDataValue]);

  // VIEW TOGGLE
  const handleCardView = (view: string) => setCardView(view);

  // SEARCH
  const searchHandler = (keyInput, selectedValue) => {
    const value = keyInput?.toLowerCase()?.trim();
    setSearchQuery(keyInput);

    filteredData({
      value,
      selectedValue,
      listData: userGroupMasterListData,
      gridData: userGroupMaterGridData,
      setListFilteredData,
      setGridFilteredData,
    });
  };

  // REFRESH
  const handleRefresh = () => {
    fetchUserGroupList();
    setSearchQuery("");
  };

  // UPDATE STATUS
  const updateUserGroupStatus = async ({ isActive, id }: updateUserGroupStatusProps) => {
    try {
      await fetchApi("PATCH", ENDPOINTS.UPDATE_USER_GROUP_STATUS, {}, { params: { id, isActive } });
      fetchUserGroupList(false);
    } catch (error) {
      console.error("Error updating user group", error);
    }
  };

  // COLUMN NAMES FOR POPUP
  const columnNames =
    listFilteredData.length > 0 ? listFilteredData[0].columns.map(col => col.label) : [];

  // HIDE/SHOW POPUP
  const hideShowHandler = () => {
    if (!hideShowBtnRef.current) return;

    const rect = hideShowBtnRef.current.getBoundingClientRect();
    setPopupPos({
      top: rect.bottom + window.scrollY - 10,
      left: rect.left + window.scrollX + 10,
    });

    setHideShowColumn(prev => !prev);
  };

  // INITIAL COLUMN VISIBILITY
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const initial = {};
      listFilteredData[0].columns.forEach(col => (initial[col.label] = true));
      setColumnVisibility(initial);
    }
  }, [listFilteredData]);

  // DOWNLOAD POPUP
  const downloadHandler = () => {
    if (!downloadBtnRef.current) return;

    const rect = downloadBtnRef.current.getBoundingClientRect();
    setDownloadPopup({
      top: rect.bottom + window.scrollY - 12,
      left: rect.left + window.scrollX + 12,
    });

    setOnDownload(prev => !prev);
  };
  // ADD NEW USER GROUP HANDLER
  const AddNewHandler = (id: number | null) => {
    if (id) {
      setDrawerButtonTitle("Update Group");
      setUserGroupDrawerTitle("Update Existing Group");
      setUserGroupIdToEdit(id);
    } else {
      setDrawerButtonTitle("Create New group");
      setUserGroupDrawerTitle("Add New User Group");
      setUserGroupIdToEdit(null);
    }
    setOpenUserGroupDrawer(true);
  };

  // card right top handler
  const cardRightTopHandler = (id, rect) => {
    setGridBtnPopup({
      top: rect.bottom + window.scrollY - 5,
      left: rect.left + window.scrollX + 5,
    });
    setIdGridBtn(id);
    setGridRightTopBtn(prev => !prev);
  };
  // RENDER
  const renderComponent = (view: string) => {
    if (errorMessage) return <ErrorMessage text={errorMessage} />;

    if (loading) return <div className="initial-message">Loading user group master...</div>;

    if (view === VIEWTYPE.GRID) {
      if (gridFilteredData.length === 0)
        return <div className="no-data-message">No data found...</div>;
      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map((user, index) => (
            <GridView
              key={index}
              data={user}
              onStatusChange={updateUserGroupStatus}
              openDrawer={AddNewHandler}
              buttonTitle={setDrawerButtonTitle}
              drawerTitle={setUserGroupDrawerTitle}
              cardRightTopBtn={cardRightTopHandler}
              gridRightBtnRef={gridCardRightBtnRef}
            />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE.LIST) {
      if (listFilteredData.length === 0)
        return <div className="no-data-message">No data found...</div>;
      return (
        <div className="list-view-page-layout">
          <ListView
            data={listFilteredData}
            columnVisibility={columnVisibility}
            onStatusChange={updateUserGroupStatus}
            openDrawer={AddNewHandler}
            buttonTitle={setDrawerButtonTitle}
            drawerTitle={setUserGroupDrawerTitle}
          />
        </div>
      );
    }
  };

  return (
    <div className="master-page-size">
      <PageHeader
        title="User Group Master"
        buttonTitle="Add User Group"
        view={cardView}
        onCardView={handleCardView}
        onSearch={searchHandler}
        searchValue={searchQuery}
        onRefresh={handleRefresh}
        onFilter={userGroupMasterListData[0]?.columns || []}
        onToggleColumnModal={hideShowHandler}
        hideShowBtnRef={hideShowBtnRef}
        downloadBtnRef={downloadBtnRef}
        onDownload={downloadHandler}
        onAddNew={AddNewHandler}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {loading && <CustomLoader isLoading={loading} />}

      {/* HIDE/SHOW POPUP */}
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
            exportListViewData(listFilteredData, "UserGroupList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "UserGroupList", "excel");
            setOnDownload(false);
          }}
        />
      )}

      {/* ADD NEW USER GROUP DRAWER */}
      {openUserGroupDrawer ? (
        <UserGroupDrawer
          isOpen={openUserGroupDrawer}
          onClose={() => setOpenUserGroupDrawer(false)}
          buttonTitle={drawerButtonTitle}
          drawerTitle={userGroupDrawerTitle}
          onCloseDrawer={handleRefresh}
          id={userGroupIdToEdit}
        />
      ) : (
        <></>
      )}

      {/* grid right top button popup handler */}
      {gridRightTopBtn ? (
        <GridRightTopButtonMenu
          userGroupId={idGridBtn}
          position={gridBtnPopup}
          onClose={() => setGridRightTopBtn(false)}
          girdRef={gridCardRightBtnRef}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default UserGroupMaster;
