import { GridItem, ListItem } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import HideShowColumn from "../../components/buttonsPopup";
import DownloadPopup from "../../components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "../../components/customLoader/index";
import PageHeader from "../../components/pageHeader";
import ListView from "../../components/profileCard/components/ListView";
import GridView from "../../components/profileCard/index";
import { ENDPOINTS } from "../../config/defaults";
import { userDepartmentConfig } from "../../config/masterConfig/userDepartmentConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import useGlobalApi from "../../hooks/useGlobalApi";
import { exportListViewData } from "../../utils/exportUtils";
import { filteredData } from "../../utils/filteredData";
import { getDownloadPopupPosition, getHideShowPopupPosition } from "../../utils/popUpPosition";
import { transformDataWithConfig } from "../../utils/utilities";
import { UpdateUserDeptStatusProps } from "./components/types";
import UserDeptDrawer from "./components/UserDeptDrawer";

const UserDepartment = () => {
  const { loading, fetchApi } = useGlobalApi();
  const { configDataValue, getConfigMasterValue } = useConfigMaster();

  const [userDepartmentGrid, setUserDepartmentGrid] = useState<GridItem[]>([]);
  const [userDepartmentList, setUserDepartmentList] = useState<ListItem[]>([]);
  const [gridFilteredData, setGridFilteredData] = useState<GridItem[]>([]);
  const [listFilteredData, setListFilteredData] = useState<ListItem[]>([]);
  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [openUserDeptDrawer, setOpenUserDeptDrawer] = useState(false);
  const [drawerButtonTitle, setDrawerButtonTitle] = useState("Add Department");
  const [drawerTitle, setDrawerTitle] = useState("Add New Department");
  const [userDepIdToEdit, setUserDeptIdToEdit] = useState<number | null>(null);

  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);
  const [onDownload, setOnDownload] = useState(false);

  const hideShowBtnRef = useRef<HTMLElement | null>(null);
  const downloadBtnRef = useRef<HTMLElement | null>(null);

  // config data value
  // fetch config
  useEffect(() => {
    getConfigMasterValue("userDepartment");
  }, []);

  //   fetch user department
  const getUserDepartmentList = async () => {
    try {
      const response = await fetchApi("GET", ENDPOINTS.GET_DEPARTMENT_LIST, {});
      if (!response) return;
      const activeConfig = configDataValue || userDepartmentConfig;
      const transformedData = transformDataWithConfig(activeConfig, response);
      setUserDepartmentGrid(transformedData?.gridView);
      setUserDepartmentList(transformedData?.listView);

      setGridFilteredData(transformedData?.gridView);
      setListFilteredData(transformedData?.listView);
    } catch (error) {
      console.error("Error while fetching user department list", error);
    }
  };
  useEffect(() => {
    getUserDepartmentList();
  }, []);

  //   toggle view handler
  const handleCardView = (view: string) => setCardView(view);

  // initial column visibility
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const initial = {};
      listFilteredData[0].columns.forEach(col => (initial[col.label] = true));
      setColumnVisibility(initial);
    }
  }, [listFilteredData]);

  //   add new department handler
  const AddNewHandler = (id: number | null) => {
    if (id) {
      setDrawerButtonTitle("Update Department");
      setDrawerTitle("Update Existing Department");
      setUserDeptIdToEdit(id);
    } else {
      setDrawerButtonTitle("Create New Dept");
      setDrawerTitle("Add New User Department");
      setUserDeptIdToEdit(null);
    }
    setOpenUserDeptDrawer(true);
  };

  //   status update handler
  const updateUserDeptStatus = async ({ isActive, id }: UpdateUserDeptStatusProps) => {
    try {
      const response = await fetchApi(
        "PATCH",
        ENDPOINTS.UPDATE_USER_DEPARTMENT_STATUS,
        {},
        {
          params: { id, isActive },
        }
      );

      if (!response) return;
      getUserDepartmentList();
    } catch (error) {
      console.error("Error while update status of user department", error);
    }
  };

  //   search handler
  const searchHandler = (keyInput: string, selectedValue: string) => {
    const value = keyInput?.toLowerCase()?.trim();
    setSearchQuery(keyInput);

    filteredData({
      value,
      selectedValue,
      listData: userDepartmentList,
      gridData: userDepartmentGrid,
      setListFilteredData,
      setGridFilteredData,
    });
  };

  //   refresh handler
  const handleRefresh = () => {
    getUserDepartmentList();
    setSearchQuery("");
  };

  //   column names
  const columnNames =
    listFilteredData.length > 0 ? listFilteredData[0].columns.map(col => col.label) : [];

  // hide show popup handler
  const hideShowHandler = () => {
    if (!hideShowBtnRef.current) return;

    const pos = getHideShowPopupPosition(hideShowBtnRef as React.RefObject<HTMLElement>);

    if (!pos) return;

    setPopupPos(pos);
    setHideShowColumn(prev => !prev);
  };

  // download popup
  const downloadHandler = () => {
    const position = getDownloadPopupPosition(downloadBtnRef as React.RefObject<HTMLElement>);

    if (!position) return;

    setDownloadPopup(position);
    setOnDownload(prev => !prev);
  };

  // render component helper function
  const renderComponent = (view: string) => {
    if (loading) return <div className="initial-message">Loading user department...</div>;

    if (view === VIEWTYPE.GRID) {
      if (gridFilteredData.length === 0)
        return <div className="no-data-message">No data found...</div>;
      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map((user, index) => (
            <GridView
              key={index}
              data={user}
              onStatusChange={updateUserDeptStatus}
              openDrawer={AddNewHandler}
              buttonTitle={setDrawerButtonTitle}
              drawerTitle={setDrawerTitle}
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
            onStatusChange={updateUserDeptStatus}
            openDrawer={AddNewHandler}
            buttonTitle={setDrawerButtonTitle}
            drawerTitle={setDrawerTitle}
          />
        </div>
      );
    }
  };

  return (
    <div className="master-page-size">
      <PageHeader
        title="User Department"
        buttonTitle="Add Department"
        view={cardView}
        onCardView={handleCardView}
        onAddNew={AddNewHandler}
        onSearch={searchHandler}
        searchValue={searchQuery}
        onRefresh={handleRefresh}
        onFilter={userDepartmentList[0]?.columns || []}
        onToggleColumnModal={hideShowHandler}
        hideShowBtnRef={hideShowBtnRef}
        downloadBtnRef={downloadBtnRef}
        onDownload={downloadHandler}
      />
      {/* render component */}
      <div className="w-full">{renderComponent(cardView)}</div>
      {/* loader */}
      {loading && <CustomLoader isLoading={loading} />}
      {/* user department drawer */}
      {openUserDeptDrawer ? (
        <UserDeptDrawer
          isOpen={openUserDeptDrawer}
          onClose={() => setOpenUserDeptDrawer(false)}
          buttonTitle={drawerButtonTitle}
          drawerTitle={drawerTitle}
          deptId={userDepIdToEdit}
        />
      ) : (
        <></>
      )}
      {/* hide show popup */}
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
      {/* download popup */}
      {onDownload && downloadPopup && (
        <DownloadPopup
          anchorRef={downloadBtnRef}
          position={downloadPopup}
          onClose={() => setOnDownload(false)}
          onDownloadPdf={() => {
            exportListViewData(listFilteredData, "UserDepartmentList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "UserDepartmentList", "excel");
            setOnDownload(false);
          }}
        />
      )}
    </div>
  );
};

export default UserDepartment;
