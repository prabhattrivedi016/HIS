import { useEffect, useState } from "react";
import { getUserMasterList, updateForUserMasterstatus } from "../../api/userMasterApis";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard/GridView";
import ListView from "../../components/profileCard/ListView";
import { userMasterConfig } from "../../config/masterConfig/userMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import { transformDataWithConfig } from "../../utils/utilities";
import UserMasterDrawer from "./components/UserMasterDrawer";

const UserMaster = () => {
  const { configDataValue, getConfigMasterValue } = useConfigMaster();
  const [userMasterGridData, setUserMasterGridData] = useState([]);
  const [userMasterListData, setUserMasterListData] = useState([]);
  const [gridFilteredData, setGridFilteredData] = useState([]);
  const [listFilteredData, setListFilteredData] = useState([]);
  const [openUserDrawer, setOpenUserDrawer] = useState(false);
  const [drawerButtonTitle, setDrawerButtonTitle] = useState("Create New User");
  const [userDrawerTitle, setUserDrawerTitle] = useState("Add New User");

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);

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

  const fetchUserMasterListData = async () => {
    try {
      const response = await getUserMasterList();
      const apiResponse = response?.data || [];

      const activeConfig = configDataValue || userMasterConfig;

      const transformedData = transformDataWithConfig(activeConfig, apiResponse);

      setUserMasterGridData(transformedData?.gridView);
      setGridFilteredData(transformedData?.gridView);

      setUserMasterListData(transformedData?.listView);
      setListFilteredData(transformedData?.listView);
    } catch (error) {
      console.error("Error fetching User Master list:", error?.message);
    }
  };

  useEffect(() => {
    fetchUserMasterListData();
  }, []);

  const handleCardView = cardType => {
    setCardView(cardType);
  };

  // update status
  const updateUserMasterStatus = async ({ isActive, userId }) => {
    try {
      const res = await updateForUserMasterstatus({ isActive, userId });
      console.log("user status update", res?.data);
      fetchUserMasterListData();
    } catch (error) {
      console.log("error while updating user status", error?.message);
    }
  };

  // handle refresh
  const handleRefresh = () => {
    fetchUserMasterListData();
  };

  // search handler
  const searchHandler = e => {
    const query = e.target.value.toLowerCase();

    if (!query) {
      setGridFilteredData(userMasterGridData);
      setListFilteredData(userMasterListData);
      return;
    }
    const filteredGridData = userMasterGridData.filter(item =>
      item?.cardTitle?.some(t => t?.value?.toLowerCase().includes(query))
    );

    const filteredListData = userMasterListData?.filter(item =>
      item?.cardTitle?.some(t => t?.value.toLowerCase().includes(query))
    );

    setGridFilteredData(filteredGridData);
    setListFilteredData(filteredListData);
  };

  // add new user handler
  const addNewHandler = () => {
    setOpenUserDrawer(true);
  };

  const renderComponent = view => {
    if (view === VIEWTYPE?.GRID) {
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
      return (
        <div className="px-4 pb-8 overflow-x-auto">
          <ListView
            data={listFilteredData}
            onStatusChange={updateUserMasterStatus}
            openDrawer={addNewHandler}
            buttonTitle={setDrawerButtonTitle}
            drawerTitle={setUserDrawerTitle}
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
        buttonTitle="Add New User"
        onRefresh={handleRefresh}
        onSearch={searchHandler}
        onAddNew={addNewHandler}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {openUserDrawer && (
        <UserMasterDrawer
          isOpen={openUserDrawer}
          onClose={() => setOpenUserDrawer(false)}
          buttonTitle={drawerButtonTitle}
          drawerTitle={userDrawerTitle}
        />
      )}
    </div>
  );
};

export default UserMaster;
