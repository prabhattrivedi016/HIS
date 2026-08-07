import HideShowColumn from "@/components/buttonsPopup";
import DownloadPopup from "@/components/buttonsPopup/components/DownloadPopup";
import CustomLoader from "@/components/customLoader";
import PageHeader from "@/components/pageHeader";
import GridView from "@/components/profileCard";
import ListView from "@/components/profileCard/components/ListView";
import { ENDPOINTS } from "@/config/defaults";
import { opdAppointmentConfirmation } from "@/config/masterConfig/opdAppointmentConfirmation";
import { VIEWTYPE } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { useConfigMaster } from "@/hooks/useConfigMaster";
import useGlobalApi from "@/hooks/useGlobalApi";
import AppointmentSlot from "@/screens/opdAppointment/components/AppointmentSlot";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { exportListViewData } from "@/utils/exportUtils";
import { filteredData } from "@/utils/filteredData";
import { transformDataWithConfig } from "@/utils/utilities";
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
import OpdAppointmentCancelPopup from "./components/OpdAppointmentCancelPopup";
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
} from "./components/opdAppointmentConfirmationAction";
import OpdAppointmentConfirmationActionPopup from "./components/OpdAppointmentConfirmationActionPopup";
import OpdAppointmentConfirmationPopup from "./components/OpdAppointmentConfirmationSearchPopup";
import ViewDetailsPopup from "./components/ViewDetailsPopup";
import {
  OpdAppointmentConfirmationGridCard,
  OpdAppointmentConfirmationItem,
  OpdAppointmentConfirmationListCard,
} from "./types";

const OpdAppointmentConfirmation = () => {
  const { loading, fetchApi } = useGlobalApi();
  const today = new Date().toISOString().split("T")[0];
  const { branchId } = useContext(BranchContext) ?? 1;
  const navigate = useNavigate();

  const { configDataValue: opdAppointmentConfirmationConfigFromApi } = useConfigMaster(
    "opdAppointmentConfirmation"
  );
  const activeConfig = opdAppointmentConfirmation;

  // opdAppointmentConfirmationConfigFromApi

  const [opdAppointmentConfirmationGridData, setOpdAppointmentConfirmationGridData] = useState<
    OpdAppointmentConfirmationGridCard[]
  >([]);
  const [opdAppointmentConfirmationtListData, setOpdAppointmentConfirmationListData] = useState<
    OpdAppointmentConfirmationListCard[]
  >([]);
  const [gridFilteredData, setGridFilteredData] = useState<OpdAppointmentConfirmationGridCard[]>(
    []
  );
  const [listFilteredData, setListFilteredData] = useState<OpdAppointmentConfirmationListCard[]>(
    []
  );
  const [rawItemMap, setRawItemMap] = useState<Record<number, OpdAppointmentConfirmationItem>>({});

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

  const gridConfirmHandler = useCallback(
    (item: OpdAppointmentConfirmationItem) => {
      navigate("/opd-billing", {
        state: {
          uhid: item?.UHID,
          bookingId: item?.AppId,
          tokenNo: item?.TokenNo,
          patientId: Number(item?.PatientId),
          isPreBooking: true,
          item,
        },
      });
    },
    [navigate]
  );

  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [queryValue, setQueryValue] = useState({
    branchId: branchId,
    fromDate: today,
    toDate: today,
    dateTypeId: 1,
    doctorId: 0,
    tokenNo: "",
    sourceType: "",
  });

  const getOpdAppointmentConfirmationList = useCallback(
    async (params: { branchId: number; fromDate: string; toDate: string }) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_DOCTOR_APPOINTMENT_PRE_BOOKING_DETAILS,
        {},
        { params },
        { component: "OpdAppointmentConfirmation" }
      );

      const rawData = resp?.data ?? [];
      const transformed = transformDataWithConfig(activeConfig, resp);

      setRawItemMap(
        Object.fromEntries(
          rawData.map((item: OpdAppointmentConfirmationItem) => [Number(item.AppId), item])
        )
      );
      setOpdAppointmentConfirmationGridData(transformed?.gridView ?? []);
      setOpdAppointmentConfirmationListData(transformed?.listView ?? []);
      setGridFilteredData(transformed?.gridView ?? []);
      setListFilteredData(transformed?.listView ?? []);
      setHasFetched(true);
    },
    [activeConfig]
  );

  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState<boolean>(false);
  const [selectedItemForView, setSelectedItemForView] =
    useState<OpdAppointmentConfirmationItem | null>(null);

  const openViewPopup = useCallback((item: OpdAppointmentConfirmationItem) => {
    setSelectedItemForView(item);
    setViewDetailsModalOpen(true);
  }, []);

  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [selectedItemForCancel, setSelectedItemForCancel] =
    useState<OpdAppointmentConfirmationItem | null>(null);

  const openCancelPopup = useCallback((item: OpdAppointmentConfirmationItem) => {
    setSelectedItemForCancel(item);
    setCancelModalOpen(true);
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModalOpen(false);
    setSelectedItemForCancel(null);
  }, []);

  const handleCancelSuccess = useCallback(() => {
    void getOpdAppointmentConfirmationList(queryValue);
  }, [getOpdAppointmentConfirmationList, queryValue]);

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState<boolean>(false);
  const [selectedItemForReschedule, setSelectedItemForReschedule] =
    useState<OpdAppointmentConfirmationItem | null>(null);

  const openReschedulePopup = useCallback((item: OpdAppointmentConfirmationItem) => {
    setSelectedItemForReschedule(item);
    setRescheduleModalOpen(true);
  }, []);

  const closeRescheduleModal = useCallback(() => {
    setRescheduleModalOpen(false);
    setSelectedItemForReschedule(null);
  }, []);

  // reschedule slot timing
  const handleSelectSlot = useCallback(
    async (slotId: string, appDateTime: string) => {
      if (!selectedItemForReschedule) return;

      try {
        const resp = await fetchApi(
          "PATCH",
          ENDPOINTS.RESCHEDULE_DOCTOR_APPOINTMENT_PRE_BOOKING,
          {},
          {
            params: {
              id: Number(selectedItemForReschedule?.AppId),
              slotId: String(slotId),
              appDateTime: String(appDateTime),
            },
          },
          { component: "OpdAppointmentConfirmation" }
        );

        if (!resp?.result) {
          showWarning(resp?.message ?? "Failed to reschedule appointment.");
          return;
        }

        showSuccess(resp?.message ?? "Appointment rescheduled successfully.");
        void getOpdAppointmentConfirmationList(queryValue);
      } catch (err) {
        console.error(err);
        showError("Failed to reschedule appointment.");
      }
    },
    [selectedItemForReschedule, queryValue, getOpdAppointmentConfirmationList]
  );

  useEffect(() => {
    if (!activeConfig) return;
    void getOpdAppointmentConfirmationList(queryValue);
  }, [activeConfig, getOpdAppointmentConfirmationList, queryValue]);

  const hideShowBtnRef = useRef<HTMLElement>(null);
  const downloadBtnRef = useRef<HTMLElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [hideShowColumn, setHideShowColumn] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [onDownload, setOnDownload] = useState(false);
  const [downloadPopup, setDownloadPopup] = useState<{ top: number; left: number } | null>(null);

  const handleRefresh = useCallback(async () => {
    await getOpdAppointmentConfirmationList(queryValue);
    setSearchQuery("");
  }, [getOpdAppointmentConfirmationList, queryValue]);

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

  const filterDropDown = opdAppointmentConfirmationtListData?.[0]?.columns;

  const isGridButtonDisabled = useCallback(
    (action: string, id: number) => {
      const item = rawItemMap[id];
      if (!item) return true;

      if (action === "toggleAppointmentConfirmation") {
        return isConfirmButtonDisabled(item);
      }

      if (action === "toggleAppointmentReschedule") {
        return isRescheduleButtonDisabled(item);
      }

      if (action === "toggleCancelAppointment") {
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
    async params => {
      setQueryValue(params);
      await getOpdAppointmentConfirmationList(params);
      setFilterModalOpen(false);
    },
    [getOpdAppointmentConfirmationList]
  );

  // grid button click handler
  const customButtonClickHandler = useCallback(
    (action: string, id: number) => {
      const item = rawItemMap[id];

      if (!item) return;

      if (action === "toggleAppointmentConfirmation") {
        handleConfirmButtonClick(item, selected => {
          navigate("/opd-billing", {
            state: {
              uhid: item?.UHID,
              bookingId: item?.AppId,
              tokenNo: item?.TokenNo,
              patientId: Number(item?.PatientId),
              isPreBooking: true,
              item,
            },
          });
        });
        return;
      }

      if (action === "toggleAppointmentReschedule") {
        handleRescheduleButtonClick(item, openReschedulePopup);
        return;
      }

      if (action === "toggleCancelAppointment") {
        handleCancelButtonClick(item, openCancelPopup);
      }
    },
    [rawItemMap, openReschedulePopup, openCancelPopup]
  );

  // render action menu
  const renderRowActionMenu = useCallback(
    (rowData: { id: number }, closeMenu: () => void) => {
      const item = rawItemMap[rowData.id];
      if (!item) return null;

      const runAction = (action: (selected: OpdAppointmentConfirmationItem) => void) => {
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
                    runAction(() => {
                      navigate("/opd-billing", {
                        state: {
                          bookingId: Number(selected.AppId),
                          tokenNo: selected.TokenNo,
                          uhid: selected.UHID,
                          patientId: Number(selected.PatientId),
                          isPreBooking: true,
                          item: selected,
                        },
                      });
                    });
                  })
                }
              >
                Confirm
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
        </ul>
      );
    },
    [rawItemMap, openCancelPopup, openReschedulePopup]
  );

  const renderComponent = (view: string) => {
    if (!activeConfig || !hasFetched) {
      return <div className="initial-message">Loading opd appointment confirmation...</div>;
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
        title="Opd Appointment Confirmation"
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
      <OpdAppointmentConfirmationPopup
        isOpen={filterModalOpen}
        onClose={closeFilterModal}
        onApply={applyFilterHandler}
        initialValues={queryValue}
      />

      {/* cancel modal */}
      <OpdAppointmentCancelPopup
        isOpen={cancelModalOpen}
        onClose={closeCancelModal}
        onSuccess={handleCancelSuccess}
        item={selectedItemForCancel}
      />

      {/* reschedule modal */}
      <AppointmentSlot
        isOpen={rescheduleModalOpen}
        onClose={closeRescheduleModal}
        doctorId={Number(selectedItemForReschedule?.DoctorId ?? 0)}
        selectedSlotTimingId=""
        onSelectSlot={handleSelectSlot}
      />

      {gridActionOpen && gridActionBookingId ? (
        <OpdAppointmentConfirmationActionPopup
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
            exportListViewData(listFilteredData, "OpdAppointmentConfirmationList", "excel");
            setOnDownload(false);
          }}
        />
      )}
    </div>
  );
};

export default OpdAppointmentConfirmation;
