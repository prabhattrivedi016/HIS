import { useEffect, useState } from "react";
import { getRoleMaster } from "../../api/roleMasterApis";
import PageHeader from "../../components/pageHeader";
import GridView from "../../components/profileCard/GridView";
import ListView from "../../components/profileCard/ListView";
import { roleMasterConfig } from "../../config/masterConfig/roleMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import { transformDataWithConfig } from "../../utils/utilities";

const RoleMaster = () => {
  const { configDataValue, getConfigMasterValue } = useConfigMaster();
  const [roleMaterGridData, setRoleMasterGridData] = useState([]);
  const [roleMasterListData, setRoleMasterListData] = useState([]);
  const [cardView, setCardView] = useState(VIEWTYPE.GRID);

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
      setRoleMasterListData(transformedData?.listView);
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

  const renderComponent = view => {
    if (view === VIEWTYPE?.GRID) {
      return (
        <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 mt-5 gap-6 px-4 pb-10 ">
          {roleMaterGridData.map((role, index) => (
            <GridView key={index} data={role} />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE?.LIST) {
      return (
        <div className="px-4 pb-8 overflow-x-auto">
          <ListView data={roleMasterListData} />
        </div>
      );
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-gray-50 -mt-4 -mx-4">
      <PageHeader title="Role Master" onCardView={handleCardView} buttonTitle="Add New Role" />

      {/* Responsive Render */}
      <div className="w-full">{renderComponent(cardView)}</div>
    </div>
  );
};

export default RoleMaster;
