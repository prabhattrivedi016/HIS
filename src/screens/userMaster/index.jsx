import { useCallback, useEffect, useState } from 'react';
import { getUserMasterList } from '../../api/userMasterApis';
import PageHeader from '../../components/pageHeader';
import ProfileCard from '../../components/profileCard';
import ListView from '../../components/profileCard/ListView';
import { userMasterConfig } from '../../config/masterConfig/userMasterConfig';
import { VIEWTYPE } from '../../constants/constants';
import { useConfigMaster } from '../../hooks/useConfigMaster';
import { exportMasterData } from '../../utils/exportUtils';
import { transformDataWithConfig } from '../../utils/utilities';

const UserMaster = () => {
  //  Custom hook to fetch backend configuration
  const { configDataValue, getConfigMasterValue } = useConfigMaster();

  //  Local states
  const [userMasterData, setUserMasterData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cardsView, setCardsView] = useState(VIEWTYPE.GRID);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  // //  Fetch configuration
  // const fetchConfig = async () => {
  //   setConfigLoading(true);
  //   try {
  //     await getConfigMasterValue("userMaster");
  //   } catch (err) {
  //     console.error("Error fetching User Master config, using fallback:", err);
  //   } finally {
  //     setConfigLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchConfig();
  // }, []);

  //  Fetch user data (after config loaded)
  const fetchUserMasterListData = useCallback(async () => {
    // if (configLoading) return;
    setLoading(true);
    try {
      const response = await getUserMasterList();
      const apiResponse = response?.data || [];

      const activeConfig = userMasterConfig;

      const transformedData = transformDataWithConfig(activeConfig, apiResponse);
      console.log('transformed data of user master', transformedData);

      setUserMasterData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error('Error fetching User Master list:', error.message);
    } finally {
      setLoading(false);
    }
  }, [configDataValue, configLoading]);

  useEffect(() => {
    fetchUserMasterListData();
  }, [fetchUserMasterListData]);

  //  Refresh button handler
  const handleRefresh = () => {
    fetchUserMasterListData();
  };

  // handle download
  const handleDownload = () => {
    exportMasterData(filteredData, 'UserMaster', 'csv');
  };

  //  Switch views
  const onGridView = () => setCardsView(VIEWTYPE.GRID);
  const onListView = () => setCardsView(VIEWTYPE.LIST);

  //  Handle search
  const handleSearch = value => {
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredData(userMasterData);
      return;
    }

    const search = value.toLowerCase();

    const filtered = userMasterData.filter(item => {
      // Handle cardTitle
      let titleValue = '';
      if (Array.isArray(item.cardTitle)) {
        titleValue = item.cardTitle.map(t => t.value).join(' ');
      } else if (typeof item.cardTitle === 'object') {
        titleValue = item.cardTitle?.value || '';
      }

      // Handle cardId
      let idValue = '';
      if (Array.isArray(item.cardId)) {
        idValue = item.cardId.map(t => t.value).join(' ');
      } else if (typeof item.cardId === 'object') {
        idValue = item.cardId?.value || '';
      }

      return titleValue.toLowerCase().includes(search) || idValue.toString().includes(search);
    });

    setFilteredData(filtered);
  };

  // Render grid or list view
  const renderCards = () => {
    // if (configLoading || loading) {
    //   return (
    //     <p className="text-center text-gray-500 py-10">
    //       Loading User Masters...
    //     </p>
    //   );
    // }

    // if (!filteredData || filteredData.length === 0) {
    //   return <p className="text-center text-gray-500 py-10">No Users Found</p>;
    // }

    if (cardsView === VIEWTYPE.GRID) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-4">
          {userMasterData.map((user, index) => (
            <ProfileCard data={user} key={user.cardId?.value || index} />
          ))}
        </div>
      );
    }

    if (cardsView === VIEWTYPE.LIST) {
      return <ListView data={userMasterData} />;
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
        onClick={() => console.log('Add User Master button clicked!')}
        onClickRefresh={handleRefresh}
        onClickDownload={handleDownload}
      />
      {renderCards()}
    </div>
  );
};

export default UserMaster;
