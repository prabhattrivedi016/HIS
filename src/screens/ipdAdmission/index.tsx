import CustomLoader from "@/components/customLoader";

import { ENDPOINTS } from "@/config/defaults";

import { IPDAdmissionTabName, IpdOpdTypeName, PageType } from "@/constants/constants";

import useGlobalApi from "@/hooks/useGlobalApi";
import { useAssignBranchRight } from "@/store/useAssignBranchRight";

import { showError, showSuccess, showWarning } from "@/utils/alert";

import { useCallback, useMemo, useRef, useState } from "react";

import { NavLink } from "react-router-dom";

import PatientData from "../patientRegistration/components/PatientData";

import SearchPatientPopup from "../patientRegistration/components/SearchPatientPopup";

import {
  PatientDataHandle,
  PatientDataItem,
  SearchedPatientItem,
} from "../patientRegistration/types";

import IpdAdmissionDetails from "./components/IpdAdmissionDetails";

import { buildIpdPatientSummary, buildSaveIpdAdmissionPayload } from "./helpers";

import GlobalFooterButtons from "@/components/globalButtons/GlobalFooterButtons";
import IpdOpdDocument from "@/components/SingledrawerAndPopup/components/IpdOpdDocument";
import UhidGlobalSearch from "@/components/SingledrawerAndPopup/components/UhidGlobalSearch";
import { IpdOpdDocumentHandle } from "@/components/SingledrawerAndPopup/types";
import { IpdAdmissionDetailsHandle } from "./types";

const IPDAdmission = () => {
  const { loading, fetchApi } = useGlobalApi();
  const { rights: branchRights } = useAssignBranchRight();
  const ispatientRegistartionChargeRequired =
    Number(branchRights?.IsPatientRegistrationChargeRequired) === 1 ? 1 : 0;
  const showRegistrationButton = ispatientRegistartionChargeRequired === 1;

  const patientDataRef = useRef<PatientDataHandle>(null);

  const admissionDetailsRef = useRef<IpdAdmissionDetailsHandle>(null);

  const ipdOpdDocumentRef = useRef<IpdOpdDocumentHandle>(null);

  const [activeTab, setActiveTab] = useState<string>(IPDAdmissionTabName.PATIENT_DETAILS);

  const [patientTabError, setPatientTabError] = useState<boolean>(false);
  const [documentTabError, setDocumentTabError] = useState<boolean>(false);

  const [patientRegistrationDetails, setPatientRegistrationDetails] = useState<
    Record<string, unknown>
  >({});

  const [formResetKey, setFormResetKey] = useState<number>(0);

  const [activePatientId, setActivePatientId] = useState<number | null>(null);

  const [openSearchPatientPopup, setOpenSearchPatientPopup] = useState<boolean>(false);

  const [renderSearchPatientPopup, setRenderSearchPatientPopup] = useState<boolean>(false);

  const [showTable, setShowTable] = useState<boolean>(false);
  const [searchPatientError, setSearchPatientError] = useState<string>("");

  const resetForm = useCallback(() => {
    setPatientTabError(false);
    setDocumentTabError(false);
    setSearchPatientError("");

    setActivePatientId(null);

    setPatientRegistrationDetails({});

    admissionDetailsRef.current?.resetForm();
    ipdOpdDocumentRef.current?.resetForm();

    setFormResetKey(prev => prev + 1);

    setActiveTab(IPDAdmissionTabName.PATIENT_DETAILS);
  }, []);

  const checkPatientAdmissionStatus = useCallback(
    async (patientId: number): Promise<{ isAdmitted: boolean; message?: string }> => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.CHECK_PATIENT_ADMITTED,
        {},
        { params: { patientId } },
        { component: "IpdAdmission", silent: true }
      );

      if (!resp) {
        return {
          isAdmitted: true,
          message: "Failed to verify patient admission status",
        };
      }

      // result: true => patient is currently admitted — block bind
      if (resp.result === true) {
        return {
          isAdmitted: true,
          message: resp.message ?? "Patient is currently admitted",
        };
      }

      // result: false => patient is not admitted — allow bind
      return { isAdmitted: false };
    },
    []
  );

  const bindPatientToRegistration = useCallback(async (patientId: number) => {
    setActivePatientId(patientId);
    setPatientTabError(false);
    await patientDataRef.current?.loadPatientById(patientId);
  }, []);

  const handleSelectPatient = useCallback(
    async (item: SearchedPatientItem) => {
      const patientId = Number(item?.PatientId ?? 0);

      if (!patientId) {
        setSearchPatientError("Invalid patient selected.");
        return false;
      }

      setSearchPatientError("");

      const { isAdmitted, message } = await checkPatientAdmissionStatus(patientId);

      if (isAdmitted) {
        setSearchPatientError(message ?? "Patient is already admitted");
        return false;
      }

      await bindPatientToRegistration(patientId);
      setActiveTab(IPDAdmissionTabName.IPD_ADIMISSION);
      return true;
    },

    [bindPatientToRegistration, checkPatientAdmissionStatus]
  );

  const handleUhidPatientSelect = useCallback(
    async (patientId: number) => {
      if (!patientId) {
        showWarning("Invalid patient selected.");
        return false;
      }

      const { isAdmitted, message } = await checkPatientAdmissionStatus(patientId);

      if (isAdmitted) {
        showWarning(message ?? "Patient is currently admitted");
        return false;
      }

      await bindPatientToRegistration(patientId);
      setActiveTab(IPDAdmissionTabName.IPD_ADIMISSION);
      return true;
    },
    [bindPatientToRegistration, checkPatientAdmissionStatus]
  );

  const SearchOldPatientHandler = () => {
    setSearchPatientError("");
    setOpenSearchPatientPopup(true);

    setRenderSearchPatientPopup(true);
  };

  const closeSearchPatientHandler = useCallback(() => {
    setSearchPatientError("");
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

    const areDocumentsValid = await ipdOpdDocumentRef.current?.validateMandatoryDocuments();

    if (!areDocumentsValid) {
      setDocumentTabError(true);
      setActiveTab(IPDAdmissionTabName.IPD_DOCUMENT);
      return;
    }

    setDocumentTabError(false);

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

      const { isAdmitted, message } = await checkPatientAdmissionStatus(patientId);

      if (isAdmitted) {
        showWarning(message ?? "Patient is currently admitted");
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

  const patientSummary = useMemo(
    () => buildIpdPatientSummary(patientRegistrationDetails),
    [patientRegistrationDetails]
  );

  const renderTabs = () => (
    <>
      <div className={activeTab === IPDAdmissionTabName.PATIENT_DETAILS ? "" : "hidden"}>
        <PatientData
          key={`patient-data-${formResetKey}`}
          ref={patientDataRef}
          selectedPatientId={activePatientId}
          showRegistrationButton={showRegistrationButton}
          onPayloadChange={setPatientRegistrationDetails}
          onPatientLoaded={handlePatientLoadedFromUhid}
        />
      </div>

      <div className={activeTab === IPDAdmissionTabName.IPD_ADIMISSION ? "" : "hidden"}>
        <IpdAdmissionDetails
          ref={admissionDetailsRef}
          patientDetails={patientRegistrationDetails}
        />
      </div>

      <div className={activeTab === IPDAdmissionTabName.IPD_DOCUMENT ? "" : "hidden"}>
        <IpdOpdDocument ref={ipdOpdDocumentRef} type={IpdOpdTypeName?.IPD} />
      </div>
    </>
  );

  return (
    <div className="page-container ">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col md:flex-row lg:flex-row items-center gap-3 w-full">
          {/* Left Section */}
          <div className="flex-1">
            <h1 className="page-heading">IPD Admission</h1>

            <nav className="helper-text">
              <NavLink to="/dashboard" className="hover:underline">
                Home
              </NavLink>
              <span>››</span>
              <span>IPD Admission</span>
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
            <button type="button" className="save-btn" onClick={SearchOldPatientHandler}>
              Search Old Patient
            </button>
          </div>
        </div>
      </div>

      {patientSummary && (
        <div className="flex flex-col md:flex-row lg:flex-row gap-10 card w-full mb-1">
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
        </div>
      )}

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

        <button
          type="button"
          onClick={() => setActiveTab(IPDAdmissionTabName.IPD_DOCUMENT)}
          className={`tab-btn transition ${
            activeTab === IPDAdmissionTabName.IPD_DOCUMENT ? "tab-btn-active" : "tab-btn-inactive"
          }`}
        >
          {IPDAdmissionTabName.IPD_DOCUMENT}
        </button>
      </div>

      {renderTabs()}

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

      {/* buttons */}
      <GlobalFooterButtons pageType={PageType?.IPD_ADMISSION} onButtonClick={buttonClickHandler} />

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default IPDAdmission;
