import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "../../components/pageHeader";
import ProfileCard from "../../components/profileCard";
import ListView from "../../components/profileCard/listView";
import RoleMasterDrawer from "./components/RoleMasterDrawer";
import { getRoleMaster } from "../../api/roleMasterApis";
import { transformDataWithConfig } from "../../utils/utilities";
import { roleMasterConfig } from "../../config/masterConfig/roleMasterConfig";
import { VIEWTYPE } from "../../constants/constants";

const RoleMaster = () => {
  // -------------------- State --------------------
  const [openDrawer, setOpenDrawer] = useState(false);
  const [roleMasterData, setRoleMasterData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cardsView, setCardsView] = useState(VIEWTYPE.GRID);
  const [loading, setLoading] = useState(false);

  // fetch data
  const fetchRoleMasterData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRoleMaster();
      const apiResponse = response?.data || [];
      console.log("Role Master API Response:", apiResponse);

      const transformedData = transformDataWithConfig(
        roleMasterConfig,
        apiResponse
      );
      console.log("Transformed Role Master Data:", transformedData);

      setRoleMasterData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Error while fetching Role Master data:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoleMasterData();
  }, [fetchRoleMasterData]);

  // handlers

  const onGridView = () => setCardsView(VIEWTYPE.GRID);
  const onListView = () => setCardsView(VIEWTYPE.LIST);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredData(roleMasterData);
      return;
    }

    const search = value.toLowerCase();
    const filtered = roleMasterData.filter((item) => {
      const name = item?.cardTitle?.value?.toLowerCase() || "";
      const id = item?.cardId?.value?.toString() || "";
      return name.includes(search) || id.includes(search);
    });

    setFilteredData(filtered);
  };

  const handleAddRoleClick = () => {
    console.log("Add Role Master button clicked!");
    setOpenDrawer(true);
  };

  // render views
  const renderView = () => {
    if (loading) {
      return (
        <p className="text-center text-gray-500 py-10">
          Loading Role Masters...
        </p>
      );
    }

    if (!filteredData || filteredData.length === 0) {
      return <p className="text-center text-gray-500 py-10">No Roles Found</p>;
    }

    if (cardsView === VIEWTYPE.GRID) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-4">
          {filteredData.map((role, index) => (
            <ProfileCard key={index} data={role} />
          ))}
        </div>
      );
    }

    if (cardsView === VIEWTYPE.LIST) {
      return <ListView data={filteredData} />;
    }

    return null;
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-gray-50 -mt-4 -mx-4">
      <PageHeader
        title="Role Master"
        buttonTitle="Add Role Master"
        onClick={handleAddRoleClick}
        onGridView={onGridView}
        onListView={onListView}
        selectedViewType={cardsView}
        onSearch={handleSearch}
      />

      {renderView()}

      {/* Drawer Component */}
      <RoleMasterDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
    </div>
  );
};

export default RoleMaster;
