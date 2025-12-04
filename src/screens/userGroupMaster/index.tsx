import { GridItem, ListItem } from "@/types/types";
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
import { getDownloadPopupPosition, getHideShowPopupPosition } from "../../utils/popUpPosition";
import { transformDataWithConfig } from "../../utils/utilities";
import GridRightTopButtonMenu from "./components/GridRightTopButtonMenu";
import MapToUserDrawer from "./components/MapToUserDrawer";
import UserGroupDrawer from "./components/UserGroupDrawer";
import { updateUserGroupStatusProps } from "./components/types";

const UserGroupMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const { configDataValue, getConfigMasterValue } = useConfigMaster();
  const [userGroupMaterGridData, setUserGroupMasterGridData] = useState<GridItem[]>([]);
  const [userGroupMasterListData, setUserGroupMasterListData] = useState<ListItem[]>([]);
  const [gridFilteredData, setGridFilteredData] = useState<GridItem[]>([]);
  const [listFilteredData, setListFilteredData] = useState<ListItem[]>([]);

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState(null);

  const [downloadPopup, setDownloadPopup] = useState(null);
  const [onDownload, setOnDownload] = useState(false);

  const [openUserGroupDrawer, setOpenUserGroupDrawer] = useState(false);
  const [drawerButtonTitle, setDrawerButtonTitle] = useState("Add Group");
  const [userGroupDrawerTitle, setUserGroupDrawerTitle] = useState("Add New User Group");
  const [userGroupIdToEdit, setUserGroupIdToEdit] = useState(null);

  const [gridRightTopBtn, setGridRightTopBtn] = useState(false);
  const [gridBtnPopup, setGridBtnPopup] = useState(null);
  const [idGridBtn, setIdGridBtn] = useState(null);

  const [openMapToUserDrawer, setMapToUserDrawer] = useState(false);
  const [mapToUserId, setMapToUserId] = useState(null);

  const hideShowBtnRef = useRef<HTMLElement | null>(null);
  const downloadBtnRef = useRef<HTMLElement | null>(null);

  // fetch config
  useEffect(() => {
    getConfigMasterValue("userGroupMasterConfig");
  }, []);

  // fetch user group list
  const fetchUserGroupList = async () => {
    try {
      const response = await fetchApi("GET", ENDPOINTS.USER_GROUP_LIST);

      if (!response) {
        return;
      }

      const activeConfig = configDataValue || userGroupMaster;
      const transformedData = transformDataWithConfig(activeConfig, response);

      setUserGroupMasterGridData(transformedData.gridView);
      setUserGroupMasterListData(transformedData.listView);
      setGridFilteredData(transformedData.gridView);
      setListFilteredData(transformedData.listView);
    } catch (err) {
      console.error("Error fetching user group list", err);
    }
  };

  useEffect(() => {
    fetchUserGroupList();
  }, []);

  //toggle view handler
  const handleCardView = (view: string) => setCardView(view);

  // Search handler
  const searchHandler = (keyInput: string, selectedValue: string) => {
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

  // refresh handler
  const handleRefresh = () => {
    fetchUserGroupList();
    setSearchQuery("");
  };

  // update status handler
  const updateUserGroupStatus = async ({ isActive, id }: updateUserGroupStatusProps) => {
    try {
      await fetchApi("PATCH", ENDPOINTS.UPDATE_USER_GROUP_STATUS, {}, { params: { id, isActive } });
      fetchUserGroupList();
    } catch (error) {
      console.error("Error updating user group", error);
    }
  };

  // column names
  const columnNames =
    listFilteredData.length > 0 ? listFilteredData[0].columns.map(col => col.label) : [];

  // hide show popup handler
  const hideShowHandler = () => {
    if (!hideShowBtnRef.current) return;

    const pos = getHideShowPopupPosition(hideShowBtnRef);

    if (!pos) return;

    setPopupPos(pos);
    setHideShowColumn(prev => !prev);
  };

  // download popup
  const downloadHandler = () => {
    const position = getDownloadPopupPosition(downloadBtnRef);

    if (!position) return;

    setDownloadPopup(position);
    setOnDownload(prev => !prev);
  };

  // initial column visibility
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const initial = {};
      listFilteredData[0].columns.forEach(col => (initial[col.label] = true));
      setColumnVisibility(initial);
    }
  }, [listFilteredData]);

  // add new group handler
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

  // map to user handler
  const mapToUserHandler = (id: number) => {
    setMapToUserId(id);

    setMapToUserDrawer(true);
  };

  // RENDER
  const renderComponent = (view: string) => {
    if (error) return <ErrorMessage text={error} />;

    if (loading) return <div className="initial-message">Loading user group...</div>;

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
              mapToUser={mapToUserHandler}
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
        title="User Group "
        buttonTitle="Add Group"
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

      {/* hide/show popup */}
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
          onRefresh={handleRefresh}
          onStatusChange={updateUserGroupStatus}
        />
      ) : (
        <></>
      )}

      {/* map to user drawer */}
      {openMapToUserDrawer ? (
        <MapToUserDrawer
          isOpen={openMapToUserDrawer}
          onClose={() => setMapToUserDrawer(false)}
          groupId={mapToUserId}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default UserGroupMaster;
