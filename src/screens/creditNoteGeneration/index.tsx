import HideShowColumn from "@/components/buttonsPopup";
import DownloadPopup from "@/components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "@/components/customLoader";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { creditNoteGenerationConfig } from "@/config/masterConfig/creditNoteGenerationConfig";
import { VIEWTYPE } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { ColumnVisibility } from "@/types";
import { showWarning } from "@/utils/alert";
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
import { useNavigate } from "react-router-dom";
import CreditNoteViewDetailsPopup from "../creditNoteApproval/components/CreditNoteViewDetailsPopup";
import CreditNoteGenerationActionPopup from "./components/CreditNoteGenerationAction";
import CreditNoteGenerationApprovalCancelPopup from "./components/CreditNoteGenerationApprovalCancelPopup";
import CreditNoteGenerationFilterPopup, {
  CreditNoteApprovalFilterValues,
} from "./components/CreditNoteGenerationFilterPopup";
import {
  CreditNoteGenerationGridCard,
  CreditNoteGenerationItem,
  CreditNoteGenerationListCard,
} from "./types";
import {
  handleCancelButtonClick,
  handleGenerationButtonClick,
  isCancelButtonDisabled,
  isGenerationButtonDisabled,
} from "./utils/creditNoteGenerationAction";

const CreditNoteGeneration = () => {
  const { loading, fetchApi } = useGlobalApi();
  const navigate = useNavigate();
  const branchId = Number(useContext(AuthContext)?.user?.branchId) || 1;
  const branchLists = useGetBranchList()?.branchList?.data ?? [];

  const today = new Date().toISOString().split("T")[0];

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [hasFetched, setHasFetched] = useState(false);

  const { configDataValue: opRefundApprovalConfigFromApi } = useConfigMaster(
    "creditNoteGenerationConfig"
  );
  const activeConfig = opRefundApprovalConfigFromApi || creditNoteGenerationConfig;

  const [queryValue, setQueryValue] = useState({
    branchId: branchId,
    fromDate: today,
    toDate: today,
  });

  const [creditNoteGridData, setCreditNoteGridData] = useState<CreditNoteGenerationGridCard[]>([]);
  const [creditNoteListData, setCreditNoteListData] = useState<CreditNoteGenerationListCard[]>([]);
  const [gridFilteredData, setGridFilteredData] = useState<CreditNoteGenerationGridCard[]>([]);
  const [listFilteredData, setListFilteredData] = useState<CreditNoteGenerationListCard[]>([]);

  const [rawItemMap, setRawItemMap] = useState<Record<number, CreditNoteGenerationItem>>({});

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [renderPopup, setRenderPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [selectedItem, setSelectedItem] = useState<CreditNoteGenerationItem | null>(null);

  const [viewItem, setViewItem] = useState<CreditNoteGenerationItem | null>(null);
  const [renderViewPopup, setRenderViewPopup] = useState(false);
  const [openViewPopup, setOpenViewPopup] = useState(false);

  const [gridActionOpen, setGridActionOpen] = useState(false);
  const [gridActionPopup, setGridActionPopup] = useState<DOMRect | null>(null);
  const [gridActionCreditNoteId, setGridActionCreditNoteId] = useState<number | null>(null);

  const [onDownload, setOnDownload] = useState(false);
  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const hideShowBtnRef = useRef<HTMLButtonElement>(null);
  const downloadBtnRef = useRef<HTMLButtonElement>(null);
  const lastWarningShownRef = useRef<string>("");

  const getCreditNoteApprovalList = useCallback(
    async (params: { branchId: number; fromDate: string; toDate: string }) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CREDIT_NOTE_REQUEST_LIST_FOR_APPROVAL,
        {},
        { params },
        { component: "CreditNoteGeneration" }
      );

      const rawData = (resp?.data ?? []).map((item: CreditNoteGenerationItem) => ({
        ...item,
        CreditNoteId: Number(item.CreditNoteId),
        IsPaymentCollected: Number(item.IsPaymentCollected ?? 0),
        IsDiscountApproved: Number(item.IsDiscountApproved ?? 0),
        TotalApprovedDiscountPerOnBill: null,
        DiscountApprovedID: item.DiscountApprovedID ?? null,
        DiscountApprovedName: item.DiscountApprovedName ?? null,
        DiscountReason: item.DiscountReason ?? null,
        Remark: item.Remark ?? null,
      }));

      const transformed = transformDataWithConfig(activeConfig, resp);

      setRawItemMap(
        Object.fromEntries(
          rawData.map((item: CreditNoteGenerationItem) => [Number(item.CreditNoteId), item])
        )
      );
      if (!transformed?.gridView?.length && !transformed?.listView?.length) {
        setCreditNoteGridData([]);
        setCreditNoteListData([]);
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

      setCreditNoteGridData(transformed?.gridView ?? []);
      setCreditNoteListData(transformed?.listView ?? []);
      setGridFilteredData(transformed?.gridView ?? []);
      setListFilteredData(transformed?.listView ?? []);
      setHasFetched(true);
    },
    [activeConfig]
  );

  useEffect(() => {
    if (!activeConfig) return;

    void getCreditNoteApprovalList({
      branchId: branchId || 1,
      fromDate: today,
      toDate: today,
    });
  }, [activeConfig, branchId, getCreditNoteApprovalList, today]);

  const handleCardView = (view: string) => setCardView(view);

  const handleRefresh = useCallback(async () => {
    lastWarningShownRef.current = "";
    await getCreditNoteApprovalList(queryValue);
    setSearchQuery("");
  }, [getCreditNoteApprovalList, queryValue]);

  const searchHandler = useCallback(
    (keyInput: string, selectedValue = "") => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue,
        listData: creditNoteListData as never,
        gridData: creditNoteGridData as never,
        setListFilteredData: setListFilteredData as never,
        setGridFilteredData: setGridFilteredData as never,
      });
    },
    [creditNoteGridData, creditNoteListData]
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

  const onFilterCreditNoteApproval = useCallback(() => {
    setFilterModalOpen(true);
  }, []);

  const applyFilterHandler = useCallback(
    async (params: CreditNoteApprovalFilterValues) => {
      lastWarningShownRef.current = "";
      setQueryValue(params);
      setSearchQuery("");
      await getCreditNoteApprovalList(params);
      setFilterModalOpen(false);
    },
    [getCreditNoteApprovalList]
  );

  const filterDropDown = creditNoteListData?.[0]?.columns;

  const openCancelPopup = useCallback((item: CreditNoteGenerationItem) => {
    setSelectedItem(item);
    setPopupType("cancel");
    setRenderPopup(true);
    setOpenPopup(true);
  }, []);

  const generationHandler = useCallback(
    (item: CreditNoteGenerationItem) => {
      navigate("/credit-note", {
        state: {
          creditNoteId: item.CreditNoteId,
          item,
        },
      });
    },
    [navigate]
  );

  const viewHandler = useCallback((item: CreditNoteGenerationItem) => {
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
    void getCreditNoteApprovalList(queryValue);
  }, [getCreditNoteApprovalList, queryValue]);

  const gridActionHandler = (CreditNoteId: number, rect: DOMRect) => {
    if (gridActionOpen && gridActionCreditNoteId === CreditNoteId) {
      setGridActionOpen(false);
      return;
    }

    setGridActionPopup(rect);
    setGridActionCreditNoteId(CreditNoteId);
    setGridActionOpen(true);
  };

  const shouldShowGridButton = useCallback((_action: string, _id: number) => {
    return true;
  }, []);

  const isGridButtonDisabled = useCallback(
    (action: string, id: number) => {
      const item = rawItemMap[id];
      if (action === "toggleGenerationCreditNote") {
        return isGenerationButtonDisabled(item);
      }
      if (action === "toggleCancelCreditNote") {
        return isCancelButtonDisabled(item);
      }
      return false;
    },
    [rawItemMap]
  );

  const getGridButtonLabel = useCallback((label: string, action: string) => {
    if (action === "toggleGenerationCreditNote") {
      return "Generation";
    }
    if (action === "toggleCancelCreditNote") {
      return "Cancel";
    }
    return label;
  }, []);

  const customButtonClickHandler = useCallback(
    (action: string, id: number) => {
      const item = rawItemMap[id];
      if (!item) return;

      if (action === "toggleGenerationCreditNote") {
        handleGenerationButtonClick(item, generationHandler);
        return;
      }

      if (action === "toggleCancelCreditNote") {
        handleCancelButtonClick(item, openCancelPopup);
      }
    },
    [rawItemMap, generationHandler, openCancelPopup]
  );

  const renderRowActionMenu = useCallback(
    (rowData: { id: number }, closeMenu: () => void) => {
      const item = rawItemMap[rowData.id];
      if (!item) return null;

      const runAction = (action: (selected: CreditNoteGenerationItem) => void) => {
        action(item);
        closeMenu();
      };

      const generationDisabled = isGenerationButtonDisabled(item);
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
              disabled={generationDisabled}
              aria-disabled={generationDisabled}
              className={`w-full text-left px-3 py-2 text-gray-700 ${
                generationDisabled ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-50"
              }`}
              onClick={() => handleGenerationButtonClick(item, () => runAction(generationHandler))}
            >
              Generation
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
    [rawItemMap, generationHandler, openCancelPopup, viewHandler]
  );

  // render component

  const renderComponent = (view: string) => {
    if (!activeConfig || !hasFetched) {
      return <div className="initial-message">Loading credit note generation...</div>;
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
        title="Credit Note Generation"
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
        onFilterDiscountApproval={onFilterCreditNoteApproval}
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
            exportListViewData(listFilteredData, "CreditNoteGenerationList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "CreditNoteGenerationList", "excel");
            setOnDownload(false);
          }}
        />
      )}

      {gridActionOpen && gridActionCreditNoteId ? (
        <CreditNoteGenerationActionPopup
          creditNoteId={gridActionCreditNoteId}
          rawItemMap={rawItemMap}
          anchorRect={gridActionPopup}
          onClose={() => setGridActionOpen(false)}
          onView={viewHandler}
          onGeneration={generationHandler}
          onCancel={openCancelPopup}
        />
      ) : null}

      {renderViewPopup && viewItem && (
        <CreditNoteViewDetailsPopup
          isOpen={openViewPopup}
          creditNoteId={viewItem?.CreditNoteId ?? 0}
          onClose={closeViewHandler}
        />
      )}

      {renderPopup && (
        <CreditNoteGenerationApprovalCancelPopup
          isOpen={openPopup}
          popupType={popupType}
          item={selectedItem}
          onClose={closeHandler}
          onSuccess={popupSuccessHandler}
        />
      )}

      <CreditNoteGenerationFilterPopup
        isOpen={filterModalOpen}
        onClose={closeFilterModal}
        onApply={applyFilterHandler}
        initialValues={queryValue}
        branchList={branchLists}
      />

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default CreditNoteGeneration;
