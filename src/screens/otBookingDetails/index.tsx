import HideShowColumn from "@/components/buttonsPopup";
import DownloadPopup from "@/components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "@/components/customLoader";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { otBookingDetailsConfig } from "@/config/masterConfig/otBookingDetails";
import { VIEWTYPE } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { exportListViewData } from "@/utils/exportUtils";
import { filteredData } from "@/utils/filteredData";
import { transformDataWithConfig } from "@/utils/utilities";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useNavigate } from "react-router-dom";
import CancelOtBookingDetailsPopup from "./components/CancelOtBookingDetailsPopup";
import OtBookingDetailsActionPopup from "./components/OtBookingDetailsActionPopup";
import OtBookingDetailsFilterPopup, {
  OtBookingDetailsFilterValues,
} from "./components/OtBookingDetailsFilterPopup";
import RescheduleOtBooking from "./components/RescheduleOtBooking";
import ViewDetailsPopup from "./components/ViewDetailsPopup";
import { OtBookingDetailsGridCard, OtBookingDetailsItem, OtBookingDetailsListCard } from "./types";
import {
  handleCancelButtonClick,
  handleConfirmButtonClick,
  handleRescheduleButtonClick,
  isCancelButtonDisabled,
  isConfirmButtonDisabled,
  isRescheduleButtonDisabled,
  shouldShowCancelButton,
  shouldShowConfirmButton,
  shouldShowRescheduleButton,
} from "./utils/otBookingDetailsActions";

const OtBookingDetails = () => {
  const { loading, fetchApi } = useGlobalApi();
  const today = new Date().toISOString().split("T")[0];
  const { branchId } = useContext(BranchContext) ?? 1;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // branch list
  const branchList = useGetBranchList()?.branchList?.data ?? [];

  const { configDataValue: otBookingDetailsConfigFromApi } = useConfigMaster("otBookingDetails");
  const activeConfig = otBookingDetailsConfig;

  // otBookingDetailsConfigFromApi

  const [opdAppointmentConfirmationGridData, setOpdAppointmentConfirmationGridData] = useState<
    OtBookingDetailsGridCard[]
  >([]);
  const [opdAppointmentConfirmationtListData, setOpdAppointmentConfirmationListData] = useState<
    OtBookingDetailsListCard[]
  >([]);
  const [gridFilteredData, setGridFilteredData] = useState<OtBookingDetailsGridCard[]>([]);
  const [listFilteredData, setListFilteredData] = useState<OtBookingDetailsListCard[]>([]);
  const [rawItemMap, setRawItemMap] = useState<Record<number, OtBookingDetailsItem>>({});

  const [hasFetched, setHasFetched] = useState(false);
  const [cardView, setCardView] = useState(VIEWTYPE.GRID);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [gridActionOpen, setGridActionOpen] = useState(false);
  const [gridActionBookingId, setGridActionBookingId] = useState<number | null>(null);
  const [gridActionPopup, setGridActionPopup] = useState<DOMRect | null>(null);

  const handleCardView = useCallback((view: string) => {
    setCardView(view);
  }, []);

  const gridActionHandler = useCallback(
    (bookingId: number, rect: DOMRect) => {
      if (gridActionOpen && gridActionBookingId === bookingId) {
        setGridActionOpen(false);
        return;
      }

      setGridActionPopup(rect);
      setGridActionBookingId(bookingId);
      setGridActionOpen(true);
    },
    [gridActionOpen, gridActionBookingId]
  );

  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [queryValue, setQueryValue] = useState({
    branchId: branchId,
    fromDate: today,
    toDate: today,
  });

  // booking details list
  const getOtBookingDetailsList = useCallback(
    async (params: { branchId: number; fromDate: string; toDate: string }) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_OT_BOOKING_DETAILS,
        {},
        { params },
        { component: "OtBookingDetails" }
      );

      const rawData =
        resp?.data?.filter(
          (item: OtBookingDetailsItem) =>
            Number(item?.PatientId) > 0 && String(item?.PatientName ?? "").trim() !== ""
        ) ?? [];

      const transformed = transformDataWithConfig(activeConfig, {
        ...resp,
        data: rawData,
      });

      const gridData =
        transformed?.gridView?.filter(
          (item: OtBookingDetailsGridCard) => String(item?.cardTitle ?? "").trim() !== ""
        ) ?? [];

      const listData = transformed?.listView ?? [];

      setRawItemMap(
        Object.fromEntries(
          rawData.map((item: OtBookingDetailsItem) => [Number(item?.OTBookingId), item])
        )
      );

      setOpdAppointmentConfirmationGridData(gridData);
      setOpdAppointmentConfirmationListData(listData);

      setGridFilteredData(gridData);
      setListFilteredData(listData);

      setHasFetched(true);
    },
    [activeConfig]
  );

  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState<boolean>(false);
  const [selectedItemForView, setSelectedItemForView] = useState<OtBookingDetailsItem | null>(null);

  const openViewPopup = useCallback((item: OtBookingDetailsItem) => {
    setSelectedItemForView(item);
    setViewDetailsModalOpen(true);
  }, []);

  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [selectedItemForCancel, setSelectedItemForCancel] = useState<OtBookingDetailsItem | null>(
    null
  );

  const openCancelPopup = useCallback((item: OtBookingDetailsItem) => {
    setSelectedItemForCancel(item);
    setCancelModalOpen(true);
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModalOpen(false);
    setSelectedItemForCancel(null);
  }, []);

  const handleCancelSuccess = useCallback(() => {
    void getOtBookingDetailsList(queryValue);
  }, [getOtBookingDetailsList, queryValue]);

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState<boolean>(false);
  const [selectedItemForReschedule, setSelectedItemForReschedule] =
    useState<OtBookingDetailsItem | null>(null);

  const openReschedulePopup = useCallback((item: OtBookingDetailsItem) => {
    setSelectedItemForReschedule(item);
    setRescheduleModalOpen(true);
  }, []);

  const closeRescheduleModal = useCallback(() => {
    setRescheduleModalOpen(false);
    setSelectedItemForReschedule(null);
  }, []);

  const handleRescheduleSuccess = useCallback(() => {
    void getOtBookingDetailsList(queryValue);
  }, [getOtBookingDetailsList, queryValue]);

  useEffect(() => {
    if (!activeConfig) return;
    void getOtBookingDetailsList(queryValue);
  }, [activeConfig, getOtBookingDetailsList, queryValue]);

  const hideShowBtnRef = useRef<HTMLElement>(null);
  const downloadBtnRef = useRef<HTMLElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [onDownload, setOnDownload] = useState(false);
  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);

  // handle Refresh
  const handleRefresh = useCallback(async () => {
    await getOtBookingDetailsList(queryValue);
    setSearchQuery("");
  }, [getOtBookingDetailsList, queryValue]);

  // search handler
  const searchHandler = useCallback(
    (keyInput: string, selectedValue = "") => {
      const value = keyInput?.toLowerCase()?.trim();
      setSearchQuery(keyInput);

      filteredData({
        value,
        selectedValue,
        listData: opdAppointmentConfirmationtListData as never,
        gridData: opdAppointmentConfirmationGridData as never,
        setListFilteredData: setListFilteredData as never,
        setGridFilteredData: setGridFilteredData as never,
      });
    },
    [opdAppointmentConfirmationGridData, opdAppointmentConfirmationtListData]
  );

  // column lists
  useEffect(() => {
    if (listFilteredData.length > 0) {
      const visibility: Record<string, boolean> = {};
      listFilteredData[0].columns.forEach(col => {
        visibility[col.label] = true;
      });
      setColumnVisibility(visibility);
    }
  }, [listFilteredData]);

  // column names
  const columnNames = useMemo(() => {
    if (cardView === VIEWTYPE.LIST && listFilteredData.length > 0) {
      return [
        listFilteredData[0]?.listLeftButton?.[0]?.label || "Action",
        ...(listFilteredData[0]?.columns?.map(col => col.label) || []),
      ];
    }
    return [];
  }, [cardView, listFilteredData]);

  // download handler
  const downloadHandler = () => {
    if (!downloadBtnRef.current) return;
    const rect = downloadBtnRef.current.getBoundingClientRect();
    setDownloadPopup({
      top: rect.bottom + window.scrollY - 12,
      left: rect.left + window.scrollX + 12,
    });
    setOnDownload(prev => !prev);
  };

  // hide show handler
  const hideShowHandler = useCallback(() => {
    if (hideShowBtnRef.current) {
      const rect = hideShowBtnRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 5, left: rect.left });
    }
    setHideShowColumn(prev => !prev);
  }, []);

  const filterDropDown = opdAppointmentConfirmationtListData?.[0]?.columns;

  // disbled actions
  const isGridButtonDisabled = useCallback(
    (action: string, id: number) => {
      const item = rawItemMap[id] ?? rawItemMap[Number(id)];
      if (!item) return true;

      if (action === "toggleConfirmOtBookingDetails") {
        return isConfirmButtonDisabled(item);
      }

      if (action === "toggleRescheduleOtBookingDetails") {
        return isRescheduleButtonDisabled(item);
      }

      if (action === "toggleCancelOtBookingDetails") {
        return isCancelButtonDisabled(item);
      }

      return false;
    },
    [rawItemMap]
  );

  // filter popup modal
  const onFilterOpdAppointmentApproval = useCallback(() => {
    setFilterModalOpen(true);
  }, []);

  const closeFilterModal = useCallback(() => {
    setFilterModalOpen(false);
  }, []);

  const applyFilterHandler = useCallback(
    async (params: OtBookingDetailsFilterValues) => {
      setQueryValue(params);
      await getOtBookingDetailsList(params);
      setFilterModalOpen(false);
    },
    [getOtBookingDetailsList]
  );

  // grid button click handler
  const customButtonClickHandler = useCallback(
    (action: string, id: number) => {
      const item = rawItemMap[id] ?? rawItemMap[Number(id)];

      if (!item) return;

      if (action === "toggleConfirmOtBookingDetails") {
        async function confirmOTBookingDetails() {
          const resp = await fetchApi(
            "PATCH",
            ENDPOINTS.CONFIRM_OT_BOOKING,
            { otBookingId: id },
            {},
            { component: "OtBookingDetails" }
          );
          if (!resp?.result) {
            showError(resp?.message ?? "Failed to confirm OT Booking.");
            return;
          }

          showSuccess(resp?.message ?? "OT Booking confirmed successfully.");
          await getOtBookingDetailsList(queryValue);
        }
        confirmOTBookingDetails();

        return;
      }

      if (action === "toggleRescheduleOtBookingDetails") {
        handleRescheduleButtonClick(item, openReschedulePopup);
        return;
      }

      if (action === "toggleCancelOtBookingDetails") {
        handleCancelButtonClick(item, openCancelPopup);
      }
    },
    [
      rawItemMap,
      openReschedulePopup,
      openCancelPopup,
      queryValue,
      getOtBookingDetailsList,
      fetchApi,
    ]
  );

  const gridConfirmHandler = useCallback(
    async (item: OtBookingDetailsItem) => {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.CONFIRM_OT_BOOKING,
        { otBookingId: Number(item.OTBookingId) },
        {},
        { component: "OtBookingDetails" }
      );
      if (!resp?.result) {
        showError(resp?.message ?? "Failed to confirm OT Booking.");
        return;
      }

      showSuccess(resp?.message ?? "OT Booking confirmed successfully.");
      await getOtBookingDetailsList(queryValue);
    },
    [fetchApi, getOtBookingDetailsList, queryValue]
  );

  // render action menu in list view
  const renderRowActionMenu = useCallback(
    (rowData: { id: number }, closeMenu: () => void) => {
      const item = rawItemMap[rowData?.id] ?? rawItemMap[Number(rowData?.id)];
      if (!item) return null;

      const runAction = (action: (selected: OtBookingDetailsItem) => void) => {
        action(item);
        closeMenu();
      };

      return (
        <ul className="text-sm">
          <li>
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50"
              onClick={() => runAction(openViewPopup)}
            >
              View
            </button>
          </li>
          {shouldShowConfirmButton(item) && (
            <li>
              <button
                type="button"
                aria-disabled={isConfirmButtonDisabled(item)}
                className={`w-full text-left px-3 py-2 text-gray-700 ${
                  isConfirmButtonDisabled(item)
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-50"
                }`}
                onClick={() =>
                  handleConfirmButtonClick(item, selected => {
                    closeMenu();
                    async function confirmOTBookingDetails() {
                      const resp = await fetchApi(
                        "PATCH",
                        ENDPOINTS.CONFIRM_OT_BOOKING,
                        { otBookingId: Number(selected.OTBookingId) },
                        {},
                        { component: "OtBookingDetails" }
                      );
                      if (!resp?.result) {
                        showError(resp?.message ?? "Failed to confirm OT Booking.");
                        return;
                      }

                      showSuccess(resp?.message ?? "OT Booking confirmed successfully.");
                      await getOtBookingDetailsList(queryValue);
                    }
                    void confirmOTBookingDetails();
                  })
                }
              >
                Confirm
              </button>
            </li>
          )}
          {shouldShowRescheduleButton(item) && (
            <li>
              <button
                type="button"
                aria-disabled={isRescheduleButtonDisabled(item)}
                className={`w-full text-left px-3 py-2 text-gray-700 ${
                  isRescheduleButtonDisabled(item)
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-50"
                }`}
                onClick={() =>
                  handleRescheduleButtonClick(item, () => runAction(openReschedulePopup))
                }
              >
                Reschedule
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
                    ? "opacity-60 cursor-not-allowed "
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
    [
      rawItemMap,
      openViewPopup,
      openCancelPopup,
      openReschedulePopup,
      queryValue,
      getOtBookingDetailsList,
      fetchApi,
    ]
  );

  const renderComponent = (view: string) => {
    if (!activeConfig || !hasFetched) {
      return <div className="initial-message">Loading OPD appointment confirmation...</div>;
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
              // shouldShowButton={shouldShowGridButton}
              // getCustomButtonLabel={getGridButtonLabel}
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
        title="OT Booking Details"
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
        onFilterDiscountApproval={onFilterOpdAppointmentApproval}
      />

      <div className="w-full">{renderComponent(cardView)}</div>

      {loading ? <CustomLoader isLoading={loading} /> : null}

      {/* filter modal */}
      <OtBookingDetailsFilterPopup
        isOpen={filterModalOpen}
        onClose={closeFilterModal}
        onApply={applyFilterHandler}
        initialValues={queryValue}
        branchList={branchList}
      />

      {/* cancel modal */}
      <CancelOtBookingDetailsPopup
        isOpen={cancelModalOpen}
        onClose={closeCancelModal}
        onSuccess={handleCancelSuccess}
        item={selectedItemForCancel}
      />

      {/* reschedule modal */}
      <RescheduleOtBooking
        isOpen={rescheduleModalOpen}
        onClose={closeRescheduleModal}
        onSuccess={handleRescheduleSuccess}
        item={selectedItemForReschedule}
      />

      {gridActionOpen && gridActionBookingId ? (
        <OtBookingDetailsActionPopup
          bookingId={gridActionBookingId}
          rawItemMap={rawItemMap}
          anchorRect={gridActionPopup}
          onClose={() => setGridActionOpen(false)}
          onConfirm={gridConfirmHandler}
          onCancel={openCancelPopup}
          onReschedule={openReschedulePopup}
          onView={openViewPopup}
        />
      ) : null}

      <ViewDetailsPopup
        isOpen={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        item={selectedItemForView}
      />

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
          onDownloadExcel={() => {
            exportListViewData(listFilteredData, "otBookingDetails", "excel");
            setOnDownload(false);
          }}
        />
      )}
    </div>
  );
};

export default OtBookingDetails;
