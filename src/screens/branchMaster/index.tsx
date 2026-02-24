import { ErrorMessage } from "@/components/infoText";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HideShowColumn from "../../components/buttonsPopup";
import DownloadPopup from "../../components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "../../components/customLoader";
import PageHeader from "../../components/pageHeader/index";
import GridView from "../../components/profileCard";
import ListView from "../../components/profileCard/components/ListView";
import { ENDPOINTS } from "../../config/defaults";
import { branchMasterConfig } from "../../config/masterConfig/branchMasterConfig";
import { VIEWTYPE } from "../../constants/constants";
import { useConfigMaster } from "../../hooks/useConfigMaster";
import useGlobalApi from "../../hooks/useGlobalApi";
import { exportListViewData } from "../../utils/exportUtils";
import { filteredData } from "../../utils/filteredData";
import { transformDataWithConfig } from "../../utils/utilities";
import BranchMasterDrawer from "./components/BranchMasterDrawer";
import { BranchMasterGridItem, BranchMasterListItem } from "./types";

const BranchMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  //local states
  const [branchMaterGridData, setBranchMasterGridData] = useState<BranchMasterGridItem[]>([]);
  const [branchMasterListData, setBranchMasterListData] = useState<BranchMasterListItem[]>([]);

  const [gridFilteredData, setGridFilteredData] = useState<BranchMasterGridItem[]>([]);
  const [listFilteredData, setListFilteredData] = useState<BranchMasterListItem[]>([]);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const [cardView, setCardView] = useState<string>(VIEWTYPE.GRID);

  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState(null);

  const [onDownload, setOnDownload] = useState(false);
  const [downloadPopup, setDownloadPopup] = useState(null);

  const hideShowBtnRef = useRef(null);
  const downloadBtnRef = useRef(null);

  const [openBranchDrawer, setOpenBranchDrawer] = useState<boolean>(false);
  const [drawerButtonTitle, setDrawerButtonTitle] = useState<string>("Create New Branch");
  const [branchDrawerTitle, setBranchDrawerTitle] = useState<string>("Add New Branch");
  const [branchIdToEdit, setBranchIdToEdit] = useState<number | null>(null);

  /*----------------------------config value of branch master---------------------- */

  const configData = useConfigMaster("branchMaster");
  const branchConfig = configData?.configDataValue;

  //get branch details
  const getBranchDetail = useCallback(async () => {
    const response = await fetchApi("GET", ENDPOINTS.GET_BRANCH_DETAILS);
    const activeConfig = branchConfig || branchMasterConfig;
    const transformed = transformDataWithConfig(activeConfig, response);

    setBranchMasterGridData(transformed.gridView);
    setBranchMasterListData(transformed.listView);

    setGridFilteredData(transformed.gridView);
    setListFilteredData(transformed.listView);

    setHasFetched(true);
  }, []);

  useEffect(() => {
    getBranchDetail();
  }, [branchConfig]);

  // handle card view
  const handleCardView = (view: string) => setCardView(view);

  // handle drawer close
  const handleDrawerClose = useCallback(() => {
    setOpenBranchDrawer(false);
  }, [openBranchDrawer]);

  // branch master add / update branch
  const addNewHandler = (id: number | null) => {
    if (id) {
      setDrawerButtonTitle("Update Branch");
      setBranchDrawerTitle("Update Existing Branch");
      setBranchIdToEdit(id);
    } else {
      setDrawerButtonTitle("Create New Branch");
      setBranchDrawerTitle("Add New Branch");
      setBranchIdToEdit(null);
    }
    setOpenBranchDrawer(true);
  };

  // initial column visibility
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const visibility = {};
      listFilteredData[0].columns.forEach(col => {
        visibility[col.label] = true;
      });
      setColumnVisibility(visibility);
    }
  }, [listFilteredData]);

  // handle refresh
  const handleRefresh = () => {
    getBranchDetail();
    setSearchQuery("");
  };

  // search handler
  const searchHandler = (keyInput, selectedValue) => {
    const value = keyInput?.toLowerCase()?.trim();
    setSearchQuery(keyInput);

    filteredData({
      value,
      selectedValue,
      listData: branchMasterListData,
      gridData: branchMaterGridData,
      setListFilteredData,
      setGridFilteredData,
    });
  };

  // DOWNLOAD POPUP HANDLER
  const downloadHandler = () => {
    if (!downloadBtnRef.current) return;

    const rect = downloadBtnRef.current.getBoundingClientRect();
    setDownloadPopup({
      top: rect.bottom + window.scrollY - 12,
      left: rect.left + window.scrollX + 12,
    });

    setOnDownload(prev => !prev);
  };

  // HIDE SHOW COLUMN HANDLER
  const hideShowHandler = () => {
    if (!hideShowBtnRef.current) return;

    const rect = hideShowBtnRef.current.getBoundingClientRect();
    setPopupPos({
      top: rect.bottom + window.scrollY - 10,
      left: rect.left + window.scrollX + 10,
    });

    setHideShowColumn(prev => !prev);
  };

  // COLUMN NAMES
  const columnNames = useMemo(() => {
    return branchMasterListData.length > 0
      ? branchMasterListData[0].columns.map(col => col.label)
      : [];
  }, [branchMasterListData]);

  // DROPDOWN FILTER
  const filterDropDown = branchMasterListData[0]?.columns;

  // render grid/list
  const renderComponent = (view: string) => {
    if (error) return <ErrorMessage text={error?.message} />;

    if (!branchConfig || loading || !hasFetched)
      return <div className="initial-message">Loading branch master...</div>;

    if (view === VIEWTYPE.GRID) {
      if (!gridFilteredData?.length) return <div className="no-data-message">No data found...</div>;
      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map((role, index) => (
            <GridView
              key={index}
              data={role}
              // onStatusChange={updateBranchMasterStatus}
              openDrawer={addNewHandler}
              buttonTitle={setDrawerButtonTitle}
              drawerTitle={setBranchDrawerTitle}
            />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE.LIST) {
      if (!listFilteredData?.length) return <div className="no-data-message">No data found...</div>;

      return (
        <div className="list-view-page-layout">
          <ListView
            data={listFilteredData}
            // onStatusChange={updateRoleMasterStatus}
            columnVisibility={columnVisibility}
            openDrawer={addNewHandler}
            buttonTitle={setDrawerButtonTitle}
            drawerTitle={setBranchDrawerTitle}
          />
        </div>
      );
    }
  };
  return (
    <div className="master-page-size">
      <PageHeader
        title="Branch Master"
        view={cardView}
        onCardView={handleCardView}
        buttonTitle="Add Branch"
        onRefresh={handleRefresh}
        onSearch={searchHandler}
        searchValue={searchQuery}
        onAddNew={addNewHandler}
        onDownload={downloadHandler}
        onFilter={filterDropDown}
        onToggleColumnModal={hideShowHandler}
        hideShowBtnRef={hideShowBtnRef}
        downloadBtnRef={downloadBtnRef}
      />
      <div className="w-full">{renderComponent(cardView)}</div>
      {openBranchDrawer && (
        <div className="fixed inset-0 z-999">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <BranchMasterDrawer
            isOpen={openBranchDrawer}
            onClose={handleDrawerClose}
            buttonTitle={drawerButtonTitle}
            drawerTitle={branchDrawerTitle}
            branchId={branchIdToEdit}
            onCloseDrawer={handleRefresh}
          />
        </div>
      )}
      {loading && <CustomLoader isLoading={loading} />}
      {/* Hide/Show Columns Popup */}
      {hideShowColumn && popupPos && (
        <HideShowColumn
          columnNames={columnNames}
          anchorRef={hideShowBtnRef}
          position={popupPos}
          onClose={() => setHideShowColumn(false)}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
        />
      )}
      {/* download popup * */}
      {onDownload && downloadPopup && (
        <DownloadPopup
          anchorRef={downloadBtnRef}
          position={downloadPopup}
          onClose={() => setOnDownload(false)}
          onDownloadPdf={() => {
            exportListViewData(listFilteredData, "BranchMasterList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "BranchMasterList", "excel");
            setOnDownload(false);
          }}
        />
      )}
    </div>
  );
};

export default BranchMaster;
