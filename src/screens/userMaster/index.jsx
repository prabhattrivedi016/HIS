import { useEffect, useMemo, useRef, useState } from "react";
import HideShowColumn from "../../components/buttonsPopup";
import DownloadPopup from "../../components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "../../components/customLoader";
import FormComponent from "../../components/formComponent/FormComponent";
import { ErrorMessage } from "../../components/infoText";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard";
import ListView from "../../components/profileCard/components/ListView";
import { ENDPOINTS } from "../../config/defaults";
import { formConfig } from "../../config/formConfig/formConfig";
import { userMasterConfig } from "../../config/masterConfig/userMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import useGlobalApi from "../../hooks/useGlobalApi";
import { exportListViewData } from "../../utils/exportUtils";
import { filteredData } from "../../utils/filteredData";
import { transformDataWithConfig } from "../../utils/utilities";

const UserMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { configDataValue, getConfigMasterValue } = useConfigMaster();

  const [userMasterGridData, setUserMasterGridData] = useState([]);
  const [userMasterListData, setUserMasterListData] = useState([]);
  const [gridFilteredData, setGridFilteredData] = useState([]);
  const [listFilteredData, setListFilteredData] = useState([]);

  const [openFormComponent, setOpenFormComponent] = useState("");
  const [drawerButtonTitle, setDrawerButtonTitle] = useState("Create New User");
  const [userDrawerTitle, setUserDrawerTitle] = useState("Add New User");
  const [openAddNewUser, setOpenAddNewUser] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [errorMessage, setErrorMessage] = useState("");
  const [popupPos, setPopupPos] = useState(null);
  const [downloadPopup, setDownloadPopup] = useState(null);
  const [onDownload, setOnDownload] = useState(false);

  const hideShowBtnRef = useRef(null);
  const downloadBtnRef = useRef(null);

  // fetch config for user master
  const fetchConfig = async () => {
    try {
      await getConfigMasterValue("userMaster");
    } catch (err) {
      console.error("Error fetching User Master config, using fallback:", err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // fetch user master list
  const fetchUserMasterListData = async (userId = "") => {
    const options = userId ? { params: { userId } } : {};
    const response = await fetchApi("GET", ENDPOINTS.USER_MASTER_LIST, {}, options);

    if (!response) {
      return;
    }

    const apiResponse = response || [];
    const activeConfig = configDataValue || userMasterConfig;
    const transformedData = transformDataWithConfig(activeConfig, apiResponse);

    setUserMasterGridData(transformedData?.gridView || []);
    setUserMasterListData(transformedData?.listView || []);
    setGridFilteredData(transformedData?.gridView || []);
    setListFilteredData(transformedData?.listView || []);
  };

  useEffect(() => {
    fetchUserMasterListData();
  }, []);

  // initialize column visibility when list data arrives
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const firstRow = listFilteredData[0]?.columns || [];
      const visibilityState = {};
      firstRow.forEach(col => {
        visibilityState[col.label] = true; // all visible by default
      });
      setColumnVisibility(visibilityState);
    }
  }, [listFilteredData]);

  // handle card view change
  const handleCardView = cardType => {
    setCardView(cardType);
  };

  // update user status
  const updateUserMasterStatus = async ({ isActive, userId }) => {
    const options = { params: { userId, isActive } };
    const response = await fetchApi("PATCH", ENDPOINTS.UPDATE_USER_MASTER_STATUS, {}, options);
    if (!response) {
      return;
    }
    fetchUserMasterListData();
  };

  // handle refresh
  const handleRefresh = () => {
    fetchUserMasterListData();
    setSearchQuery("");
  };

  // search handler
  const searchHandler = (keyInput = "", selectedValue = "") => {
    const value = keyInput?.toLowerCase()?.trim() || "";
    setSearchQuery(keyInput || "");

    filteredData({
      value,
      selectedValue,
      listData: userMasterListData,
      gridData: userMasterGridData,
      setListFilteredData,
      setGridFilteredData,
    });
  };

  // add or edit user
  const addNewHandler = userId => {
    if (typeof userId === "number") {
      setDrawerButtonTitle("Update User");
      setUserDrawerTitle("Update Existing User");
      setOpenFormComponent(userId);
      setOpenAddNewUser(false);
    } else {
      setOpenAddNewUser(true);
      setDrawerButtonTitle("Add New User");
      setUserDrawerTitle("Add New User");
      setOpenFormComponent("");
    }
  };

  // show form drawer flag
  const showFormDrawer = useMemo(() => {
    return !!openFormComponent || openAddNewUser;
  }, [openFormComponent, openAddNewUser]);

  // DOWNLOAD POPUP HANDLER
  const downloadHandler = e => {
    if (!downloadBtnRef.current) return;
    const rect = downloadBtnRef.current.getBoundingClientRect();
    setDownloadPopup({
      top: rect.bottom + window.scrollY - 12,
      left: rect.left + window.scrollX + 12,
    });
    setOnDownload(prev => !prev);
  };

  // HIDE SHOW COLUMN HANDLER
  const hideShowHandler = e => {
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
  const filterDropDown = userMasterListData[0]?.columns || [];

  // render helper
  const renderComponent = view => {
    if (error) {
      return <ErrorMessage text={errorMessage || error} />;
    }
    if (loading) {
      return <div className="initial-message">Loading user master...</div>;
    }

    if (view === VIEWTYPE.GRID) {
      if (gridFilteredData.length === 0) {
        return <div className="no-data-message">No data found...</div>;
      }
      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map((user, index) => (
            <GridView
              key={index}
              data={user}
              onStatusChange={updateUserMasterStatus}
              openDrawer={addNewHandler}
              buttonTitle={setDrawerButtonTitle}
              drawerTitle={setUserDrawerTitle}
            />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE.LIST) {
      if (listFilteredData.length === 0) {
        return <div className="text-center text-gray-500 py-8 text-lg">No data found...</div>;
      }
      return (
        <div className="list-view-page-layout">
          <ListView
            data={listFilteredData}
            onStatusChange={updateUserMasterStatus}
            openDrawer={addNewHandler}
            buttonTitle={setDrawerButtonTitle}
            drawerTitle={setUserDrawerTitle}
            onFilter={filterDropDown}
            columnVisibility={columnVisibility}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="master-page-size">
      <PageHeader
        title="User Master"
        onCardView={handleCardView}
        view={cardView}
        buttonTitle="Add New User"
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

      {showFormDrawer && (
        <div className="fixed inset-0 z-999">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <FormComponent
            isOpen={showFormDrawer}
            onClose={() => {
              setOpenFormComponent("");
              setOpenAddNewUser(false);
            }}
            buttonTitle={drawerButtonTitle}
            drawerTitle={userDrawerTitle}
            formConfig={formConfig}
            userId={openFormComponent}
            refreshData={fetchUserMasterListData}
          />
        </div>
      )}

      {loading && <CustomLoader isLoading={loading} />}

      {/* hide/show column popup */}
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
            exportListViewData(listFilteredData, "UserMasterList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "UserMasterList", "excel");
            setOnDownload(false);
          }}
        />
      )}
    </div>
  );
};

export default UserMaster;
