import CustomLoader from "@/components/customLoader";
import GlobalFooterButtons from "@/components/globalButtons/GlobalFooterButtons";
import UhidGlobalSearch from "@/components/SingledrawerAndPopup/components/UhidGlobalSearch";
import { ENDPOINTS } from "@/config/defaults";
import { OTBookingTabName, PageType } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { buildIpdPatientSummary } from "../ipdAdmission/helpers";
import PatientData from "../patientRegistration/components/PatientData";
import SearchPatientPopup from "../patientRegistration/components/SearchPatientPopup";
import { PatientDataEditItem, SearchedPatientItem } from "../patientRegistration/types";
import OtBookingDetails from "./components/OtBookingDetails";
import { PaylaodValueItem, ServiceTableItem } from "./types";

export const convertTo24HourFormat = (timeStr: string) => {
  if (!timeStr) return "";
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr; // return original if not in expected format

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const modifier = match[3]?.toUpperCase();

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes}:00`;
};

const OtBooking = () => {
  const { loading, fetchApi } = useGlobalApi();

  const location = useLocation();

  const { state } = location ?? {};

  // prefill data when navigating from ot schedular to ot booking page
  useEffect(() => {
    if (!state) return;

    const convertTo12HourFormat = (timeStr: string) => {
      if (!timeStr) return "";
      const [hours, minutes] = timeStr.split(":");
      if (!hours || !minutes) return timeStr;
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    };

    setPayloadValue(prev => ({
      ...prev,
      otBookingDate: state.bookingDate || prev.otBookingDate,
      otBookingFromTime: convertTo12HourFormat(state.startTime) || prev.otBookingFromTime,
      otBookingToTime: convertTo12HourFormat(state.endTime) || prev.otBookingToTime,
      otType: state.otType || prev.otType,
      otTypeId: state.otType === "emergency" ? 2 : 1,
      otId: state.resourceId || prev.otId,
    }));
  }, [state]);

  const [activeTab, setActiveTab] = React.useState<string>(OTBookingTabName.PATIENT_DETAILS);
  const [patientTabError, setPatientTabError] = useState<boolean>(false);

  const [isMainSurgery, setIsmainSurgery] = useState<number>(0);

  const [serviceTableItemList, setServiceTableItemList] = useState<ServiceTableItem[]>([]);

  const [finalFromTime, setFinalFromTime] = useState("");
  const [finalToTime, setFinalToTime] = useState("");

  const [ipdNo, setIpdNo] = useState<string>("");
  const [ipdVisitId, setIpdVisitId] = useState<number>(0);

  const { branchId } = useContext(BranchContext);
  const roleId = useContext(RoleContext)?.roleId;

  const [payloadValue, setPayloadValue] = useState<PaylaodValueItem>({
    branchId: branchId!,
    roleId: roleId!,
    patientId: 0,
    visitId: 0,
    otTypeId: 1,
    otType: "elective",
    otId: 0,
    otBookingDate: "",
    otBookingFromTime: "",
    otBookingToTime: "",
    assistantSurgeonId1: 0,
    assistantSurgeonId2: 0,
    anesthetistId: 0,
    assistantAnesthetistId: 0,
    anesthesia: "",
    scrubNurseUserId: 0,
    circulatingNurseUserId: 0,
    otTechnicianUserId: 0,
    atTechnicianUserId: 0,
    perfusionistUserId: 0,
    isBloodRequired: 0,
    numberOfBloodUnits: 0,
    isVentilatorRequired: 0,
    isICURequired: 0,
    isUnderPackage: 0,
    bloodGroupId: 0,
    isInfectiousCase: 0,
    infectiousCaseRemarks: "",
    diagnosisSNOMEDCode: "",
    diagnosisName: "",
    isEquipmentRequest: 0,
    surgeonIds: [],
    equipmentServiceItemIds: [],
  });

  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [formResetKey, setFormResetKey] = useState<number>(0);
  const [showRegistrationButton, setShowRegistrationButton] = useState<boolean>(true);
  const [patientRegistrationDetails, setPatientRegistrationDetails] =
    useState<PatientDataEditItem | null>(null);
  const patientDataRef = React.useRef<any>(null);

  const patientSummary = React.useMemo(
    () => (patientRegistrationDetails ? buildIpdPatientSummary(patientRegistrationDetails) : null),
    [patientRegistrationDetails, ipdNo, ipdVisitId]
  );

  useEffect(() => {
    const extractedIpdNo = String(
      (patientRegistrationDetails as any)?.ipdNumber || patientRegistrationDetails?.ipdNo || ""
    );
    setIpdNo(extractedIpdNo);
    setIpdVisitId(Number(patientRegistrationDetails?.ipdVisitId || 0));
  }, [patientRegistrationDetails]);

  const [openSearchPatientPopup, setOpenSearchPatientPopup] = useState<boolean>(false);
  const [renderSearchPatientPopup, setRenderSearchPatientPopup] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [searchPatientError, setSearchPatientError] = useState<string>("");

  const searchOldPatientHandler = () => {
    setSearchPatientError("");
    setOpenSearchPatientPopup(true);
    setRenderSearchPatientPopup(true);
  };

  const closeSearchPatientHandler = () => {
    setSearchPatientError("");
    setOpenSearchPatientPopup(false);
    setTimeout(() => {
      setRenderSearchPatientPopup(false);
    }, 300);
  };

  const resetBoundPatientContext = useCallback(() => {
    setIpdNo("");
    setPayloadValue({
      branchId: branchId!,
      roleId: roleId!,
      patientId: 0,
      visitId: 0,
      otTypeId: 1,
      otType: "elective",
      otId: 0,
      otBookingDate: "",
      otBookingFromTime: "",
      otBookingToTime: "",
      assistantSurgeonId1: 0,
      assistantSurgeonId2: 0,
      anesthetistId: 0,
      assistantAnesthetistId: 0,
      anesthesia: "",
      scrubNurseUserId: 0,
      circulatingNurseUserId: 0,
      otTechnicianUserId: 0,
      atTechnicianUserId: 0,
      perfusionistUserId: 0,
      isBloodRequired: 0,
      numberOfBloodUnits: 0,
      isVentilatorRequired: 0,
      isICURequired: 0,
      isUnderPackage: 0,
      bloodGroupId: 0,
      isInfectiousCase: 0,
      infectiousCaseRemarks: "",
      diagnosisSNOMEDCode: "",
      diagnosisName: "",
      isEquipmentRequest: 0,

      surgeonIds: [],
      equipmentServiceItemIds: [],
    });
    setFormResetKey(prev => prev + 1);
  }, [branchId, roleId]);

  const bindPatientToRegistration = useCallback(
    async (patientId: number) => {
      if (activePatientId && activePatientId !== patientId) {
        resetBoundPatientContext();
      }
      setActivePatientId(patientId);
      setPatientTabError(false);
      await patientDataRef.current?.loadPatientById(patientId);
    },
    [activePatientId, resetBoundPatientContext]
  );

  // select patient from popup
  const handleSelectPatient = useCallback(
    async (item: SearchedPatientItem) => {
      if (!item) return false;
      const patientId = Number(item?.PatientId ?? 0);

      if (!patientId) {
        setSearchPatientError("Invalid patient selected.");
        return false;
      }

      setIpdNo(item?.IPDNo ?? "");

      setSearchPatientError("");
      await bindPatientToRegistration(patientId);
      setActiveTab(OTBookingTabName?.OT_BOOKING);
      return true;
    },
    [bindPatientToRegistration]
  );

  // handler uhid select

  const handleUhidPatientSelect = useCallback(
    async (patientId: number) => {
      if (!patientId) {
        showWarning("Invalid patient selected.");
        return false;
      }

      await bindPatientToRegistration(patientId);
      setActiveTab(OTBookingTabName?.OT_BOOKING);
      return true;
    },
    [bindPatientToRegistration]
  );

  const handlePatientLoadedFromUhid = useCallback(() => {
    setActiveTab(OTBookingTabName.OT_BOOKING);
  }, []);

  const handleFooterButtonClick = (action: string) => {
    console.log("actionactionactionaction button", action);
    if (action === "save") {
      void handleSave();
    }
  };

  // maximum and minimum booking time
  useEffect(() => {
    const minBookingFromTime =
      serviceTableItemList
        .map(item => item.otBookingFromTime)
        .filter(Boolean)
        .sort()[0] || "";

    const maxBookingToTime =
      serviceTableItemList
        .map(item => item.otBookingToTime)
        .filter(Boolean)
        .sort()
        .at(-1) || "";

    setFinalFromTime(minBookingFromTime);
    setFinalToTime(maxBookingToTime);
  }, [serviceTableItemList]);

  // handle save

  const handleSave = async () => {
    let hasError = false;

    // Validate Patient Data Tab
    if (patientDataRef.current) {
      const isValid = await patientDataRef.current.validateForm();
      if (!isValid) {
        setPatientTabError(true);
        hasError = true;
      } else {
        setPatientTabError(false);
      }
    }

    if (hasError) {
      showWarning("Please fix the validation errors in the patient details tab.");
      setActiveTab(OTBookingTabName.PATIENT_DETAILS);
      return;
    }

    if (payloadValue?.surgeonIds?.length === 0) {
      showWarning("Please select at least one surgeon.");
      return;
    }

    if (serviceTableItemList?.length === 0) {
      showWarning("Please select at least one service.");
      return;
    }

    if (!payloadValue?.otBookingDate) {
      showWarning("Please select OT booking date.");
      return;
    }

    if (!payloadValue?.otBookingFromTime) {
      showWarning("Please select OT booking from time.");
      return;
    }

    if (!payloadValue?.otBookingToTime) {
      showWarning("Please select OT booking to time.");
      return;
    }

    if (!payloadValue?.otId) {
      showWarning("Please select Theater.");
      return;
    }

    try {
      const formData = new FormData();

      for (const key in patientRegistrationDetails) {
        const value = patientRegistrationDetails[key];

        if (value === null || value === undefined || value === "") {
          continue;
        }

        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }

      const resp = await fetchApi(
        "POST",

        ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,

        formData,

        { headers: { "Content-Type": "multipart/form-data" } },

        { component: "OtBooking" }
      );
      if (!resp?.result) {
        showError(resp?.message ?? "Error while saving patient data");
        return;
      }
      const patientId = Number(resp.data.patientId);

      // complete patient details
      const patientResponse = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_MASTER,
        {},
        { params: { patientId } },
        { component: "OtBooking" }
      );

      // update patient data in state

      if (!patientResponse?.result) {
        showError(patientResponse.message ?? "Failed to fetch patient details");
        return;
      }
      const patientData = patientResponse?.data?.[0];

      setPayloadValue(prev => ({ ...prev, patientId: patientData?.patientId }));

      const finalPayload = {
        ...payloadValue,
        otBookingFromTime: convertTo24HourFormat(finalFromTime),
        otBookingToTime: convertTo24HourFormat(finalToTime),
        patientId: patientId,
        visitId: ipdVisitId,
        bookingItems: serviceTableItemList?.map(s => ({
          serviceItemId: s.serviceItemId,
          otBookingFromTime: convertTo24HourFormat(s.otBookingFromTime),
          otBookingToTime: convertTo24HourFormat(s.otBookingToTime),
          isMainSurgery: s.isMainSurgery,
        })),
      };

      const finalResp = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_OT_BOOKING,
        finalPayload,
        {},
        { component: "OtBooking" }
      );

      if (!finalResp?.result) {
        showError(finalResp?.message ?? "Error while saving OT Booking");
        return;
      }
      showSuccess(finalResp?.message ?? "Data saved sucessfully");

      setServiceTableItemList([]);
      resetBoundPatientContext();
      setPatientRegistrationDetails({});
      setActivePatientId(null);
      setPayloadValue({
        branchId: branchId!,
        roleId: roleId!,
        patientId: 0,
        visitId: 0,
        otTypeId: 1,
        otType: "elective",
        otId: 0,
        otBookingDate: "",
        otBookingFromTime: "",
        otBookingToTime: "",
        assistantSurgeonId1: 0,
        assistantSurgeonId2: 0,
        anesthetistId: 0,
        assistantAnesthetistId: 0,
        anesthesia: "",
        scrubNurseUserId: 0,
        circulatingNurseUserId: 0,
        otTechnicianUserId: 0,
        atTechnicianUserId: 0,
        perfusionistUserId: 0,
        isBloodRequired: 0,
        numberOfBloodUnits: 0,
        isVentilatorRequired: 0,
        isICURequired: 0,
        isUnderPackage: 0,
        bloodGroupId: 0,
        isInfectiousCase: 0,
        infectiousCaseRemarks: "",
        diagnosisSNOMEDCode: "",
        diagnosisName: "",
        isEquipmentRequest: 0,
        surgeonIds: [],
        equipmentServiceItemIds: [],
      });
      setActiveTab(OTBookingTabName.PATIENT_DETAILS);
      setIsmainSurgery(0);
    } catch (error) {
      console.log("error", error);
    }
  };

  //   render tabs
  const renderTabs = () => (
    <>
      <div className={activeTab === OTBookingTabName.PATIENT_DETAILS ? "" : "hidden"}>
        <PatientData
          key={`patient-data-${formResetKey}`}
          ref={patientDataRef}
          selectedPatientId={activePatientId}
          showRegistrationButton={showRegistrationButton}
          onPayloadChange={setPatientRegistrationDetails}
          onPatientLoaded={handlePatientLoadedFromUhid}
        />
      </div>

      <div className={activeTab === OTBookingTabName.OT_BOOKING ? "" : "hidden"}>
        <OtBookingDetails
          setPayloadValue={setPayloadValue}
          payloadValue={payloadValue}
          ipdNo={ipdNo}
          ipdVisitId={ipdVisitId}
          serviceTableItemList={serviceTableItemList}
          setServiceTableItemList={setServiceTableItemList}
          isMainSurgery={isMainSurgery}
          setIsmainSurgery={setIsmainSurgery}
        />
      </div>
    </>
  );

  return (
    <div className="page-container ">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col md:flex-row lg:flex-row items-center gap-3 w-full">
          {/* Left Section */}
          <div className="flex-1">
            <h1 className="page-heading">OT Booking</h1>

            <nav className="helper-text">
              <NavLink to="/dashboard" className="hover:underline">
                Home
              </NavLink>
              <span>››</span>
              <span>OT Booking</span>
            </nav>
          </div>

          {/* Center Section */}
          <div className="flex justify-center flex-1">
            <UhidGlobalSearch
              onPatientSelect={handleUhidPatientSelect}
              resetKey={formResetKey}
              className="mt-1"
            />
          </div>

          {/* Right Section */}
          <div className="flex justify-end flex-1">
            <button type="button" className="save-btn" onClick={searchOldPatientHandler}>
              Search Old Patient
            </button>
          </div>
        </div>
      </div>

      {patientSummary && (
        <div className="flex flex-col md:flex-row lg:flex-row gap-6 card w-full mb-1">
          <div className="flex flex-row">
            <h1 className="name-header ml-2">UHID :</h1>
            <span className="">{patientSummary.uhid}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header ml-2">Patient Name :</h1>
            <span className="">{patientSummary.patientName}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header ml-2">Age / Sex :</h1>
            <span className="">{patientSummary.ageSex}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header ml-2">Contact No :</h1>
            <span className="">{patientSummary.contactNumber}</span>
          </div>

          {ipdNo && (
            <div className="flex flex-row">
              <h1 className="name-header ml-2">IPD No :</h1>
              <span className="">{ipdNo}</span>
            </div>
          )}

          {ipdVisitId ? (
            <div className="flex flex-row">
              <h1 className="name-header ml-2">IPD VisitId:</h1>
              <span className="">{ipdVisitId}</span>
            </div>
          ) : null}
        </div>
      )}

      <div className="tab-card rounded-lg mb-1">
        <button
          type="button"
          onClick={() => setActiveTab(OTBookingTabName.PATIENT_DETAILS)}
          className={`tab-btn transition rounded ${
            patientTabError
              ? "border-2 input-field-error"
              : activeTab === OTBookingTabName.PATIENT_DETAILS
                ? "tab-btn-active"
                : "tab-btn-inactive"
          }`}
        >
          {OTBookingTabName.PATIENT_DETAILS}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(OTBookingTabName.OT_BOOKING)}
          className={`tab-btn transition ${
            activeTab === OTBookingTabName.OT_BOOKING ? "tab-btn-active" : "tab-btn-inactive"
          }`}
        >
          {OTBookingTabName.OT_BOOKING}
        </button>
      </div>

      {renderTabs()}

      {/* buttons */}
      <GlobalFooterButtons
        pageType={PageType?.OT_BOOKING}
        onButtonClick={handleFooterButtonClick}
      />

      {renderSearchPatientPopup && (
        <SearchPatientPopup
          isOpen={openSearchPatientPopup}
          onClose={closeSearchPatientHandler}
          showTable={showTable}
          setShowTable={setShowTable}
          onSelectPatient={handleSelectPatient}
          selectionErrorMessage={searchPatientError}
        />
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default OtBooking;
