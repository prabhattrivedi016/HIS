import HideShowColumn from "@/components/buttonsPopup";
import DownloadPopup from "@/components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "@/components/customLoader";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { opPaymentConfig } from "@/config/masterConfig/opPaymentConfig";
import { VIEWTYPE } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { ColumnVisibility } from "@/types";
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
import ApproveCancelPopup from "../opDiscountApproval/components/ApproveCancelPopup";
import OpDiscountFilterModal, {
  OpDiscountFilterValues,
} from "../opDiscountApproval/components/OpDiscountFilterModal";
import ViewDetailsPopup from "../opDiscountApproval/components/ViewDetailsPopup";
import OpPaymentActionPopup from "./components/OpPaymentActionPopup";
import { OPPaymentItem, OpPaymentGridCard, OpPaymentListCard } from "./types";
import {
  handleCancelPaymentButtonClick,
  handleCollectPaymentButtonClick,
  isCancelPaymentButtonDisabled,
  isCollectPaymentButtonDisabled,
  shouldShowCancelPaymentButton,
  shouldShowCollectPaymentButton,
} from "./utils/opPaymentActions";
import {
  getDefaultOpPaymentFilters,
  opPaymentCollectionStateRef,
  saveOpPaymentCollectionState,
} from "./utils/opPaymentCollectionStateRef";

const OPPaymentCollection = () => {
  const navigate = useNavigate();
  const { loading, error, fetchApi } = useGlobalApi();
  const branchLists = useGetBranchList()?.branchList?.data ?? [];
  const authBranchId = Number(useContext(AuthContext)?.user?.branchId) || 1;
  const today = new Date().toISOString().split("T")[0];

  const { configDataValue: opPaymentConfigFromApi } = useConfigMaster("opPaymentCollection");
  const activeConfig = opPaymentConfigFromApi || opPaymentConfig;
  const defaultFilters = useMemo(
    () => getDefaultOpPaymentFilters(authBranchId, today),
    [authBranchId, today]
  );
  const cachedState = opPaymentCollectionStateRef.current;

  const [queryValue, setQueryValue] = useState<OpDiscountFilterValues>(
    () => cachedState?.queryValue ?? defaultFilters
  );

  const [opPaymentGridData, setOpPaymentGridData] = useState<OpPaymentGridCard[]>(
    () => cachedState?.opPaymentGridData ?? []
  );
  const [opPaymentListData, setOpPaymentListData] = useState<OpPaymentListCard[]>(
    () => cachedState?.opPaymentListData ?? []
  );
  const [gridFilteredData, setGridFilteredData] = useState<OpPaymentGridCard[]>(
    () => cachedState?.gridFilteredData ?? []
  );
  const [listFilteredData, setListFilteredData] = useState<OpPaymentListCard[]>(
    () => cachedState?.listFilteredData ?? []
  );
  const [rawItemMap, setRawItemMap] = useState<Record<number, OPPaymentItem>>(
    () => cachedState?.rawItemMap ?? {}
  );

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [hasFetched, setHasFetched] = useState(() => cachedState?.hasFetched ?? false);
  const [cardView, setCardView] = useState(() => cachedState?.cardView ?? VIEWTYPE.GRID);
  const [, setSearchQuery] = useState("");

  const [popupType, setPopupType] = useState("");
  const [selectedItem, setSelectedItem] = useState<OPPaymentItem | null>(null);
  const [renderPopup, setRenderPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);

  const [viewItem, setViewItem] = useState<OPPaymentItem | null>(null);
  const [renderViewPopup, setRenderViewPopup] = useState(false);
  const [openViewPopup, setOpenViewPopup] = useState(false);

  const [gridActionOpen, setGridActionOpen] = useState(false);
  const [gridActionPopup, setGridActionPopup] = useState<DOMRect | null>(null);
  const [gridActionBookingId, setGridActionBookingId] = useState<number | null>(null);

  const [onDownload, setOnDownload] = useState(false);
  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const hideShowBtnRef = useRef<HTMLButtonElement>(null);
  const downloadBtnRef = useRef<HTMLButtonElement>(null);
  const hasInitializedRef = useRef(false);
  const cardViewRef = useRef(cardView);

  useEffect(() => {
    cardViewRef.current = cardView;
  }, [cardView]);

  const getOpPaymentList = useCallback(
    async (params: OpDiscountFilterValues) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_OPD_BOOKING_DETAILS_FOR_PAYMENT_COLLECTION,
        {},
        { params },
        { component: "OPPaymentCollection" }
      );

      const rawData: OPPaymentItem[] = resp?.data ?? [];
      const transformed = transformDataWithConfig(activeConfig, resp);
      const nextRawItemMap = Object.fromEntries(
        rawData.map(item => [Number(item.BookingId), item])
      );
      const nextGridData = transformed?.gridView ?? [];
      const nextListData = transformed?.listView ?? [];

      setRawItemMap(nextRawItemMap);
      setOpPaymentGridData(nextGridData);
      setOpPaymentListData(nextListData);
      setGridFilteredData(nextGridData);
      setListFilteredData(nextListData);
      setHasFetched(true);

      saveOpPaymentCollectionState({
        queryValue: params,
        opPaymentGridData: nextGridData,
        opPaymentListData: nextListData,
        gridFilteredData: nextGridData,
        listFilteredData: nextListData,
        rawItemMap: nextRawItemMap,
        hasFetched: true,
        cardView: cardViewRef.current,
      });
    },
    [activeConfig]
  );

  useEffect(() => {
    if (!activeConfig || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const cached = opPaymentCollectionStateRef.current;
    if (cached?.shouldRefreshOnReturn) {
      setQueryValue(cached.queryValue);
      setCardView(cached.cardView);
      opPaymentCollectionStateRef.current = {
        ...cached,
        shouldRefreshOnReturn: false,
      };
      void getOpPaymentList(cached.queryValue);
      return;
    }

    if (cached?.hasFetched) {
      setQueryValue(cached.queryValue);
      setOpPaymentGridData(cached.opPaymentGridData);
      setOpPaymentListData(cached.opPaymentListData);
      setGridFilteredData(cached.gridFilteredData);
      setListFilteredData(cached.listFilteredData);
      setRawItemMap(cached.rawItemMap);
      setHasFetched(true);
      setCardView(cached.cardView);
      return;
    }

    void getOpPaymentList(defaultFilters);
  }, [activeConfig, defaultFilters, getOpPaymentList]);

  const handleCardView = (view: string) => {
    setCardView(view);
    if (opPaymentCollectionStateRef.current) {
      opPaymentCollectionStateRef.current = {
        ...opPaymentCollectionStateRef.current,
        cardView: view,
      };
    }
  };

  const handleRefresh = useCallback(async () => {
    await getOpPaymentList(queryValue);
    setSearchQuery("");
  }, [getOpPaymentList, queryValue]);

  const searchHandler = useCallback(
    (keyInput: string, selectedValue = "") => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue,
        listData: opPaymentListData as never,
        gridData: opPaymentGridData as never,
        setListFilteredData: setListFilteredData as never,
        setGridFilteredData: setGridFilteredData as never,
      });
    },
    [opPaymentGridData, opPaymentListData]
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

  const onFilterPaymentCollection = useCallback(() => {
    setFilterModalOpen(true);
  }, []);

  const closeFilterModal = useCallback(() => {
    setFilterModalOpen(false);
  }, []);

  const applyFilterHandler = useCallback(
    async (params: OpDiscountFilterValues) => {
      setQueryValue(params);
      setSearchQuery("");
      await getOpPaymentList(params);
      setFilterModalOpen(false);
    },
    [getOpPaymentList]
  );

  const filterDropDown = opPaymentListData?.[0]?.columns;

  const openCancelPopup = (item: OPPaymentItem) => {
    setSelectedItem(item);
    setPopupType("cancel");
    setRenderPopup(true);
    setOpenPopup(true);
  };

  const viewHandler = (item: OPPaymentItem) => {
    setViewItem(item);
    setRenderViewPopup(true);
    setOpenViewPopup(true);
  };

  const collectPaymentHandler = (item: OPPaymentItem) => {
    saveOpPaymentCollectionState({
      queryValue,
      opPaymentGridData,
      opPaymentListData,
      gridFilteredData,
      listFilteredData,
      rawItemMap,
      hasFetched,
      cardView,
    });

    navigate("/opd-billing", {
      state: {
        bookingId: item.BookingId,
        tokenNo: item.TokenNo,
        uhid: item.UHID,
        patientId: item.PatientId,
        fromPaymentCollection: true,
      },
    });
  };

  const closeHandler = useCallback(() => {
    setOpenPopup(false);
    setTimeout(() => {
      setRenderPopup(false);
      setSelectedItem(null);
      setPopupType("");
    }, 300);
  }, []);

  const closeViewHandler = useCallback(() => {
    setOpenViewPopup(false);
    setTimeout(() => {
      setRenderViewPopup(false);
      setViewItem(null);
    }, 300);
  }, []);

  const popupSuccessHandler = useCallback(() => {
    void getOpPaymentList(queryValue);
  }, [getOpPaymentList, queryValue]);

  const gridActionHandler = (bookingId: number, rect: DOMRect) => {
    if (gridActionOpen && gridActionBookingId === bookingId) {
      setGridActionOpen(false);
      return;
    }

    setGridActionPopup(rect);
    setGridActionBookingId(bookingId);
    setGridActionOpen(true);
  };

  const shouldShowGridButton = useCallback(
    (action: string, bookingId: number) => {
      const item = rawItemMap[bookingId];
      if (!item) return false;

      if (action === "togglePaymentCollection") {
        return shouldShowCollectPaymentButton(item);
      }

      if (action === "toggleCancelPayment") {
        return shouldShowCancelPaymentButton(item);
      }

      return false;
    },
    [rawItemMap]
  );

  const isGridButtonDisabled = useCallback(
    (action: string, bookingId: number) => {
      const item = rawItemMap[bookingId];
      if (action === "togglePaymentCollection") return isCollectPaymentButtonDisabled(item);
      if (action === "toggleCancelPayment") return isCancelPaymentButtonDisabled(item);
      return false;
    },
    [rawItemMap]
  );

  const customButtonClickHandler = useCallback(
    (action: string, bookingId: number) => {
      const item = rawItemMap[bookingId];
      if (!item) return;

      if (action === "togglePaymentCollection") {
        handleCollectPaymentButtonClick(item, collectPaymentHandler);
        return;
      }

      if (action === "toggleCancelPayment") {
        handleCancelPaymentButtonClick(item, openCancelPopup);
      }
    },
    [rawItemMap]
  );

  const renderRowActionMenu = useCallback(
    (rowData: { id: number }, closeMenu: () => void) => {
      const item = rawItemMap[rowData.id];
      if (!item) return null;

      const runAction = (action: (selected: OPPaymentItem) => void) => {
        action(item);
        closeMenu();
      };

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
          {shouldShowCollectPaymentButton(item) && (
            <li>
              <button
                type="button"
                aria-disabled={isCollectPaymentButtonDisabled(item)}
                className={`w-full text-left px-3 py-2 text-gray-700 ${
                  isCollectPaymentButtonDisabled(item)
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-50"
                }`}
                onClick={() =>
                  handleCollectPaymentButtonClick(item, () => runAction(collectPaymentHandler))
                }
              >
                Collect Payment
              </button>
            </li>
          )}
          {shouldShowCancelPaymentButton(item) && (
            <li>
              <button
                type="button"
                aria-disabled={isCancelPaymentButtonDisabled(item)}
                className={`w-full text-left px-3 py-2 text-gray-700 ${
                  isCancelPaymentButtonDisabled(item)
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-50"
                }`}
                onClick={() =>
                  handleCancelPaymentButtonClick(item, () => runAction(openCancelPopup))
                }
              >
                Cancel
              </button>
            </li>
          )}
        </ul>
      );
    },
    [rawItemMap]
  );

  const renderComponent = (view: string) => {
    if (!activeConfig || !hasFetched) {
      return <div className="initial-message">Loading OP Payment Collection...</div>;
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
        title="OP Payment Collection"
        view={cardView}
        onCardView={handleCardView}
        buttonTitle=""
        showAddButton={false}
        onRefresh={handleRefresh}
        onSearch={searchHandler}
        onAddNew={() => {}}
        onDownload={downloadHandler}
        onFilter={filterDropDown}
        onToggleColumnModal={hideShowHandler}
        hideShowBtnRef={hideShowBtnRef as RefObject<HTMLElement>}
        downloadBtnRef={downloadBtnRef as RefObject<HTMLElement>}
        onFilterDiscountApproval={onFilterPaymentCollection}
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
            exportListViewData(listFilteredData, "OpPaymentCollectionList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "OpPaymentCollectionList", "excel");
            setOnDownload(false);
          }}
        />
      )}

      {gridActionOpen && gridActionBookingId ? (
        <OpPaymentActionPopup
          bookingId={gridActionBookingId}
          rawItemMap={rawItemMap}
          anchorRect={gridActionPopup}
          onClose={() => setGridActionOpen(false)}
          onView={viewHandler}
          onCollectPayment={collectPaymentHandler}
          onCancel={openCancelPopup}
        />
      ) : null}

      {renderPopup && (
        <ApproveCancelPopup
          isOpen={openPopup}
          popupType={popupType}
          item={selectedItem}
          onClose={closeHandler}
          onSuccess={popupSuccessHandler}
        />
      )}

      {renderViewPopup && (
        <ViewDetailsPopup isOpen={openViewPopup} item={viewItem} onClose={closeViewHandler} />
      )}

      <OpDiscountFilterModal
        isOpen={filterModalOpen}
        onClose={closeFilterModal}
        onApply={applyFilterHandler}
        initialValues={queryValue}
        branchList={branchLists}
        modalTitle="Filter OP Payment Collection"
      />

      {loading ? <CustomLoader isLoading={loading} /> : null}
    </div>
  );
};

export default OPPaymentCollection;
