import { useEffect, useRef, useState } from "react";
import { getRoleMaster, updateForRoleMasterstatus } from "../../api/roleMasterApis";
import CustomLoader from "../../components/customLoader";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard/GridView";
import ListView from "../../components/profileCard/ListView";
import { roleMasterConfig } from "../../config/masterConfig/roleMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import { exportListViewData } from "../../utils/exportUtils";
import { transformDataWithConfig } from "../../utils/utilities";
import RoleMasterDrawer from "./components/RoleMasterDrawer";

const RoleMaster = () => {
  const { configDataValue, getConfigMasterValue } = useConfigMaster();
  const [roleMaterGridData, setRoleMasterGridData] = useState([]);
  const [roleMasterListData, setRoleMasterListData] = useState([]);
  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [gridFilteredData, setGridFilteredData] = useState([]);
  const [listFilteredData, setListFilteredData] = useState([]);
  const [openRoleDrawer, setOpenRoleDrawer] = useState(false);
  const [drawerButtonTitle, setDrawerButtonTitle] = useState("Create New Role");
  const [roleDrawerTitle, setRoleDrawerTitle] = useState("Add New Role");
  const [roleIdToEdit, setRoleIdToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [downloadList, setDownloadList] = useState(false);
  const [downloadPopUp, setDownloadPopUp] = useState({ top: 0, left: 0 });
  const [hideColumnPopup, setHideColumnPopup] = useState({ top: 0, left: 0 });

  // fetch config for role master
  const fetchConfigRoleMaster = async () => {
    try {
      await getConfigMasterValue("roleMaster");
    } catch (err) {
      console.error("Error fetching config, will use fallback:", err?.message || err);
    }
  };
  useEffect(() => {
    fetchConfigRoleMaster();
  }, []);

  const fetchRoleMasterData = async (updateStatus = true) => {
    try {
      if (updateStatus) {
        setLoading(true);
      }
      const response = await getRoleMaster();
      const apiResponse = response?.data || [];
      const activeConfig = configDataValue || roleMasterConfig;
      const transformedData = transformDataWithConfig(activeConfig, apiResponse);

      setRoleMasterGridData(transformedData?.gridView);
      setRoleMasterListData(transformedData?.listView);

      setGridFilteredData(transformedData?.gridView);
      setListFilteredData(transformedData?.listView);
    } catch (error) {
      console.error("Error while fetching Role Master data:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRoleMasterData();
  }, []);

  // closes modal on clicking outside

  const columnPopupRef = useRef(null);
  useClickOutside(columnPopupRef, () => setHideShowColumn(false));

  const downloadPopupRef = useRef(null);
  useClickOutside(downloadPopupRef, () => setDownloadList(false));

  // handle column hide show (visibility)
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const firstRow = listFilteredData[0]?.columns;
      const visibilityState = {};

      firstRow.forEach(col => {
        visibilityState[col.label] = true;
      });

      setColumnVisibility(visibilityState);
    }
  }, [listFilteredData]);

  // handle card view change
  const handleCardView = cardType => {
    setCardView(cardType);
  };

  // update status for role master
  const updateRoleMasterStatus = async ({ isActive, roleId }) => {
    try {
      setLoading(true);
      await updateForRoleMasterstatus({ isActive, roleId });
      fetchRoleMasterData(false);
    } catch (error) {
      console.log("Error while updating the state of role master", error?.message);
    }
  };

  // handle Refresh
  const handleRefresh = () => {
    fetchRoleMasterData();
    setSearchQuery("");
  };

  // search handler
  const searchHandler = (keyInput, selectedValue) => {
    const value = keyInput?.toLowerCase()?.trim();

    if (!value && !selectedValue) {
      setListFilteredData(roleMasterListData);
      setGridFilteredData(roleMaterGridData);
      return;
    }

    // get selected column
    const columnConfig = roleMasterListData[0]?.columns?.find(col => col?.label === selectedValue);

    const field = columnConfig?.keyFromApi;

    const filteredListData = roleMasterListData.filter(item => {
      if (field) {
        const col = item.columns?.find(c => c.keyFromApi === field);
        return col?.value?.toString().toLowerCase().includes(value);
      }

      // global search when no filter selected
      return item.columns?.some(col => col?.value?.toString().toLowerCase().includes(value));
    });

    // grid view filtering
    const filteredGridData = roleMaterGridData.filter(item =>
      item.cardTitle?.some(titleObj => titleObj.value?.toString().toLowerCase().includes(value))
    );

    setListFilteredData(filteredListData);
    setGridFilteredData(filteredGridData);
  };

  // add new role handler
  const addNewHandler = (id = null) => {
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

  // download handler
  const downloadHandler = e => {
    const rect = e.target.getBoundingClientRect();

    let top = rect.bottom + window.scrollY + 5;
    let left = rect.left + window.scrollX;

    // SIMPLE RESPONSIVE FIX
    left = Math.min(left, window.innerWidth - 180); // 180 = popup width
    left = Math.max(10, left); // prevent too left on mobile

    setDownloadPopUp({ top, left });
    setDownloadList(prev => !prev);
  };

  // hide show column handler
  const hideShowHandler = e => {
    const rect = e.target.getBoundingClientRect();

    let top = rect.bottom + window.scrollY + 5;
    let left = rect.left + window.scrollX;

    // SIMPLE RESPONSIVE FIX
    left = Math.min(left, window.innerWidth - 220);
    left = Math.max(10, left);

    setHideColumnPopup({ top, left });
    setHideShowColumn(prev => !prev);
  };

  //  get column names
  const columnNames =
    listFilteredData.length > 0 ? listFilteredData[0].columns.map(col => col.label) : [];

  // filter dropdown
  const filterDropDown = roleMasterListData[0]?.columns;

  // render component
  const renderComponent = view => {
    if (loading) {
      return (
        <div
          className="text-center text-gray-500 py-8 text-lg pt-16
"
        >
          Loading role master...
        </div>
      );
    }
    if (view === VIEWTYPE?.GRID) {
      if (gridFilteredData.length === 0) {
        return <div className="text-center text-gray-500 py-8 text-lg">No data found...</div>;
      }
      return (
        <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 mt-5 gap-6 px-4 pb-10 ">
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

    if (view === VIEWTYPE?.LIST) {
      if (listFilteredData.length === 0) {
        return <div className="text-center text-gray-500 py-8 text-lg">No data found...</div>;
      }
      return (
        <div className="px-4 pb-8 overflow-x-auto">
          <ListView
            data={listFilteredData}
            onStatusChange={updateRoleMasterStatus}
            openDrawer={addNewHandler}
            columnVisibility={columnVisibility}
          />
        </div>
      );
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-gray-50 -mt-4 -mx-4 rela">
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
        hideShowColumn={hideShowHandler}
      />

      {/* render component  */}
      <div className="w-full">{renderComponent(cardView)}</div>

      {openRoleDrawer && (
        <div className="fixed inset-0 z-[999]">
          {/* Full screen overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

          <RoleMasterDrawer
            isOpen={openRoleDrawer}
            onClose={() => setOpenRoleDrawer(false)}
            buttonTitle={drawerButtonTitle}
            drawerTitle={roleDrawerTitle}
            onCloseDrawer={handleRefresh}
            roleId={roleIdToEdit}
            setParentLoader={setLoading}
          />
        </div>
      )}
      <CustomLoader isLoading={loading} />

      {/* column hiding popup */}
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

      {downloadList && (
        <div
          className="z-50 p-1 bg-white rounded shadow-lg border"
          style={{ position: "absolute", top: downloadPopUp.top, left: downloadPopUp.left }}
          ref={downloadPopupRef}
        >
          <h2 className="text-lg font-semibold mb-2">Download As</h2>

          <button
            className="w-full text-left px-3 py-2 mb-1 bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => {
              exportListViewData(listFilteredData, "RoleMasterList", "pdf");
              setDownloadList(false);
            }}
          >
            📄 PDF
          </button>

          <button
            className="w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => {
              exportListViewData(listFilteredData, "RoleMaster", "excel");
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
export default RoleMaster;
