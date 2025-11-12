import { useCallback, useEffect, useState } from "react";
import { getRoleMaster } from "../../api/roleMasterApis";
import PageHeader from "../../components/pageHeader";
import ProfileCard from "../../components/profileCard";
import ListView from "../../components/profileCard/ListView";
import { roleMasterConfig } from "../../config/masterConfig/roleMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import { exportMasterData } from "../../utils/exportUtils";
import { transformDataWithConfig } from "../../utils/utilities";
import RoleMasterDrawer from "./components/RoleMasterDrawer";

const RoleMaster = () => {
  // Custom hook: fetch Role Master config
  const { configDataValue, getConfigMasterValue } = useConfigMaster();

  // Local states
  const [openDrawer, setOpenDrawer] = useState(false);
  const [roleMasterData, setRoleMasterData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cardsView, setCardsView] = useState(VIEWTYPE.GRID);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  //  Step 1: Fetch config from API
  // useEffect(() => {
  //   const fetchConfig = async () => {
  //     setConfigLoading(true);
  //     try {
  //       await getConfigMasterValue("roleMaster");
  //     } catch (err) {
  //       console.error(" Error fetching config, will use fallback:", err);
  //     } finally {
  //       setConfigLoading(false);
  //     }
  //   };
  //   fetchConfig();
  // }, []);

  //  Step 2: Fetch Role Master Data (uses fallback if needed)
  const fetchRoleMasterData = useCallback(async () => {
    console.log("api call of role master data");
    setLoading(true);
    try {
      const response = await getRoleMaster();
      const apiResponse = response?.data || [];

      //  Use API config if available, otherwise fallback to static one
      const activeConfig = configDataValue || roleMasterConfig;

      const transformedData = transformDataWithConfig(activeConfig, apiResponse);
      console.log("transformed data of role master", transformedData);

      setRoleMasterData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error(" Error while fetching Role Master data:", error.message);
    } finally {
      setLoading(false);
    }
  }, [configDataValue]);

  useEffect(() => {
    fetchRoleMasterData();
  }, []);

  //  Step 3: Fetch data after config (or fallback) is ready
  // useEffect(() => {
  //   if (!configLoading) {
  //     fetchRoleMasterData();
  //   }
  // }, [configLoading, fetchRoleMasterData]);

  // handle refresh
  const handleRefresh = () => {
    fetchRoleMasterData();
  };

  // handle download csv file
  const handleDownload = () => {
    exportMasterData(filteredData, "RoleMasterData", "excel");
  };

  // Handlers
  const onGridView = () => setCardsView(VIEWTYPE.GRID);
  const onListView = () => setCardsView(VIEWTYPE.LIST);

  const handleSearch = value => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredData(roleMasterData);
      return;
    }

    const search = value.toLowerCase();
    const filtered = roleMasterData.filter(item => {
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

  // Render Views (unchanged)
  const renderView = () => {
    // if (configLoading || loading) {
    //   return (
    //     <p className="text-center text-gray-500 py-10">
    //       Loading Role Masters...
    //     </p>
    //   );
    // }

    // if (!filteredData || filteredData.length === 0) {
    //   return <p className="text-center text-gray-500 py-10">No Roles Found</p>;
    // }

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

  // Final Render
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
        onClickRefresh={handleRefresh}
        onClickDownload={handleDownload}
      />

      {renderView()}

      {/* Drawer Component */}
      <RoleMasterDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
    </div>
  );
};

export default RoleMaster;
