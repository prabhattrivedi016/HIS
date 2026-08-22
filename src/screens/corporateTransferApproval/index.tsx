import HideShowColumn from "@/components/buttonsPopup";
import DownloadPopup from "@/components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "@/components/customLoader";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { corporateTransferApprovalConfig } from "@/config/masterConfig/corporateTransferApprovalConfig";
import { VIEWTYPE } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { ColumnVisibility } from "@/types";
import { showWarning } from "@/utils/alert";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { exportListViewData } from "@/utils/exportUtils";
import { filteredData } from "@/utils/filteredData";
import { transformDataWithConfig } from "@/utils/utilities";
import {
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CorporateTransferApprovalActionPopup from "./components/CorporateTransferApprovalActionPopup";
import CorporateTransferApprovalConfirmCancelPopup from "./components/CorporateTransferApprovalConfirmCancelPopup";
import CorporateTransferApprovalViewDetailsPopup from "./components/CorporateTransferApprovalViewDetailsPopup";
import CorporateTransferFilterPopup, {
  CorporateTransferApprovalFilterValues,
} from "./components/CorporateTransferFilterPopup";
import {
  CorporateTransferApprovalGridCard,
  CorporateTransferApprovalItem,
  CorporateTransferApprovalListCard,
} from "./types";
import {
  getApproveDisabledWarning,
  handleApproveButtonClick,
  handleCancelButtonClick,
  isApproveButtonDisabled,
  isCancelButtonDisabled,
} from "./utils/corporateTransferApprovalAction";

const CorporateTransferApproval = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = Number(useContext(AuthContext)?.user?.branchId) || 1;
  const today = new Date().toISOString().split("T")[0];
  const branchLists = useGetBranchList()?.branchList?.data ?? [];

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [hasFetched, setHasFetched] = useState(false);

  const { configDataValue: corporateTransferApprovalConfigFromApi } = useConfigMaster(
    "corporateTransferApproval"
  );
  const activeConfig = corporateTransferApprovalConfigFromApi || corporateTransferApprovalConfig;

  const [queryValue, setQueryValue] = useState({
    branchId: branchId,
    fromDate: today,
    toDate: today,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [corporateTransferApprovalGridData, setCorporateTransferApprovalGridData] = useState<
    CorporateTransferApprovalGridCard[]
  >([]);
  const [corporateTransferApprovalListData, setCorporateTransferApprovalListData] = useState<
    CorporateTransferApprovalListCard[]
  >([]);
  const [gridFilteredData, setGridFilteredData] = useState<CorporateTransferApprovalGridCard[]>([]);
  const [listFilteredData, setListFilteredData] = useState<CorporateTransferApprovalListCard[]>([]);

  const [rawItemMap, setRawItemMap] = useState<Record<number, CorporateTransferApprovalItem>>({});

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [renderPopup, setRenderPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [selectedItem, setSelectedItem] = useState<CorporateTransferApprovalItem | null>(null);

  const [viewItem, setViewItem] = useState<CorporateTransferApprovalItem | null>(null);
  const [renderViewPopup, setRenderViewPopup] = useState(false);
  const [openViewPopup, setOpenViewPopup] = useState(false);

  const [gridActionOpen, setGridActionOpen] = useState(false);
  const [gridActionPopup, setGridActionPopup] = useState<DOMRect | null>(null);
  const [gridActionWriteOffId, setGridActionWriteOffId] = useState<number | null>(null);

  const [onDownload, setOnDownload] = useState(false);
  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const hideShowBtnRef = useRef<HTMLButtonElement>(null);
  const downloadBtnRef = useRef<HTMLButtonElement>(null);
  const lastWarningShownRef = useRef<string>("");

  const getCorporateTransferApprovalList = useCallback(
    async (params: { branchId: number; fromDate: string; toDate: string }) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CORPORATE_TRANSFER_REQUEST_LIST_FOR_APPROVAL,
        {},
        { params },
        { component: "CorporateTransferApproval" }
      );

      const rawData = (resp?.data ?? []).map((item: any) => ({
        ...item,
        CorporateTransferId: Number(item.CorporateTransferId),
      }));

      const transformed = transformDataWithConfig(activeConfig, resp);

      setRawItemMap(
        Object.fromEntries(
          rawData.map((item: CorporateTransferApprovalItem) => [
            Number(item.CorporateTransferId),
            item,
          ])
        )
      );
      if (!transformed?.gridView?.length && !transformed?.listView?.length) {
        setCorporateTransferApprovalGridData([]);
        setCorporateTransferApprovalListData([]);
        setGridFilteredData([]);
        setListFilteredData([]);
        setHasFetched(true);

        const paramsKey = JSON.stringify(params);
        if (lastWarningShownRef.current !== paramsKey) {
          showWarning("No data found");
          lastWarningShownRef.current = paramsKey;
        }
        return;
      }

      setCorporateTransferApprovalGridData(transformed?.gridView ?? []);
      setCorporateTransferApprovalListData(transformed?.listView ?? []);
      setGridFilteredData(transformed?.gridView ?? []);
      setListFilteredData(transformed?.listView ?? []);
      setHasFetched(true);
    },
    [activeConfig]
  );

  useEffect(() => {
    if (!activeConfig) return;

    void getCorporateTransferApprovalList({
      branchId: branchId || 1,
      fromDate: formatToDDMMYYYY(today),
      toDate: formatToDDMMYYYY(today),
    });
  }, [activeConfig, branchId, getCorporateTransferApprovalList, today]);

  const handleCardView = (view: string) => setCardView(view);

  const handleRefresh = useCallback(async () => {
    lastWarningShownRef.current = "";
    await getCorporateTransferApprovalList(queryValue);
    setSearchQuery("");
  }, [getCorporateTransferApprovalList, queryValue]);

  const searchHandler = useCallback(
    (keyInput: string, selectedValue = "") => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue,
        listData: corporateTransferApprovalListData as never,
        gridData: corporateTransferApprovalGridData as never,
        setListFilteredData: setListFilteredData as never,
        setGridFilteredData: setGridFilteredData as never,
      });
    },
    [corporateTransferApprovalGridData, corporateTransferApprovalListData]
  );

  useEffect(() => {
    if (listFilteredData.length > 0) {
      const visibility: Record<string, boolean> = {};
      listFilteredData[0].columns.forEach(col => {
        visibility[col.label] = true;
      });
      setColumnVisibility(visibility);
    }
  }, [listFilteredData]);

  const columnNames = useMemo(() => {
    if (cardView === VIEWTYPE.LIST && listFilteredData.length > 0) {
      return [
        listFilteredData[0]?.listLeftButton?.[0]?.label || "Action",
        ...(listFilteredData[0]?.columns?.map(col => col.label) || []),
      ];
    }
    return [];
  }, [cardView, listFilteredData]);

  const downloadHandler = () => {
    if (!downloadBtnRef.current) return;
    const rect = downloadBtnRef.current.getBoundingClientRect();
    setDownloadPopup({
      top: rect.bottom + window.scrollY - 12,
      left: rect.left + window.scrollX + 12,
    });
    setOnDownload(prev => !prev);
  };

  const hideShowHandler = useCallback(() => {
    if (hideShowBtnRef.current) {
      const rect = hideShowBtnRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 5, left: rect.left });
    }
    setHideShowColumn(prev => !prev);
  }, []);

  const closeFilterModal = useCallback(() => {
    setFilterModalOpen(false);
  }, []);

  const onFilterWriteOffApproval = useCallback(() => {
    setFilterModalOpen(true);
  }, []);

  const applyFilterHandler = useCallback(
    async (params: CorporateTransferApprovalFilterValues) => {
      lastWarningShownRef.current = "";
      setQueryValue(params);
      setSearchQuery("");
      await getCorporateTransferApprovalList(params);
      setFilterModalOpen(false);
    },
    [getCorporateTransferApprovalList]
  );

  const filterDropDown = corporateTransferApprovalListData?.[0]?.columns;

  const openApprovePopup = useCallback((item: CorporateTransferApprovalItem) => {
    setSelectedItem(item);
    setPopupType("approve");
    setRenderPopup(true);
    setOpenPopup(true);
  }, []);

  const openCancelPopup = useCallback((item: CorporateTransferApprovalItem) => {
    setSelectedItem(item);
    setPopupType("cancel");
    setRenderPopup(true);
    setOpenPopup(true);
  }, []);

  const viewHandler = useCallback((item: CorporateTransferApprovalItem) => {
    setViewItem(item);
    setRenderViewPopup(true);
    setOpenViewPopup(true);
  }, []);

  const closeViewHandler = useCallback(() => {
    setOpenViewPopup(false);
    setTimeout(() => {
      setRenderViewPopup(false);
      setViewItem(null);
    }, 300);
  }, []);

  const closeHandler = useCallback(() => {
    setOpenPopup(false);
    setTimeout(() => {
      setRenderPopup(false);
      setSelectedItem(null);
      setPopupType("");
    }, 300);
  }, []);

  const popupSuccessHandler = useCallback(() => {
    void getCorporateTransferApprovalList(queryValue);
  }, [getCorporateTransferApprovalList, queryValue]);

  const gridActionHandler = (WriteOffId: number, rect: DOMRect) => {
    if (gridActionOpen && gridActionWriteOffId === WriteOffId) {
      setGridActionOpen(false);
      return;
    }

    setGridActionPopup(rect);
    setGridActionWriteOffId(WriteOffId);
    setGridActionOpen(true);
  };

  const shouldShowGridButton = useCallback((_action: string, _id: number) => {
    return true;
  }, []);

  const isGridButtonDisabled = useCallback(
    (action: string, id: number) => {
      const item = rawItemMap[id];
      if (action === "toggleCorporateTransferApprove") {
        return isApproveButtonDisabled(item);
      }
      if (action === "toggleCorporateTransferCancel") {
        return isCancelButtonDisabled(item);
      }
      return false;
    },
    [rawItemMap]
  );

  const getGridButtonLabel = useCallback((label: string, action: string) => {
    if (action === "toggleCorporateTransferApprove") {
      return "Approve";
    }
    if (action === "toggleCorporateTransferCancel") {
      return "Cancel";
    }
    return label;
  }, []);

  const customButtonClickHandler = useCallback(
    (action: string, id: number) => {
      const item = rawItemMap[id];
      if (!item) return;

      if (action === "toggleCorporateTransferApprove") {
        if (isApproveButtonDisabled(item)) {
          const warning = getApproveDisabledWarning(item);
          if (warning) showWarning(warning);
          return;
        }
        handleApproveButtonClick(item, openApprovePopup);
        return;
      }

      if (action === "toggleCorporateTransferCancel") {
        handleCancelButtonClick(item, openCancelPopup);
      }
    },
    [rawItemMap, openApprovePopup, openCancelPopup]
  );

  const renderRowActionMenu = useCallback(
    (rowData: { id: number }, closeMenu: () => void) => {
      const item = rawItemMap[rowData.id];
      if (!item) return null;

      const runAction = (action: (selected: CorporateTransferApprovalItem) => void) => {
        action(item);
        closeMenu();
      };

      const approveDisabled = isApproveButtonDisabled(item);
      const cancelDisabled = isCancelButtonDisabled(item);

      return (
        <ul className="text-sm">
          <li>
            <button
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-700"
              onClick={() => runAction(viewHandler)}
            >
              View
            </button>
          </li>
          <li>
            <button
              type="button"
              disabled={approveDisabled}
              aria-disabled={approveDisabled}
              className={`w-full text-left px-3 py-2 text-gray-700 ${
                approveDisabled ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-50"
              }`}
              onClick={() => handleApproveButtonClick(item, () => runAction(openApprovePopup))}
            >
              Approve
            </button>
          </li>
          <li>
            <button
              type="button"
              disabled={cancelDisabled}
              aria-disabled={cancelDisabled}
              className={`w-full text-left px-3 py-2 text-gray-700 ${
                cancelDisabled ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-50"
              }`}
              onClick={() => handleCancelButtonClick(item, () => runAction(openCancelPopup))}
            >
              Cancel
            </button>
          </li>
        </ul>
      );
    },
    [rawItemMap, openApprovePopup, openCancelPopup, viewHandler]
  );

  //   render  component
  const renderComponent = (view: string) => {
    if (!activeConfig || !hasFetched) {
      return <div className="initial-message">Loading corporate transfer approval...</div>;
    }

    if (view === VIEWTYPE.GRID) {
      if (!gridFilteredData.length) return <div className="no-data-message">No records found</div>;

      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map(item => (
            <GridView
              key={item.id}
              data={item}
              cardRightTopBtn={gridActionHandler}
              onCustomButtonClick={customButtonClickHandler}
              shouldShowButton={shouldShowGridButton}
              getCustomButtonLabel={getGridButtonLabel}
              isButtonDisabled={isGridButtonDisabled}
            />
          ))}
        </div>
      );
    }

    if (view === VIEWTYPE.LIST) {
      if (!listFilteredData.length) return <div className="no-data-message">No records found</div>;

      return (
        <div className="list-view-page-layout">
          <ListView
            data={listFilteredData}
            columnVisibility={columnVisibility}
            renderRowActionMenu={renderRowActionMenu}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="master-page-size">
      <PageHeader
        title="Corporate Transfer Approval"
        view={cardView}
        onCardView={handleCardView}
        buttonTitle=""
        showAddButton={false}
        onRefresh={handleRefresh}
        onSearch={searchHandler}
        searchValue={searchQuery}
        onAddNew={() => {}}
        onDownload={downloadHandler}
        onFilter={filterDropDown}
        onToggleColumnModal={hideShowHandler}
        hideShowBtnRef={hideShowBtnRef as RefObject<HTMLElement>}
        downloadBtnRef={downloadBtnRef as RefObject<HTMLElement>}
        onFilterDiscountApproval={onFilterWriteOffApproval}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {hideShowColumn && popupPos && (
        <HideShowColumn
          columnNames={columnNames}
          anchorRef={hideShowBtnRef as RefObject<HTMLElement>}
          position={popupPos}
          onClose={() => setHideShowColumn(false)}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
        />
      )}

      {onDownload && downloadPopup && (
        <DownloadPopup
          anchorRef={downloadBtnRef as RefObject<HTMLElement>}
          position={downloadPopup}
          onClose={() => setOnDownload(false)}
          onDownloadPdf={() => {
            exportListViewData(listFilteredData, "WriteOffApprovalList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "WriteOffApprovalList", "excel");
            setOnDownload(false);
          }}
        />
      )}

      {gridActionOpen && gridActionWriteOffId ? (
        <CorporateTransferApprovalActionPopup
          writeOffId={gridActionWriteOffId}
          rawItemMap={rawItemMap}
          anchorRect={gridActionPopup}
          onClose={() => setGridActionOpen(false)}
          onView={viewHandler}
          onApprove={openApprovePopup}
          onCancel={openCancelPopup}
        />
      ) : null}

      {renderViewPopup && viewItem && (
        <CorporateTransferApprovalViewDetailsPopup
          isOpen={openViewPopup}
          item={viewItem}
          onClose={closeViewHandler}
        />
      )}

      {renderPopup && (
        <CorporateTransferApprovalConfirmCancelPopup
          isOpen={openPopup}
          popupType={popupType}
          item={selectedItem}
          onClose={closeHandler}
          onSuccess={popupSuccessHandler}
        />
      )}

      <CorporateTransferFilterPopup
        isOpen={filterModalOpen}
        onClose={closeFilterModal}
        onApply={applyFilterHandler}
        initialValues={queryValue}
        branchList={branchLists}
      />

      {loading ? <CustomLoader isLoading={loading} /> : null}
    </div>
  );
};

export default CorporateTransferApproval;
