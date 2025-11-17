import { useEffect, useState } from "react";
import { getUserMasterList, updateForUserMasterstatus } from "../../api/userMasterApis";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard/GridView";
import ListView from "../../components/profileCard/ListView";
import { userMasterConfig } from "../../config/masterConfig/userMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import { transformDataWithConfig } from "../../utils/utilities";

const UserMaster = () => {
  const { configDataValue, getConfigMasterValue } = useConfigMaster();
  const [userMasterGridData, setUserMasterGridData] = useState([]);
  const [userMasterListData, setUserMasterListData] = useState([]);

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
      setUserMasterListData(transformedData?.listView);
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

  const renderComponent = view => {
    if (view === VIEWTYPE?.GRID) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 px-4 pb-10  mt-5">
          {userMasterGridData.map((user, index) => (
            <GridView key={index} data={user} onStatusChange={updateUserMasterStatus} />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE?.LIST) {
      return (
        <div className="px-4 pb-8 overflow-x-auto">
          <ListView data={userMasterListData} onStatusChange={updateUserMasterStatus} />
        </div>
      );
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-gray-50 -mt-4 -mx-4">
      <PageHeader title="User Master" onCardView={handleCardView} buttonTitle="Add New User" />

      <div className="w-full">{renderComponent(cardView)}</div>
    </div>
  );
};

export default UserMaster;
