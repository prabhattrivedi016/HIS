import GlobalFooterButtons from "@/components/globalButtons/GlobalFooterButtons";
import UhidGlobalSearch from "@/components/SingledrawerAndPopup/components/UhidGlobalSearch";
import { IPDAdmissionTabName, OTBookingTabName, PageType } from "@/constants/constants";
import React from "react";
import { NavLink } from "react-router-dom";
import IpdAdmissionDetails from "../ipdAdmission/components/IpdAdmissionDetails";
import PatientData from "../patientRegistration/components/PatientData";

const OtBooking = () => {
  const [activeTab, setActiveTab] = React.useState<string>(IPDAdmissionTabName.PATIENT_DETAILS);
  const patientTabError = false;

  //   render tabs
  const renderTabs = () => (
    <>
      <div className={activeTab === IPDAdmissionTabName.PATIENT_DETAILS ? "" : "hidden"}>
        <PatientData
        //   key={`patient-data-${formResetKey}`}
        //   ref={patientDataRef}
        //   selectedPatientId={activePatientId}
        //   showRegistrationButton={showRegistrationButton}
        //   onPayloadChange={setPatientRegistrationDetails}
        //   onPatientLoaded={handlePatientLoadedFromUhid}
        />
      </div>

      <div className={activeTab === IPDAdmissionTabName.IPD_ADIMISSION ? "" : "hidden"}>
        <IpdAdmissionDetails
        //   ref={admissionDetailsRef}
        //   patientDetails={patientRegistrationDetails}
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
              //   onPatientSelect={handleUhidPatientSelect}
              //   resetKey={formResetKey}
              className="mt-1"
            />
          </div>

          {/* Right Section */}
          <div className="flex justify-end flex-1">
            <button type="button" className="save-btn">
              Search Old Patient
            </button>
          </div>
        </div>
      </div>

      {/* {patientSummary && (
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
      )} */}

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
      <GlobalFooterButtons pageType={PageType?.IPD_ADMISSION} />

      {/* {loading && <CustomLoader isLoading={loading} />} */}
    </div>
  );
};

export default OtBooking;
