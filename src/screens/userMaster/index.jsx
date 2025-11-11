import React, { useState, useEffect } from "react";
import { userMasterConfig } from "../../config/masterConfig/userMasterConfig";
import { getUserMasterList } from "../../api/userMasterApis";
import { transformDataWithConfig } from "../../utils/utilities";
import ProfileCard from "../../components/profileCard";
import PageHeader from "../../components/pageHeader";
import ListView from "../../components/profileCard/listView";
import { VIEWTYPE } from "../../constants/constants";

const UserMaster = () => {
  const [userMasterData, setUserMasterData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cardsView, setCardsView] = useState(VIEWTYPE.GRID);

  // Fetch user list
  useEffect(() => {
    fetchUserMasterList();
  }, []);

  const fetchUserMasterList = async () => {
    try {
      const response = await getUserMasterList();
      console.log("API Response (User Master):", response?.data);

      const apiResponse = response?.data || [];
      const transformedData = transformDataWithConfig(
        userMasterConfig,
        apiResponse
      );

      console.log("Transformed User Data:", transformedData);
      setUserMasterData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Error fetching user list:", error.message);
    }
  };

  // Switch between card and list view
  const onGridView = () => setCardsView(VIEWTYPE.GRID);
  const onListView = () => setCardsView(VIEWTYPE.LIST);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredData(userMasterData);
      return;
    }

    const search = value.toLowerCase();

    const filtered = userMasterData.filter((item) => {
      const name = item?.cardTitle?.value?.toLowerCase() || "";
      const id = item?.cardId?.value?.toString() || "";
      return name.includes(search) || id.includes(search);
    });

    setFilteredData(filtered);
  };

  // Render UI based on view type
  const renderCards = () => {
    if (!filteredData || filteredData.length === 0) {
      return <p className="text-center text-gray-500 py-10">No Users Found</p>;
    }

    if (cardsView === VIEWTYPE.GRID) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-4">
          {filteredData.map((user, index) => (
            <ProfileCard data={user} key={index} />
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
        title="User Master"
        buttonTitle="Add New User"
        onGridView={onGridView}
        onListView={onListView}
        selectedViewType={cardsView}
        onSearch={handleSearch}
        onClick={() => console.log("Add User Master button clicked!")}
      />
      {renderCards()}
    </div>
  );
};

export default UserMaster;
