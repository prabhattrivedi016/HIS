import { useEffect, useState } from "react";
import { getRoleMaster, updateForRoleMasterstatus } from "../../api/roleMasterApis";
import CustomLoader from "../../components/customLoader";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard/GridView";
import ListView from "../../components/profileCard/ListView";
import { roleMasterConfig } from "../../config/masterConfig/roleMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { exportListViewData } from "../../utils/exportUtils";
import { transformDataWithConfig } from "../../utils/utilities";
import RoleMasterDrawer from "./components/RoleMasterDrawer";

const RoleMaster = () => {
  // const { configDataValue, getConfigMasterValue } = useConfigMaster();
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

  // const fetchConfigRoleMaster = async () => {
  //   try {
  //     await getConfigMasterValue("roleMaster");
  //   } catch (err) {
  //     console.error("Error fetching config, will use fallback:", err?.message || err);
  //   }
  // };
  // useEffect(() => {
  //   fetchConfigRoleMaster();
  // }, []);

  const fetchRoleMasterData = async (updateStatus = true) => {
    try {
      if (updateStatus) {
        setLoading(true);
      }
      const response = await getRoleMaster();
      const apiResponse = response?.data || [];
      const activeConfig = roleMasterConfig;
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
    console.log("keyInputkeyInputkeyInput", keyInput);

    console.log("search for role master list", selectedValue);

    if (!keyInput && !selectedValue) {
      setListFilteredData(roleMasterListData);
      setGridFilteredData(roleMaterGridData);
      return;
    }

    const matchFilter = roleMasterListData[0]?.columns?.find(col => col?.label === selectedValue);

    console.log("matchFiltermatchFiltermatchFilter", matchFilter);

    // const filteredGridData = roleMaterGridData.filter(item =>
    //   item?.cardTitle?.some(t => t?.value?.toLowerCase().includes(value))
    // );

    // const filteredListData = roleMasterListData?.filter(item =>
    //   item?.cardTitle?.some(t => t?.value.toLowerCase().includes(value))
    // );

    // setGridFilteredData(filteredGridData);
    // setListFilteredData(filteredListData);
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
  const downloadHandler = () => {
    exportListViewData(listFilteredData, "RoleMasterList", "xlsx");
  };

  // filter dropdown
  const filterDropDown = roleMasterListData[0]?.columns;

  console.log("filterDropDownfilterDropDownfilterDropDown", filterDropDown);

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
          />
        </div>
      );
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-gray-50 -mt-4 -mx-4">
      <PageHeader
        title="Role Master"
        onCardView={handleCardView}
        buttonTitle="Add New Role"
        onRefresh={handleRefresh}
        onSearch={searchHandler}
        searchValue={searchQuery}
        onAddNew={addNewHandler}
        onDownload={downloadHandler}
        onFilter={filterDropDown}
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
    </div>
  );
};
export default RoleMaster;
