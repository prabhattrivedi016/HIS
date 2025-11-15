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

  //   Fetch config from API
  useEffect(() => {
    const fetchConfig = async () => {
      setConfigLoading(true);
      try {
        await getConfigMasterValue("roleMaster");
      } catch (err) {
        console.error(" Error fetching config, will use fallback:", err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  //  Fetch Role Master Data
  const fetchRoleMasterData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRoleMaster();
      const apiResponse = response?.data || [];

      const activeConfig = configDataValue || roleMasterConfig;

      const transformedData = transformDataWithConfig(activeConfig, apiResponse);

      setRoleMasterData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error(" Error while fetching Role Master data:", error.message);
    } finally {
      setLoading(false);
    }
  }, [configDataValue, setRoleMasterData, setFilteredData, setLoading]);

  useEffect(() => {
    if (!configLoading) {
      fetchRoleMasterData();
    }
  }, [configLoading]);

  const handleRefresh = () => {
    fetchRoleMasterData();
  };

  const handleDownload = () => {
    exportMasterData(filteredData, "RoleMasterData", "excel");
  };

  const onStatusChange = useCallback(() => {
    fetchRoleMasterData();
  }, [fetchRoleMasterData]);

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
    setOpenDrawer(true);
  };

  const onCloseDrawer = () => {
    setOpenDrawer(false);
    handleRefresh();
  };

  const renderView = () => {
    if (configLoading || loading) {
      return <p className="text-center text-gray-500 py-10">Loading Role Masters...</p>;
    }

    if (!filteredData || filteredData.length === 0) {
      return <p className="text-center text-gray-500 py-10">No Roles Found</p>;
    }

    if (cardsView === VIEWTYPE.GRID) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-4">
          {filteredData.map((role, index) => (
            <ProfileCard
              key={index}
              data={role}
              onStatusChange={onStatusChange}
              onCloseDrawer={handleRefresh}
            />
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
        onClickRefresh={handleRefresh}
        onClickDownload={handleDownload}
      />

      {renderView()}

      {/* Add new role drawer */}
      <RoleMasterDrawer open={openDrawer} onClose={onCloseDrawer} />
    </div>
  );
};

export default RoleMaster;
