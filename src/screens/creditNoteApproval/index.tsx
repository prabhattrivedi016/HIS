import CustomLoader from "@/components/customLoader";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { creditNoteApprovalConfig } from "@/config/masterConfig/creditNoteMasterConfig";
import { VIEWTYPE } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { transformDataWithConfig } from "@/utils/utilities";
import { useCallback, useContext, useEffect, useState } from "react";
import CreditNoteApprovalActionPopup from "./components/CreditNoteApprovalActionPopup";
import CreditNoteApprovalCancelPopup from "./components/CreditNoteApprovalCancelPopup";
import CreditNoteFilterPopup, {
  CreditNoteApprovalFilterValues,
} from "./components/CreditNoteFilterPopup";
import CreditNoteViewDetailsPopup from "./components/CreditNoteViewDetailsPopup";
import {
  creditNoteApprovalGridCard,
  CreditNoteApprovalItem,
  creditNoteApprovalListCard,
} from "./types";
import {
  handleApproveButtonClick,
  handleCancelButtonClick,
  isApproveButtonDisabled,
  isCancelButtonDisabled,
} from "./utils/creditNoteActions";

const CreditNoteApproval = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = Number(useContext(AuthContext)?.user?.branchId) || 1;
  const branchLists = useGetBranchList()?.branchList?.data ?? [];

  const today = new Date().toISOString().split("T")[0];

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [hasFetched, setHasFetched] = useState(false);

  const { configDataValue: opRefundApprovalConfigFromApi } = useConfigMaster("creditNoteConfig");
  const activeConfig = opRefundApprovalConfigFromApi || creditNoteApprovalConfig;

  const [queryValue, setQueryValue] = useState({
    branchId: branchId,
    fromDate: today,
    toDate: today,
  });

  const [creditNoteGridData, setCreditNoteGridData] = useState<creditNoteApprovalGridCard[]>([]);
  const [creditNoteListData, setCreditNoteListData] = useState<creditNoteApprovalListCard[]>([]);
  const [gridFilteredData, setGridFilteredData] = useState<creditNoteApprovalGridCard[]>([]);
  const [listFilteredData, setListFilteredData] = useState<creditNoteApprovalListCard[]>([]);

  const [rawItemMap, setRawItemMap] = useState<Record<number, CreditNoteApprovalItem>>({});

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [renderPopup, setRenderPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [selectedItem, setSelectedItem] = useState<CreditNoteApprovalItem | null>(null);

  const [viewItem, setViewItem] = useState<CreditNoteApprovalItem | null>(null);
  const [renderViewPopup, setRenderViewPopup] = useState(false);
  const [openViewPopup, setOpenViewPopup] = useState(false);

  const [gridActionOpen, setGridActionOpen] = useState(false);
  const [gridActionPopup, setGridActionPopup] = useState<DOMRect | null>(null);
  const [gridActionCreditNoteId, setGridActionCreditNoteId] = useState<number | null>(null);

  const getCreditNoteApprovalList = useCallback(
    async (params: { branchId: number; fromDate: string; toDate: string }) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CREDIT_NOTE_REQUEST_LIST_FOR_APPROVAL,
        {},
        { params },
        { component: "CreditNoteApproval" }
      );

      const rawData = (resp?.data ?? []).map((item: CreditNoteApprovalItem) => ({
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
          rawData.map((item: CreditNoteApprovalItem) => [Number(item.CreditNoteId), item])
        )
      );
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

  const closeFilterModal = useCallback(() => {
    setFilterModalOpen(false);
  }, []);

  const onFilterCreditNoteApproval = useCallback(() => {
    setFilterModalOpen(true);
  }, []);

  const applyFilterHandler = useCallback(
    async (params: CreditNoteApprovalFilterValues) => {
      setQueryValue(params);
      setSearchQuery("");
      await getCreditNoteApprovalList(params);
      setFilterModalOpen(false);
    },
    [getCreditNoteApprovalList]
  );

  const openApprovePopup = useCallback((item: CreditNoteApprovalItem) => {
    setSelectedItem(item);
    setPopupType("approve");
    setRenderPopup(true);
    setOpenPopup(true);
  }, []);

  const openCancelPopup = useCallback((item: CreditNoteApprovalItem) => {
    setSelectedItem(item);
    setPopupType("cancel");
    setRenderPopup(true);
    setOpenPopup(true);
  }, []);

  const viewHandler = useCallback((item: CreditNoteApprovalItem) => {
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
      if (action === "toggleApproveCreditNote" || action === "toggleApproveDiscount") {
        return isApproveButtonDisabled(item);
      }
      if (action === "toggleCancelCreditNote" || action === "toggleCancelDiscount") {
        return isCancelButtonDisabled(item);
      }
      return false;
    },
    [rawItemMap]
  );

  const getGridButtonLabel = useCallback((label: string, action: string) => {
    if (action === "toggleApproveCreditNote" || action === "toggleApproveDiscount") {
      return "Approve";
    }
    if (action === "toggleCancelCreditNote" || action === "toggleCancelDiscount") {
      return "Cancel";
    }
    return label;
  }, []);

  const customButtonClickHandler = useCallback(
    (action: string, id: number) => {
      const item = rawItemMap[id];
      if (!item) return;

      if (action === "toggleApproveCreditNote" || action === "toggleApproveDiscount") {
        handleApproveButtonClick(item, openApprovePopup);
        return;
      }

      if (action === "toggleCancelCreditNote" || action === "toggleCancelDiscount") {
        handleCancelButtonClick(item, openCancelPopup);
      }
    },
    [rawItemMap, openApprovePopup, openCancelPopup]
  );

  // render component

  const renderComponent = (view: string) => {
    if (!activeConfig || !hasFetched) {
      return <div className="initial-message">Loading credit note approval...</div>;
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
          <ListView data={listFilteredData} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="master-page-size">
      <PageHeader
        title="Credit Note Approval"
        view={cardView}
        onCardView={handleCardView}
        buttonTitle=""
        showAddButton={false}
        searchValue={searchQuery}
        onAddNew={() => {}}
        onFilterDiscountApproval={onFilterCreditNoteApproval}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {gridActionOpen && gridActionCreditNoteId ? (
        <CreditNoteApprovalActionPopup
          creditNoteId={gridActionCreditNoteId}
          rawItemMap={rawItemMap}
          anchorRect={gridActionPopup}
          onClose={() => setGridActionOpen(false)}
          onView={viewHandler}
          onApprove={openApprovePopup}
          onCancel={openCancelPopup}
        />
      ) : null}

      {renderViewPopup && (
        <CreditNoteViewDetailsPopup
          isOpen={openViewPopup}
          creditNoteId={viewItem?.CreditNoteId ?? 0}
          onClose={closeViewHandler}
        />
      )}

      {renderPopup && (
        <CreditNoteApprovalCancelPopup
          isOpen={openPopup}
          popupType={popupType}
          item={selectedItem}
          onClose={closeHandler}
          onSuccess={popupSuccessHandler}
        />
      )}

      <CreditNoteFilterPopup
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

export default CreditNoteApproval;
