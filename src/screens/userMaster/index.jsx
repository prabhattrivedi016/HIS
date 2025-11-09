import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { transformDataWithConfig } from "../../utils/utilities";
axiosInstance;
import { userMasterConfig } from "../../config/masterConfig/userMasterConfig";
import { getUserMasterList } from "../../api/userMasterApis";
import ProfileCard from "../../components/profileCard";
import PageHeader from "../../components/pageHeader";
import ListView from "../../components/profileCard/listView";

const VIEWTYPE = {
  GRID: "grid",
  LIST: "list",
};

const UserMaster = () => {
  const [userMasterData, setUserMasterData] = useState([]);
  const [cardsView, setCardsView] = useState(VIEWTYPE.GRID);

  useEffect(() => {
    fetchUserMasterList();
  }, []);

  const fetchUserMasterList = async () => {
    try {
      const response = await getUserMasterList();
      console.log("api response of fetchUserMaster", response?.data);
      const apiResponse = response?.data;
      const transformedData = transformDataWithConfig(
        userMasterConfig,
        apiResponse
      );
      console.log("transformed data", transformedData);
      setUserMasterData(transformedData || []);
    } catch (error) {
      console.log("error while fetching userList", error.message);
    }
  };

  // card view
  const onGridView = () => {
    setCardsView(VIEWTYPE.GRID);
  };

  const onListView = () => {
    setCardsView(VIEWTYPE.LIST);
  };

  const renderCards = () => {
    if (cardsView === VIEWTYPE.GRID) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-4">
          {userMasterData.map((user, index) => (
            <ProfileCard data={user} key={index} />
          ))}
        </div>
      );
    } else if (cardsView === VIEWTYPE.LIST) {
      return (
        <div>
          <ListView data={userMasterData} />
        </div>
      );
    }
  };

  return (
    <div className="flex-1 w-half-screen min-h-screen bg-gray-50 -mt-4 -mx-4">
      <PageHeader
        title={"User Master"}
        buttonTitle={"Add New User"}
        onGridView={onGridView}
        onListView={onListView}
        selectedViewType={cardsView}
        onClick={() => {
          console.log("Add User Master button is clicked !");
        }}
      />
      {renderCards()}
    </div>
  );
};

export default UserMaster;
