import { useEffect, useMemo, useState } from "react";
import { getUserMasterList, updateForUserMasterstatus } from "../../api/userMasterApis";
import FormComponent from "../../components/formComponent/FormComponent";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard/GridView";
import ListView from "../../components/profileCard/ListView";
import { formConfig } from "../../config/formConfig/formConfig";
import { userMasterConfig } from "../../config/masterConfig/userMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
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

  const handleCardView = cardType => {
    setCardView(cardType);
  };

  // update status
  const updateUserMasterStatus = async ({ isActive, userId }) => {
    try {
      const res = await updateForUserMasterstatus({ isActive, userId });
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

  // search handler
  const searchHandler = e => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);

    if (!value) {
      setGridFilteredData(userMasterGridData);
      setListFilteredData(userMasterListData);
      return;
    }
    const filteredGridData = userMasterGridData.filter(item =>
      item?.cardTitle?.some(t => t?.value?.toLowerCase().includes(value))
    );

    const filteredListData = userMasterListData?.filter(item =>
      item?.cardTitle?.some(t => t?.value.toLowerCase().includes(value))
    );

    setGridFilteredData(filteredGridData);
    setListFilteredData(filteredListData);
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
  const downloadHandler = () => {
    exportListViewData(listFilteredData, "UserMasterList", "xlsx");
  };

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
        searchValue={searchQuery}
        onAddNew={addNewHandler}
        onDownload={downloadHandler}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {showFormDrawer && (
        <FormComponent
          isOpen={showFormDrawer}
          onClose={() => {
            setOpenFormComponent("");
            setOpenAddNewUser(false);
            fetchUserMasterListData();
          }}
          buttonTitle={drawerButtonTitle}
          drawerTitle={userDrawerTitle}
          formConfig={formConfig}
          userId={openFormComponent}
        />
      )}
    </div>
  );
};

export default UserMaster;
