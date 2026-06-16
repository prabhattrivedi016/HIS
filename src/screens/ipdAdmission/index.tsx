import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { IPDAdmissionTabName } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useCallback, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Buttons from "../opdBilling/components/Buttons";
import PatientData from "../patientRegistration/components/PatientData";
import SearchPatientPopup from "../patientRegistration/components/SearchPatientPopup";
import { PatientDataHandle, PatientDataItem, SearchedPatientItem } from "../patientRegistration/types";
import IpdAdmissionDetails from "./components/IpdAdmissionDetails";
import { buildSaveIpdAdmissionPayload } from "./helpers";
import { IpdAdmissionDetailsHandle } from "./types";

const IPDAdmission = () => {
  const { loading, fetchApi } = useGlobalApi();
  const patientDataRef = useRef<PatientDataHandle>(null);
  const admissionDetailsRef = useRef<IpdAdmissionDetailsHandle>(null);

  const [activeTab, setActiveTab] = useState<string>(IPDAdmissionTabName.PATIENT_DETAILS);
  const [patientTabError, setPatientTabError] = useState<boolean>(false);
  const [patientRegistrationDetails, setPatientRegistrationDetails] = useState<
    Record<string, unknown>
  >({});
  const [formResetKey, setFormResetKey] = useState<number>(0);
  const [activePatientId, setActivePatientId] = useState<number | null>(null);

  const [openSearchPatientPopup, setOpenSearchPatientPopup] = useState<boolean>(false);
  const [renderSearchPatientPopup, setRenderSearchPatientPopup] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);

  const resetForm = useCallback(() => {
    setPatientTabError(false);
    setActivePatientId(null);
    setPatientRegistrationDetails({});
    admissionDetailsRef.current?.resetForm();
    setFormResetKey(prev => prev + 1);
    setActiveTab(IPDAdmissionTabName.PATIENT_DETAILS);
  }, []);

  const checkPatientAlreadyAdmitted = useCallback(
    async (patientId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.CHECK_PATIENT_ADMITTED,
        {},
        { params: { patientId } },
        { component: "IpdAdmission", silent: true }
      );

      const admissionData = resp?.data ?? {};
      return (
        Number(admissionData?.isAdmitted ?? admissionData?.IsAdmitted ?? 0) === 1 ||
        (resp?.result === false &&
          String(resp?.message ?? "")
            .toLowerCase()
            .includes("admit"))
      );
    },
    [fetchApi]
  );

  const handleSelectPatient = useCallback(
    async (item: SearchedPatientItem) => {
      const patientId = Number(item?.patientId ?? 0);
      if (!patientId) {
        showWarning("Invalid patient selected.");
        return false;
      }

      const isAlreadyAdmitted = await checkPatientAlreadyAdmitted(patientId);
      if (isAlreadyAdmitted) {
        showWarning("Patient is already admitted");
        return false;
      }

      setActivePatientId(patientId);
      setPatientTabError(false);
      setActiveTab(IPDAdmissionTabName.IPD_ADIMISSION);
      return true;
    },
    [checkPatientAlreadyAdmitted]
  );

  const SearchOldPatientHandler = () => {
    setOpenSearchPatientPopup(true);
    setRenderSearchPatientPopup(true);
  };

  const closeSearchPatientHandler = useCallback(() => {
    setOpenSearchPatientPopup(false);
    setTimeout(() => {
      setRenderSearchPatientPopup(false);
    }, 300);
  }, []);

  const handlePatientLoadedFromUhid = useCallback(() => {
    setActiveTab(IPDAdmissionTabName.IPD_ADIMISSION);
  }, []);

  const handleSave = async () => {
    const isPatientValid = await patientDataRef.current?.validateForm();

    if (!isPatientValid) {
      setPatientTabError(true);
      setActiveTab(IPDAdmissionTabName.PATIENT_DETAILS);
      return;
    }

    setPatientTabError(false);

    const isAdmissionValid = await admissionDetailsRef.current?.validateForm();
    if (!isAdmissionValid) {
      setActiveTab(IPDAdmissionTabName.IPD_ADIMISSION);
      return;
    }

    const isBedAvailable = await admissionDetailsRef.current?.validateBedSelection?.();
    if (isBedAvailable === false) {
      setActiveTab(IPDAdmissionTabName.IPD_ADIMISSION);
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

      const registrationResp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
        { component: "IpdAdmission" }
      );

      if (!registrationResp?.data?.patientId) {
        showError("Failed to register patient");
        return;
      }

      const patientId = Number(registrationResp.data.patientId);

      const isAlreadyAdmitted = await checkPatientAlreadyAdmitted(patientId);
      if (isAlreadyAdmitted) {
        showWarning("Patient is already admitted");
        return;
      }

      const patientResponse = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_MASTER,
        {},
        { params: { patientId } },
        { component: "IpdAdmission" }
      );

      const patientData = patientResponse?.data?.[0] as PatientDataItem | undefined;
      if (!patientData) {
        showError("Failed to fetch patient details");
        return;
      }

      const admissionValues = admissionDetailsRef.current?.getValues();
      if (!admissionValues) {
        showError("Failed to read admission details");
        return;
      }

      const payload = buildSaveIpdAdmissionPayload(patientData, admissionValues);

      const saveResp = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_IPD_ADMISSION,
        payload,
        {},
        { component: "IpdAdmission" }
      );

      if (!saveResp?.result) {
        showError(saveResp?.message || "Failed to save IPD admission");
        return;
      }

      await showSuccess(saveResp?.message ?? "IPD admission saved successfully");
      resetForm();
    } catch (error) {
      console.error("Error in IPD admission submission:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showError(`Failed to process IPD admission: ${errorMessage}`);
    }
  };

  const buttonClickHandler = async (value: string) => {
    if (value === "cancel") {
      resetForm();
      return;
    }

    if (value === "save") {
      await handleSave();
    }
  };

  const renderTabs = () => (
    <>
      <div className={activeTab === IPDAdmissionTabName.PATIENT_DETAILS ? "" : "hidden"}>
        <PatientData
          key={`patient-data-${formResetKey}`}
          ref={patientDataRef}
          selectedPatientId={activePatientId}
          showRegistrationButton={false}
          onPayloadChange={setPatientRegistrationDetails}
          onPatientLoaded={handlePatientLoadedFromUhid}
        />
      </div>

      <div className={activeTab === IPDAdmissionTabName.IPD_ADIMISSION ? "" : "hidden"}>
        <IpdAdmissionDetails ref={admissionDetailsRef} />
      </div>
    </>
  );

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row md:flex-row gap-4 items-center justify-between w-full">
        <div>
          <h1 className="page-heading">IPD Admission</h1>
          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>IPD Admission</span>
          </nav>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row md:flex-row">
          <button type="button" className="save-btn" onClick={SearchOldPatientHandler}>
            Search Old Patient
          </button>
        </div>
      </div>

      <div className="tab-card rounded-lg mb-1">
        <button
          type="button"
          onClick={() => setActiveTab(IPDAdmissionTabName.PATIENT_DETAILS)}
          className={`tab-btn transition rounded ${
            patientTabError
              ? "border-2 input-field-error"
              : activeTab === IPDAdmissionTabName.PATIENT_DETAILS
                ? "tab-btn-active"
                : "tab-btn-inactive"
          }`}
        >
          {IPDAdmissionTabName.PATIENT_DETAILS}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(IPDAdmissionTabName.IPD_ADIMISSION)}
          className={`tab-btn transition ${
            activeTab === IPDAdmissionTabName.IPD_ADIMISSION ? "tab-btn-active" : "tab-btn-inactive"
          }`}
        >
          {IPDAdmissionTabName.IPD_ADIMISSION}
        </button>
      </div>

      {renderTabs()}

      <Buttons onButtonClick={buttonClickHandler} />

      {renderSearchPatientPopup && (
        <SearchPatientPopup
          isOpen={openSearchPatientPopup}
          onClose={closeSearchPatientHandler}
          showTable={showTable}
          setShowTable={setShowTable}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default IPDAdmission;
