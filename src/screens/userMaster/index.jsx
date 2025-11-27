import { useEffect, useMemo, useRef, useState } from "react";
import { getUserMasterList, updateForUserMasterstatus } from "../../api/userMasterApis";
import CustomLoader from "../../components/customLoader";
import FormComponent from "../../components/formComponent/FormComponent";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard/GridView";
import ListView from "../../components/profileCard/ListView";
import { formConfig } from "../../config/formConfig/formConfig";
import { userMasterConfig } from "../../config/masterConfig/userMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import { exportListViewData } from "../../utils/exportUtils";
import { transformDataWithConfig } from "../../utils/utilities";

const UserMaster = () => {
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
  const [loading, setLoading] = useState(false);
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [downloadList, setDownloadList] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);

  // user master config data value for transforming data
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

  const fetchUserMasterListData = async (updateLoading = true) => {
    try {
      if (updateLoading) {
        setLoading(true);
      }
      const response = await getUserMasterList();
      const apiResponse = response?.data || [];

      const activeConfig = configDataValue || userMasterConfig;

      const transformedData = transformDataWithConfig(activeConfig, apiResponse);

      setUserMasterGridData(transformedData?.gridView);

      setUserMasterListData(transformedData?.listView);

      setGridFilteredData(transformedData?.gridView);
      setListFilteredData(transformedData?.listView);
    } catch (error) {
      console.error("Error fetching User Master list:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMasterListData();
  }, []);

  // closes modal on clicking outside

  const columnPopupRef = useRef(null);
  useClickOutside(columnPopupRef, () => setHideShowColumn(false));

  const downloadPopupRef = useRef(null);
  useClickOutside(downloadPopupRef, () => setDownloadList(false));

  // hide column on the checkbox change
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const firstRow = listFilteredData[0]?.columns || [];
      const visibilityState = {};

      firstRow.forEach(col => {
        visibilityState[col.label] = true; // all columns visible
      });

      setColumnVisibility(visibilityState);
    }
  }, [listFilteredData]);

  // handle card view change
  const handleCardView = cardType => {
    setCardView(cardType);
  };

  // update status
  const updateUserMasterStatus = async ({ isActive, userId }) => {
    try {
      setLoading(true);
      await updateForUserMasterstatus({ isActive, userId });
      fetchUserMasterListData(false);
    } catch (error) {
      console.log("error while updating user status", error?.message);
    }
  };

  // handle refresh
  const handleRefresh = () => {
    fetchUserMasterListData();
    setSearchQuery("");
  };

  // handle search
  const searchHandler = (keyInput, selectedValue) => {
    const value = keyInput?.toLowerCase()?.trim();

    if (!value && !selectedValue) {
      setListFilteredData(userMasterListData);
      setGridFilteredData(userMasterGridData);
      return;
    }

    // LIST SEARCH
    const filteredListData = userMasterListData.filter(item => {
      if (selectedValue) {
        const col = item.columns?.find(c => c.label === selectedValue);

        if (!col) return false;

        if (selectedValue === "Status") {
          const statusText = col.value === 1 ? "active" : "inactive";
          return col.value?.toString().includes(value) || statusText.includes(value);
        }

        return col.value?.toString().toLowerCase().includes(value);
      }

      // GLOBAL
      return item.columns?.some(c => c.value?.toString().toLowerCase().includes(value));
    });

    // GRID SEARCH
    const filteredGridData = userMasterGridData.filter(item =>
      item.cardTitle?.some(titleObj => titleObj.value?.toString().toLowerCase().includes(value))
    );

    setListFilteredData(filteredListData);
    setGridFilteredData(filteredGridData);
  };

  // add new user handler
  const addNewHandler = userId => {
    if (typeof userId === "number") {
      setDrawerButtonTitle("Update User");
      setUserDrawerTitle("Update Existing User");
      setOpenFormComponent(userId);
    } else {
      setOpenAddNewUser(true);
      setDrawerButtonTitle("Add New User");
      setUserDrawerTitle("Add New User");
    }
  };

  // dynamic form drawer
  const showFormDrawer = useMemo(() => {
    if (!!openFormComponent || openAddNewUser) {
      return true;
    } else return false;
  }, [openFormComponent, openAddNewUser]);

  // download user master list
  const downloadHandler = e => {
    const rect = e.target.getBoundingClientRect();

    let top = rect.bottom + window.scrollY + 5;
    let left = rect.left + window.scrollX;

    // SIMPLE RESPONSIVE FIX
    left = Math.min(left, window.innerWidth - 180); // popup width ~180px
    left = Math.max(10, left);

    setPopupPos({ top, left });
    setDownloadList(prev => !prev);
  };

  // on filter dropdown
  const filterDropDown = userMasterListData[0]?.columns;

  // hide show column handler for list view
  const hideShowHandler = e => {
    const rect = e.target.getBoundingClientRect();

    let top = rect.bottom + window.scrollY + 5;
    let left = rect.left + window.scrollX;

    // SIMPLE RESPONSIVE FIX
    left = Math.min(left, window.innerWidth - 220); // column popup width
    left = Math.max(10, left);

    setPopupPos({ top, left });
    setHideShowColumn(prev => !prev);
  };

  // get column names
  const columnNames =
    listFilteredData.length > 0 ? listFilteredData[0].columns.map(col => col.label) : [];

  // render component
  const renderComponent = view => {
    if (loading) {
      return <div className="text-center text-gray-500 py-8 text-lg">Loading user master...</div>;
    }

    if (view === VIEWTYPE?.GRID) {
      if (gridFilteredData.length === 0) {
        return <div className="text-center text-gray-500 py-8 text-lg">No data found...</div>;
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 px-4 pb-10  mt-5">
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

    if (view === VIEWTYPE?.LIST) {
      if (listFilteredData.length === 0) {
        return <div className="text-center text-gray-500 py-8 text-lg">No data found...</div>;
      }
      return (
        <div className="px-4 pb-8 overflow-x-auto">
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
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-gray-50 -mt-4 -mx-4">
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
        hideShowColumn={hideShowHandler}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {showFormDrawer && (
        <div className="fixed inset-0 z-[999]">
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
            setParentLoader={setLoading}
            refreshData={fetchUserMasterListData}
          />
        </div>
      )}
      <CustomLoader isLoading={loading} />

      {/* checkbox for column hiding */}
      {hideShowColumn && (
        <div
          ref={columnPopupRef}
          className="z-50 p-4 bg-white rounded shadow-lg border"
          style={{
            position: "absolute",
            top: hideColumnPopup.top,
            left: hideColumnPopup.left,
          }}
        >
          {columnNames.map((colName, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={columnVisibility[colName]}
                onChange={() =>
                  setColumnVisibility(prev => ({
                    ...prev,
                    [colName]: !prev[colName],
                  }))
                }
              />
              <label>{colName}</label>
            </div>
          ))}
        </div>
      )}

      {/* download popup */}

      {downloadList && (
        <div
          className=" z-50 p-1 bg-white rounded shadow-lg border"
          style={{ position: "absolute", top: popupPos.top, left: popupPos.left }}
          ref={downloadPopupRef}
        >
          <h2 className="text-lg font-semibold mb-2">Download As</h2>

          <button
            className="w-full text-left px-3 py-2 mb-1 bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => {
              exportListViewData(listFilteredData, "UserMaster", "pdf");
              setDownloadList(false);
            }}
          >
            📄 PDF
          </button>

          <button
            className="w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => {
              exportListViewData(listFilteredData, "UserMaster", "excel");

              setDownloadList(false);
            }}
          >
            📊 Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMaster;
