import HideShowColumn from "@/components/buttonsPopup";
import DownloadPopup from "@/components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "@/components/customLoader";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { opRefundApprovalConfig } from "@/config/masterConfig/opRefundApproval";
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
import OpDiscountActionPopup from "../opDiscountApproval/components/OpDiscountActionPopup";
import type {
  OPDiscountItem,
  OpDiscountGridCard as OpRefundGridCardType,
  OpDiscountListCard as OpRefundListCard,
} from "../opDiscountApproval/types";
import {
  handleApproveButtonClick,
  handleCancelButtonClick,
  isApproveButtonDisabled,
  isCancelButtonDisabled,
  shouldShowApproveButton,
  shouldShowCancelButton,
} from "../opDiscountApproval/utils/opDiscountActions";
import ApproveCancelPopup from "./components/ApproveCancelPopup";
import OpRefundFilterModal, {
  OpRefundApprovalFilterValues,
} from "./components/OpRefundFilterModal";
import OpRefundViewDetails from "./components/OpRefundViewDetails";
import { OpRefundApprovalItem } from "./types";

const OpRefundApproval = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const branchLists = useGetBranchList()?.branchList?.data ?? [];
  const authBranchId = Number(useContext(AuthContext)?.user?.branchId) || 1;
  const today = new Date().toISOString().split("T")[0];

  const { configDataValue: opRefundApprovalConfigFromApi } = useConfigMaster("opRefundApproval");
  const activeConfig = opRefundApprovalConfigFromApi || opRefundApprovalConfig;

  type RefundActionItem = OpRefundApprovalItem &
    OPDiscountItem & {
      BookingId: number;
      IsPaymentCollected: number;
      IsDiscountApproved: number;
      TotalApprovedDiscountPerOnBill: number | null;
      DiscountApprovedID: number | null;
      DiscountApprovedName: string | null;
      DiscountReason: string | null;
      Remark: string | null;
    };

  const [queryValue, setQueryValue] = useState<OpRefundApprovalFilterValues>({
    branchId: authBranchId || 1,
    fromDate: today,
    toDate: today,
  });

  const [opRefundGridData, setOpRefundGridData] = useState<OpRefundGridCardType[]>([]);
  const [opRefundListData, setOpRefundListData] = useState<OpRefundListCard[]>([]);
  const [gridFilteredData, setGridFilteredData] = useState<OpRefundGridCardType[]>([]);
  const [listFilteredData, setListFilteredData] = useState<OpRefundListCard[]>([]);
  const [rawItemMap, setRawItemMap] = useState<Record<number, RefundActionItem>>({});

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [hasFetched, setHasFetched] = useState(false);
  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [searchQuery, setSearchQuery] = useState("");

  const [popupType, setPopupType] = useState<"approve" | "cancel" | "">("");
  const [selectedItem, setSelectedItem] = useState<RefundActionItem | null>(null);
  const [renderPopup, setRenderPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);

  const [viewItem, setViewItem] = useState<RefundActionItem | null>(null);
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

  const getOpRefundList = useCallback(
    async (params: { branchId: number; fromDate: string; toDate: string }) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_OPD_REFUND_REQUEST_LIST_FOR_APPROVAL,
        {},
        { params },
        { component: "OpRefundApproval" }
      );

      const rawData = ((resp?.data ?? []) as OpRefundApprovalItem[]).map(item => ({
        ...item,
        BookingId: Number(item.RefundId),
        IsPaymentCollected: Number(item.IsRefundCollected ?? 0),
        IsDiscountApproved: Number(item.IsRefundApproved ?? 0),
        TotalApprovedDiscountPerOnBill: null,
        DiscountApprovedID: item.RefundApprovedID ?? null,
        DiscountApprovedName: item.RefundApprovedName ?? null,
        DiscountReason: item.RefundReason ?? null,
        Remark: item.RefundRemark ?? null,
      })) as RefundActionItem[];
      const transformed = transformDataWithConfig(activeConfig, resp);

      setRawItemMap(Object.fromEntries(rawData.map(item => [Number(item.BookingId), item])));
      setOpRefundGridData(transformed?.gridView ?? []);
      setOpRefundListData(transformed?.listView ?? []);
      setGridFilteredData(transformed?.gridView ?? []);
      setListFilteredData(transformed?.listView ?? []);
      setHasFetched(true);
    },
    [activeConfig]
  );

  useEffect(() => {
    if (!activeConfig) return;

    void getOpRefundList({
      branchId: authBranchId || 1,
      fromDate: today,
      toDate: today,
    });
  }, [activeConfig, authBranchId, getOpRefundList, today]);

  const handleCardView = (view: string) => setCardView(view);

  const handleRefresh = useCallback(async () => {
    await getOpRefundList(queryValue);
    setSearchQuery("");
  }, [getOpRefundList, queryValue]);

  const searchHandler = useCallback(
    (keyInput: string, selectedValue = "") => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue,
        listData: opRefundListData as never,
        gridData: opRefundGridData as never,
        setListFilteredData: setListFilteredData as never,
        setGridFilteredData: setGridFilteredData as never,
      });
    },
    [opRefundGridData, opRefundListData]
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

  const onFilterDiscountApproval = useCallback(() => {
    setFilterModalOpen(true);
  }, []);

  const closeFilterModal = useCallback(() => {
    setFilterModalOpen(false);
  }, []);

  const applyFilterHandler = useCallback(
    async (params: OpRefundApprovalFilterValues) => {
      setQueryValue(params);
      setSearchQuery("");
      await getOpRefundList(params);
      setFilterModalOpen(false);
    },
    [getOpRefundList]
  );

  const filterDropDown = opRefundListData?.[0]?.columns;

  const openApprovePopup = (item: OPDiscountItem) => {
    setSelectedItem(item as RefundActionItem);
    setPopupType("approve");
    setRenderPopup(true);
    setOpenPopup(true);
  };

  const openCancelPopup = (item: OPDiscountItem) => {
    setSelectedItem(item as RefundActionItem);
    setPopupType("cancel");
    setRenderPopup(true);
    setOpenPopup(true);
  };

  const viewHandler = (item: OPDiscountItem) => {
    setViewItem(item as RefundActionItem);
    setRenderViewPopup(true);
    setOpenViewPopup(true);
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
    void getOpRefundList(queryValue);
  }, [getOpRefundList, queryValue]);

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

      if (action === "toggleApproveDiscount") {
        return shouldShowApproveButton(item);
      }

      if (action === "toggleCancelDiscount") {
        return shouldShowCancelButton(item);
      }

      return false;
    },
    [rawItemMap]
  );

  const isGridButtonDisabled = useCallback(
    (action: string, bookingId: number) => {
      const item = rawItemMap[bookingId];
      if (action === "toggleApproveDiscount") return isApproveButtonDisabled(item);
      if (action === "toggleCancelDiscount") return isCancelButtonDisabled(item);
      return false;
    },
    [rawItemMap]
  );

  const getGridButtonLabel = useCallback((label: string, action: string) => {
    if (action === "toggleApproveDiscount") {
      return "Approve";
    }
    return label;
  }, []);

  const customButtonClickHandler = useCallback(
    (action: string, bookingId: number) => {
      const item = rawItemMap[bookingId];
      if (!item) return;

      if (action === "toggleApproveDiscount") {
        handleApproveButtonClick(item, openApprovePopup);
        return;
      }

      if (action === "toggleCancelDiscount") {
        handleCancelButtonClick(item, openCancelPopup);
      }
    },
    [rawItemMap]
  );

  const renderRowActionMenu = useCallback(
    (rowData: { id: number }, closeMenu: () => void) => {
      const item = rawItemMap[rowData.id];
      if (!item) return null;

      const runAction = (action: (selected: RefundActionItem) => void) => {
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
          {shouldShowApproveButton(item) && (
            <li>
              <button
                type="button"
                aria-disabled={isApproveButtonDisabled(item)}
                className={`w-full text-left px-3 py-2 text-gray-700 ${
                  isApproveButtonDisabled(item)
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-50"
                }`}
                onClick={() => handleApproveButtonClick(item, () => runAction(openApprovePopup))}
              >
                Approve
              </button>
            </li>
          )}
          {shouldShowCancelButton(item) && (
            <li>
              <button
                type="button"
                aria-disabled={isCancelButtonDisabled(item)}
                className={`w-full text-left px-3 py-2 text-gray-700 ${
                  isCancelButtonDisabled(item)
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-50"
                }`}
                onClick={() => handleCancelButtonClick(item, () => runAction(openCancelPopup))}
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
      return <div className="initial-message">Loading OP Refund Approval...</div>;
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
        title="OP Refund Approval"
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
        onFilterDiscountApproval={onFilterDiscountApproval}
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
            exportListViewData(listFilteredData, "OpRefundApprovalList", "pdf");
            setOnDownload(false);
          }}
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "OpRefundApprovalList", "excel");
            setOnDownload(false);
          }}
        />
      )}

      {gridActionOpen && gridActionBookingId ? (
        <OpDiscountActionPopup
          bookingId={gridActionBookingId}
          rawItemMap={rawItemMap as Record<number, OPDiscountItem>}
          anchorRect={gridActionPopup}
          onClose={() => setGridActionOpen(false)}
          onView={viewHandler}
          onApprove={openApprovePopup}
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
      />

      {loading ? <CustomLoader isLoading={loading} /> : null}
    </div>
  );
};

export default OpRefundApproval;
