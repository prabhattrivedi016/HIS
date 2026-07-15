import HideShowColumn from "@/components/buttonsPopup";
import DownloadPopup from "@/components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "@/components/customLoader";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { opRefundPaymentConfig } from "@/config/masterConfig/opRefundPayment";
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
import ApproveCancelPopup from "../opRefundApproval/components/ApproveCancelPopup";
import OpRefundFilterModal, {
  OpRefundApprovalFilterValues,
} from "../opRefundApproval/components/OpRefundFilterModal";
import OpRefundViewDetails from "../opRefundApproval/components/OpRefundViewDetails";
import { OpRefundApprovalItem } from "../opRefundApproval/types";
import OpRefundPaymentActionPopup from "./components/OpRefundPaymentActionPopup";
import { OPRefundPaymentItem, OpRefundPaymentGridCard, OpRefundPaymentListCard } from "./types";
import {
  handleCancelPaymentButtonClick,
  handleCollectPaymentButtonClick,
  isCancelPaymentButtonDisabled,
  isCollectPaymentButtonDisabled,
  shouldShowCancelPaymentButton,
  shouldShowCollectPaymentButton,
} from "./utils/opRefundPaymentActions";
import {
  getDefaultOpRefundPaymentFilters,
  opRefundPaymentStateRef,
  saveOpRefundPaymentState,
} from "./utils/opRefundPaymentStateRef";

const OPRefundPayment = () => {
  const navigate = useNavigate();
  const { loading, fetchApi } = useGlobalApi();
  const branchLists = useGetBranchList()?.branchList?.data ?? [];
  const authBranchId = Number(useContext(AuthContext)?.user?.branchId) || 1;
  const today = new Date().toISOString().split("T")[0];

  const { configDataValue: opRefundPaymentConfigFromApi } = useConfigMaster("opRefundPayment");
  const activeConfig = opRefundPaymentConfigFromApi || opRefundPaymentConfig;
  const defaultFilters = useMemo(
    () => getDefaultOpRefundPaymentFilters(authBranchId, today),
    [authBranchId, today]
  );
  const cachedState = opRefundPaymentStateRef.current;

  const [queryValue, setQueryValue] = useState<OpRefundApprovalFilterValues>(
    () => cachedState?.queryValue ?? defaultFilters
  );

  const [opRefundPaymentGridData, setOpRefundPaymentGridData] = useState<OpRefundPaymentGridCard[]>(
    () => cachedState?.opRefundPaymentGridData ?? []
  );
  const [opRefundPaymentListData, setOpRefundPaymentListData] = useState<OpRefundPaymentListCard[]>(
    () => cachedState?.opRefundPaymentListData ?? []
  );
  const [gridFilteredData, setGridFilteredData] = useState<OpRefundPaymentGridCard[]>(
    () => cachedState?.gridFilteredData ?? []
  );
  const [listFilteredData, setListFilteredData] = useState<OpRefundPaymentListCard[]>(
    () => cachedState?.listFilteredData ?? []
  );
  const [rawItemMap, setRawItemMap] = useState<Record<number, OPRefundPaymentItem>>(
    () => cachedState?.rawItemMap ?? {}
  );

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [hasFetched, setHasFetched] = useState(() => cachedState?.hasFetched ?? false);
  const [cardView, setCardView] = useState(() => cachedState?.cardView ?? VIEWTYPE.GRID);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedItem, setSelectedItem] = useState<OPRefundPaymentItem | null>(null);
  const [renderPopup, setRenderPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);

  const [viewItem, setViewItem] = useState<OPRefundPaymentItem | null>(null);
  const [renderViewPopup, setRenderViewPopup] = useState(false);
  const [openViewPopup, setOpenViewPopup] = useState(false);

  const [gridActionOpen, setGridActionOpen] = useState(false);
  const [gridActionPopup, setGridActionPopup] = useState<DOMRect | null>(null);
  const [gridActionRefundId, setGridActionRefundId] = useState<number | null>(null);

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

  const getOpRefundPaymentList = useCallback(
    async (params: OpRefundApprovalFilterValues) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_OPD_REFUND_REQUEST_LIST_FOR_APPROVAL,
        {},
        { params },
        { component: "OPRefundPayment" }
      );

      const rawData: OPRefundPaymentItem[] = ((resp?.data ?? []) as OPRefundPaymentItem[]).map(
        item => ({
          ...item,
          RefundId: Number(item.RefundId),
        })
      );
      const transformed = transformDataWithConfig(activeConfig, resp);
      const nextRawItemMap = Object.fromEntries(rawData.map(item => [Number(item.RefundId), item]));
      const nextGridData = transformed?.gridView ?? [];
      const nextListData = transformed?.listView ?? [];

      setRawItemMap(nextRawItemMap);
      setOpRefundPaymentGridData(nextGridData);
      setOpRefundPaymentListData(nextListData);
      setGridFilteredData(nextGridData);
      setListFilteredData(nextListData);
      setHasFetched(true);

      saveOpRefundPaymentState({
        queryValue: params,
        opRefundPaymentGridData: nextGridData,
        opRefundPaymentListData: nextListData,
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

    const cached = opRefundPaymentStateRef.current;
    if (cached?.shouldRefreshOnReturn) {
      setQueryValue(cached.queryValue);
      setCardView(cached.cardView);
      opRefundPaymentStateRef.current = {
        ...cached,
        shouldRefreshOnReturn: false,
      };
      void getOpRefundPaymentList(cached.queryValue);
      return;
    }

    if (cached?.hasFetched) {
      setQueryValue(cached.queryValue);
      setOpRefundPaymentGridData(cached.opRefundPaymentGridData);
      setOpRefundPaymentListData(cached.opRefundPaymentListData);
      setGridFilteredData(cached.gridFilteredData);
      setListFilteredData(cached.listFilteredData);
      setRawItemMap(cached.rawItemMap);
      setHasFetched(true);
      setCardView(cached.cardView);
      return;
    }

    void getOpRefundPaymentList(defaultFilters);
  }, [activeConfig, defaultFilters, getOpRefundPaymentList]);

  const handleCardView = (view: string) => {
    setCardView(view);
    if (opRefundPaymentStateRef.current) {
      opRefundPaymentStateRef.current = {
        ...opRefundPaymentStateRef.current,
        cardView: view,
      };
    }
  };

  const handleRefresh = useCallback(async () => {
    await getOpRefundPaymentList(queryValue);
    setSearchQuery("");
  }, [getOpRefundPaymentList, queryValue]);

  const searchHandler = useCallback(
    (keyInput: string, selectedValue = "") => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue,
        listData: opRefundPaymentListData as never,
        gridData: opRefundPaymentGridData as never,
        setListFilteredData: setListFilteredData as never,
        setGridFilteredData: setGridFilteredData as never,
      });
    },
    [opRefundPaymentGridData, opRefundPaymentListData]
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

  const onFilterRefundPayment = useCallback(() => {
    setFilterModalOpen(true);
  }, []);

  const closeFilterModal = useCallback(() => {
    setFilterModalOpen(false);
  }, []);

  const applyFilterHandler = useCallback(
    async (params: OpRefundApprovalFilterValues) => {
      setQueryValue(params);
      setSearchQuery("");
      await getOpRefundPaymentList(params);
      setFilterModalOpen(false);
    },
    [getOpRefundPaymentList]
  );

  const filterDropDown = opRefundPaymentListData?.[0]?.columns;

  const openCancelPopup = (item: OPRefundPaymentItem) => {
    setSelectedItem(item);
    setRenderPopup(true);
    setOpenPopup(true);
  };

  const viewHandler = (item: OPRefundPaymentItem) => {
    setViewItem(item);
    setRenderViewPopup(true);
    setOpenViewPopup(true);
  };

  const collectPaymentHandler = (item: OPRefundPaymentItem) => {
    saveOpRefundPaymentState({
      queryValue,
      opRefundPaymentGridData,
      opRefundPaymentListData,
      gridFilteredData,
      listFilteredData,
      rawItemMap,
      hasFetched,
      cardView,
    });

    navigate("/opd-refund", {
      state: {
        refundId: item.RefundId,
        visitId: item.VisitId,
        tokenNo: item.TokenNo,
        uhid: item.UHID,
        patientId: item.PatientId,
        patientName: item.PatientName,
        age: item.Age,
        fromRefundPayment: true,
      },
    });
  };

  const closeHandler = useCallback(() => {
    setOpenPopup(false);
    setTimeout(() => {
      setRenderPopup(false);
      setSelectedItem(null);
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
    void getOpRefundPaymentList(queryValue);
  }, [getOpRefundPaymentList, queryValue]);

  const gridActionHandler = (refundId: number, rect: DOMRect) => {
    if (gridActionOpen && gridActionRefundId === refundId) {
      setGridActionOpen(false);
      return;
    }

    setGridActionPopup(rect);
    setGridActionRefundId(refundId);
    setGridActionOpen(true);
  };

  const shouldShowGridButton = useCallback(
    (action: string, refundId: number) => {
      const item = rawItemMap[refundId];
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
    (action: string, refundId: number) => {
      const item = rawItemMap[refundId];
      if (action === "togglePaymentCollection") return isCollectPaymentButtonDisabled(item);
      if (action === "toggleCancelPayment") return isCancelPaymentButtonDisabled(item);
      return false;
    },
    [rawItemMap]
  );

  const customButtonClickHandler = useCallback(
    (action: string, refundId: number) => {
      const item = rawItemMap[refundId];
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

      const runAction = (action: (selected: OPRefundPaymentItem) => void) => {
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
                disabled={isCollectPaymentButtonDisabled(item)}
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
      return <div className="initial-message">Loading OP Refund Payment...</div>;
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
        title="OP Refund Payment"
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
        onFilterDiscountApproval={onFilterRefundPayment}
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
            exportListViewData(listFilteredData, "OpRefundPaymentList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "OpRefundPaymentList", "excel");
            setOnDownload(false);
          }}
        />
      )}

      {gridActionOpen && gridActionRefundId ? (
        <OpRefundPaymentActionPopup
          refundId={gridActionRefundId}
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
          popupType="cancel"
          item={selectedItem as OpRefundApprovalItem | null}
          onClose={closeHandler}
          onSuccess={popupSuccessHandler}
        />
      )}

      {renderViewPopup && (
        <OpRefundViewDetails
          isOpen={openViewPopup}
          item={viewItem ? { RefundId: Number(viewItem.RefundId) } : null}
          onClose={closeViewHandler}
        />
      )}

      <OpRefundFilterModal
        isOpen={filterModalOpen}
        onClose={closeFilterModal}
        onApply={applyFilterHandler}
        initialValues={queryValue}
        branchList={branchLists}
        modalTitle="Filter OP Refund Payment"
      />

      {loading ? <CustomLoader isLoading={loading} /> : null}
    </div>
  );
};

export default OPRefundPayment;
