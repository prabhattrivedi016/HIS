import CustomLoader from "@/components/customLoader";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { writeOffApprovalConfig } from "@/config/masterConfig/writeOffMasterConfig";
import { VIEWTYPE } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { transformDataWithConfig } from "@/utils/utilities";
import { useCallback, useContext, useEffect, useState } from "react";
import ApproveCancelPopup from "./components/ApproveCancelPopup";
import WriteOffFilterPopup, {
  WriteOffApprovalFilterValues,
} from "./components/WriteOffFilterPopup";
import { writeOffApprovalGridCard, WriteOffApprovalItem, writeOffApprovalListCard } from "./types";

const WriteOffApproval = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = Number(useContext(AuthContext)?.user?.branchId) || 1;
  const today = new Date().toISOString().split("T")[0];
  const branchLists = useGetBranchList()?.branchList?.data ?? [];

  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [hasFetched, setHasFetched] = useState(false);

  const { configDataValue: opRefundApprovalConfigFromApi } =
    useConfigMaster("writeOffApprovalConfig");
  const activeConfig = opRefundApprovalConfigFromApi || writeOffApprovalConfig;

  const [queryValue, setQueryValue] = useState({
    branchId: branchId,
    fromDate: "20-05-2026",
    toDate: "20-07-2026",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [writeOffGridData, setWriteOffGridData] = useState<writeOffApprovalGridCard[]>([]);
  const [writeOffListData, setWriteOffListData] = useState<writeOffApprovalListCard[]>([]);
  const [gridFilteredData, setGridFilteredData] = useState<writeOffApprovalGridCard[]>([]);
  const [listFilteredData, setListFilteredData] = useState<writeOffApprovalListCard[]>([]);

  const [rawItemMap, setRawItemMap] = useState({});

  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [renderPopup, setRenderPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [selectedItem, setSelectedItem] = useState<WriteOffApprovalItem | null>(null);

  const [gridActionOpen, setGridActionOpen] = useState(false);
  const [gridActionPopup, setGridActionPopup] = useState<DOMRect | null>(null);
  const [gridActionBookingId, setGridActionWriteOffId] = useState<number | null>(null);

  const getWriteOffApprovalList = useCallback(
    async (params: { branchId: number; fromDate: string; toDate: string }) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_WRITE_OFF_REQUEST_LIST_FOR_APPROVAL,
        {},
        { params },
        { component: "WriteOffApproval" }
      );

      const rawData = (resp?.data ?? []).map((item: WriteOffApprovalItem) => ({
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
          rawData.map((item: WriteOffApprovalItem) => [Number(item.BookingId), item])
        )
      );
      setWriteOffGridData(transformed?.gridView ?? []);
      setWriteOffListData(transformed?.listView ?? []);
      setGridFilteredData(transformed?.gridView ?? []);
      setListFilteredData(transformed?.listView ?? []);
      setHasFetched(true);
    },
    [activeConfig]
  );

  useEffect(() => {
    if (!activeConfig) return;

    void getWriteOffApprovalList({
      branchId: branchId || 1,
      fromDate: today,
      toDate: today,
    });
  }, [activeConfig, branchId, getWriteOffApprovalList, today]);

  const handleCardView = (view: string) => setCardView(view);

  const closeFilterModal = useCallback(() => {
    setFilterModalOpen(false);
  }, []);

  const onFilterWriteOffApproval = useCallback(() => {
    setFilterModalOpen(true);
  }, []);

  const applyFilterHandler = useCallback(
    async (params: WriteOffApprovalFilterValues) => {
      setQueryValue(params);
      setSearchQuery("");
      await getWriteOffApprovalList(params);
      setFilterModalOpen(false);
    },
    [getWriteOffApprovalList]
  );

  const closeHandler = useCallback(() => {
    setOpenPopup(false);
    setTimeout(() => {
      setRenderPopup(false);
      setSelectedItem(null);
      setPopupType("");
    }, 300);
  }, []);

  const popupSuccessHandler = useCallback(() => {
    void getWriteOffApprovalList(queryValue);
  }, [getWriteOffApprovalList, queryValue]);

  const gridActionHandler = (WriteOffId: number, rect: DOMRect) => {
    if (gridActionOpen && gridActionBookingId === WriteOffId) {
      setGridActionOpen(false);
      return;
    }

    setGridActionPopup(rect);
    setGridActionWriteOffId(WriteOffId);
    setGridActionOpen(true);
  };

  //   render  component
  const renderComponent = (view: string) => {
    if (!activeConfig || !hasFetched) {
      return <div className="initial-message">Loading write off approval...</div>;
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
              // onCustomButtonClick={customButtonClickHandler}
              // shouldShowButton={shouldShowGridButton}
              // getCustomButtonLabel={getGridButtonLabel}
              // isButtonDisabled={isGridButtonDisabled}
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
            // columnVisibility={columnVisibility}
            // renderRowActionMenu={renderRowActionMenu}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="master-page-size">
      <PageHeader
        title="Write Off Approval"
        view={cardView}
        onCardView={handleCardView}
        buttonTitle=""
        showAddButton={false}
        // onRefresh={handleRefresh}
        // onSearch={searchHandler}
        searchValue={searchQuery}
        onAddNew={() => {}}
        // onDownload={downloadHandler}
        // onFilter={filterDropDown}
        // onToggleColumnModal={hideShowHandler}
        // hideShowBtnRef={hideShowBtnRef as RefObject<HTMLElement>}
        // downloadBtnRef={downloadBtnRef as RefObject<HTMLElement>}
        onFilterDiscountApproval={onFilterWriteOffApproval}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {/* {hideShowColumn && popupPos && (
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


     

      {renderViewPopup && (
        <OpRefundViewDetails
          isOpen={openViewPopup}
          item={viewItem ? { RefundId: Number(viewItem.RefundId) } : null}
          onClose={closeViewHandler}
        />
      )}

      */}
      {renderPopup && (
        <ApproveCancelPopup
          isOpen={openPopup}
          popupType={popupType}
          item={selectedItem}
          onClose={closeHandler}
          onSuccess={popupSuccessHandler}
        />
      )}

      <WriteOffFilterPopup
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

export default WriteOffApproval;
