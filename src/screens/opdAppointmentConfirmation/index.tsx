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
import { transformDataWithConfig } from "@/utils/utilities";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OpdAppointmentCancelPopup from "./components/OpdAppointmentCancelPopup";
import {
  handleApproveButtonClick,
  handleCancelButtonClick,
  isApproveButtonDisabled,
  isCancelButtonDisabled,
  shouldShowApproveButton,
  shouldShowCancelButton,
} from "./components/opdAppointmentConfirmationAction";
import OpdAppointmentConfirmationPopup from "./components/OpdAppointmentConfirmationSearchPopup";
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

  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [queryValue, setQueryValue] = useState({
    branchId: branchId,
    fromDate: today,
    toDate: today,
    dateTypeId: 1,
    doctorId: 1,
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

  // filter popup modal
  const onFilterDiscountApproval = useCallback(() => {
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
      console.log("action", action);
      const item = rawItemMap[id];

      if (!item) return;

      if (action === "toggleAppointmentConfirmation") {
        navigate("/opd-billing", {
          state: {
            bookingId: Number(item.AppId),
            tokenNo: item.TokenNo,
            uhid: item.UHID,
            patientId: Number(item.PatientId),
          },
        });
        return;
      }

      if (action === "toggleAppointmentReschedule") {
        openReschedulePopup(item);
        return;
      }

      if (action === "toggleCancelAppointment") {
        handleCancelButtonClick(item, openCancelPopup);
      }
    },
    [rawItemMap]
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
            {/* <button
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-700"
              onClick={() => runAction(viewHandler)}
            >
              View
            </button> */}
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
          {item.IsCancel !== 1 && (
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50"
                onClick={() => runAction(openReschedulePopup)}
              >
                Reschedule
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
      return <div className="initial-message">Loading OP Discount Approval...</div>;
    }

    if (view === VIEWTYPE.GRID) {
      if (!gridFilteredData.length) return <div className="no-data-message">No records found</div>;

      return (
        <div className="grid-card-page-layout">
          {gridFilteredData.map(item => (
            <GridView
              key={item.id}
              data={item}
              // cardRightTopBtn={gridActionHandler}
              onCustomButtonClick={customButtonClickHandler}
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
        title="Opd Appointment Confirmation"
        // view={cardView}
        // onCardView={handleCardView}
        buttonTitle=""
        showAddButton={false}
        // onRefresh={handleRefresh}
        // onSearch={searchHandler}
        // onAddNew={() => {}}
        // onDownload={downloadHandler}
        // onFilter={filterDropDown}
        // onToggleColumnModal={hideShowHandler}
        // hideShowBtnRef={hideShowBtnRef as RefObject<HTMLElement>}
        // downloadBtnRef={downloadBtnRef as RefObject<HTMLElement>}
        onFilterDiscountApproval={onFilterDiscountApproval}
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
    </div>
  );
};

export default OpdAppointmentConfirmation;
