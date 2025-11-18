import { useEffect, useState } from "react";
import { getRoleMaster, updateForRoleMasterstatus } from "../../api/roleMasterApis";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard/GridView";
import ListView from "../../components/profileCard/ListView";
import { roleMasterConfig } from "../../config/masterConfig/roleMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
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

  const fetchRoleMasterData = async () => {
    try {
      const response = await getRoleMaster();
      const apiResponse = response?.data || [];
      const activeConfig = configDataValue || roleMasterConfig;
      const transformedData = transformDataWithConfig(activeConfig, apiResponse);

      setRoleMasterGridData(transformedData?.gridView);
      setGridFilteredData(transformedData?.gridView);

      setRoleMasterListData(transformedData?.listView);
      setListFilteredData(transformedData?.listView);
    } catch (error) {
      console.error("Error while fetching Role Master data:", error?.message || error);
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
      const res = await updateForRoleMasterstatus({ isActive, roleId });
      fetchRoleMasterData();
    } catch (error) {
      console.log("Error while updating the state of role master", error?.message);
    }
  };

  // handle Refresh
  const handleRefresh = () => {
    fetchRoleMasterData();
  };

  // search handler
  const searchHandler = e => {
    const query = e.target.value.toLowerCase();

    if (!query) {
      setGridFilteredData(roleMaterGridData);
      setListFilteredData(roleMasterListData);
      return;
    }
    const filteredGridData = roleMaterGridData.filter(item =>
      item?.cardTitle?.some(t => t?.value?.toLowerCase().includes(query))
    );

    const filteredListData = roleMasterListData?.filter(item =>
      item?.cardTitle?.some(t => t?.value.toLowerCase().includes(query))
    );

    setGridFilteredData(filteredGridData);
    setListFilteredData(filteredListData);
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

  const renderComponent = view => {
    if (view === VIEWTYPE?.GRID) {
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
      return (
        <div className="px-4 pb-8 overflow-x-auto">
          <ListView
            data={listFilteredData}
            onStatusChange={updateRoleMasterStatus}
            openDrawer={addNewHandler}
            buttonTitle={setDrawerButtonTitle}
            drawerTitle={setRoleDrawerTitle}
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
        onAddNew={addNewHandler}
      />

      {/* render component  */}
      <div className="w-full">{renderComponent(cardView)}</div>

      {openRoleDrawer && (
        <RoleMasterDrawer
          isOpen={openRoleDrawer}
          onClose={() => setOpenRoleDrawer(false)}
          buttonTitle={drawerButtonTitle}
          drawerTitle={roleDrawerTitle}
          onCloseDrawer={handleRefresh}
          roleId={roleIdToEdit}
        />
      )}
    </div>
  );
};
export default RoleMaster;
