import React, { useState, useEffect } from "react";
import PageHeader from "../../components/pageHeader";
import { transformDataWithConfig } from "../../utils/utilities";
import { getRoleMaster } from "../../api/roleMasterApis";
import { roleMasterConfig } from "../../config/masterConfig/roleMasterConfig";
import ProfileCard from "../../components/profileCard";
import RoleMasterDrawer from "./components/RoleMasterDrawer";
import ListView from "../../components/profileCard/listView";

const VIEWTYPE = {
  GRID: "grid",
  LIST: "list",
};

const RoleMaster = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [roleMasterData, setRoleMasterData] = useState([]);
  const [cardsView, setCardsView] = useState(VIEWTYPE.GRID);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getRoleMaster();
      const apiResponse = response?.data;
      console.log("api response of role master", apiResponse);

      const transformedData = transformDataWithConfig(
        roleMasterConfig,
        apiResponse
      );
      console.log("role master transformed data:", transformedData);
      setRoleMasterData(transformedData);
    } catch (error) {
      console.log("error while fetching the data", error);
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
          {roleMasterData?.map((user, index) => (
            <ProfileCard data={user} key={index} />
          ))}
        </div>
      );
    } else if (cardsView === VIEWTYPE.LIST) {
      return (
        <div>
          <ListView data={roleMasterData} />
        </div>
      );
    }
  };

  return (
    <div className="flex-1 w-half-screen min-h-screen bg-gray-50 -mt-4 -mx-4">
      <PageHeader
        roleName={"Role Name"}
        onClick={() => setOpenDrawer(true)}
        title={"Role Master"}
        buttonTitle={"Add Role Master"}
        onGridView={onGridView}
        onListView={onListView}
        selectedViewType={cardsView}
      />

      {renderCards()}
      {/* Drawer Component */}
      <RoleMasterDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
    </div>
  );
};

export default RoleMaster;
