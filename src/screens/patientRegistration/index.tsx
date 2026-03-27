import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { BranchId } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import {
  PatientRegistrationFormItem,
  patientRegistrationSchema,
} from "@/validation/patientRegistrationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import Webcam from "react-webcam";
import SaveButtons from "../patientMaster/components/SaveButtons";
import Abha from "./components/Abha";
import Address from "./components/Address";
import ContactAndIdProof from "./components/ContactAndIdProof";
import Insurance from "./components/Insurance";
import PatientDetails from "./components/PatientDetails";
import PatientMaritalStatus from "./components/PatientMaritalStatus";
import SearchPatient from "./components/SearchPatient";
import { createPatientFormData } from "./components/createPatientFormData";
import { PatientDataItem } from "./types";

const resetFormData = () => ({
  PatientId: 0,
  BranchId: BranchId.DEFAULT,
  Title: "Mr.",
  FirstName: "",
  MiddleName: "",
  LastName: "",
  AgeYears: "",
  AgeMonths: "",
  AgeDays: "",
  Dob: "",
  Gender: "",
  MaritalStatus: "",
  Relation: "",
  RelativeName: "",
  IdProofName: "",
  IdProofNumber: "",
  SelfContactNumber: "",
  EmergencyContactNumber: "",
  Email: "",
  PrivilegedCardNumber: "",
  Address: "",
  CountryId: 0,
  Country: "",
  StateId: 0,
  State: "",
  DistrictId: 0,
  District: "",
  CityId: 0,
  City: "",
  InsuranceCompanyId: 0,
  CorporateId: 0,
  CardNo: "",
  PatientImageFile: "",
  UniqueId: "",
  IsVaccination: 0,
  VipPatient: "",
  PolicyNo: "",
  PolicyCardNo: "",
  ExpiryDate: "",
  CardHolder: "",
  ReferalNo: "",
  ReferalDate: "",
  ReferralDate: "",
  OnlinePtId: 0,
  HealthId: "",
  HealthIdNumber: "",
  UhidOrBarcode: "",
  SearchBy: "",
  SearchValue: "",
  Pincode: "",
});

const formatDateForInput = (value?: string | null) => {
  if (!value) return "";
  const trimmed = String(value).trim();

  const ymd = trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
  }

  const dmy = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
};

const mapSearchedPatientToForm = (patient: PatientDataItem) => ({
  ...resetFormData(),
  PatientId: patient.patientId ?? 0,
  BranchId: patient.branchId ?? BranchId.DEFAULT,
  Title: patient.title ?? "Mr.",
  FirstName: patient.firstName ?? "",
  MiddleName: patient.middleName ?? "",
  LastName: patient.lastName ?? "",
  AgeYears: patient.ageYears ?? "",
  AgeMonths: patient.ageMonths ?? "",
  AgeDays: patient.ageDays ?? "",
  Dob: formatDateForInput(patient.dob),
  Gender: patient.gender ?? "",
  MaritalStatus: patient.maritalStatus ?? "",
  Relation: patient.relation ?? "",
  RelativeName: patient.relativeName ?? "",
  IdProofName: patient.idProofName ?? "",
  IdProofNumber: patient.idProofNumber ?? "",
  SelfContactNumber: patient.contactNumber ?? "",
  EmergencyContactNumber: patient.emergencyContactNumber ?? "",
  Email: patient.email ?? "",
  PrivilegedCardNumber: patient.privilegedCardNumber ?? "",
  Address: patient.address ?? "",
  CountryId: patient.countryId ?? 0,
  Country: patient.country ?? "",
  StateId: patient.stateId ?? 0,
  State: patient.state ?? "",
  DistrictId: patient.districtId ?? 0,
  District: patient.district ?? "",
  CityId: patient.cityId ?? 0,
  City: patient.city ?? "",
  InsuranceCompanyId: patient.insuranceCompanyId ?? 0,
  CorporateId: patient.corporateId ?? 0,
  CardNo: patient.cardNo ?? "",
  IsVaccination: patient.isVaccination ?? 0,
  VipPatient: patient.vipPatient ? String(patient.vipPatient) : "",
  PolicyNo: patient.policyNo ?? "",
  PolicyCardNo: patient.policyCardNo ?? "",
  ExpiryDate: formatDateForInput(patient.expiryDate),
  CardHolder: patient.cardHolder ?? "",
  ReferalNo: patient.referalNo ?? "",
  ReferalDate: formatDateForInput(patient.referalDate),
  ReferralDate: formatDateForInput(patient.referalDate),
});

const PatientRegistration = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [searchedPatientData, setSearchedPatientData] = useState<PatientDataItem | null>(null);

  const methods = useForm({
    resolver: yupResolver(patientRegistrationSchema),
    defaultValues: resetFormData(),
    reValidateMode: "onSubmit",
  });

  const { handleSubmit, reset } = methods;
  const webcamRef = useRef<Webcam | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [resetSignal, setResetSignal] = useState<number>(0);

  const captureImage = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;
    setCapturedImage(screenshot);
    setOpenCamera(false);
  };

  // submit handler
  const onSubmit = async (data: PatientRegistrationFormItem) => {
    const formData = await createPatientFormData(data, image);

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,
      formData,
      {},
      { component: "PatientRegistration", throwOnError: true }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Unable to save patient");
      return;
    }

    console.log("resp", resp?.data);

    showSuccess(resp?.message ?? "Data saved successfully");
    reset(resetFormData());
    setImage(null);
    setCapturedImage(null);
    setResetSignal(prev => prev + 1);
  };

  // edit handler
  useEffect(() => {
    if (!searchedPatientData) return;
    const mappedData = mapSearchedPatientToForm(searchedPatientData);
    reset(mappedData);
  }, [searchedPatientData, reset]);

  return (
    <div className="page-container">
      <h1 className="page-heading">Patient Registration</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>{">>"}</span>
        <span>Patient Registration</span>
      </nav>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-1 p-1 items-start">
            <div className="lg:col-span-4 h-full">
              <SearchPatient setPatient={setSearchedPatientData} />
              <PatientDetails resetSignal={resetSignal} />
              <PatientMaritalStatus />
              <ContactAndIdProof />
              <Abha />
              <Address resetSignal={resetSignal} prefillData={searchedPatientData} />
              <Insurance resetSignal={resetSignal} prefillData={searchedPatientData} />
            </div>

            <div className="lg:col-span-1 card p-4 sticky top-4 flex flex-col items-center">
              <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                {openCamera ? (
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full rounded-lg object-cover"
                    audio={false}
                  />
                ) : image ? (
                  <img
                    src={image}
                    alt="patient"
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="patient"
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}

                {!openCamera && (
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow hover:bg-blue-600"
                    onClick={() => setOpenCamera(true)}
                  >
                    <Camera size={18} />
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {openCamera && (
                  <button type="button" onClick={captureImage} className="save-btn">
                    Capture
                  </button>
                )}
                {!openCamera && capturedImage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImage(capturedImage)}
                      className="save-btn"
                    >
                      Save Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="cancel-button"
                    >
                      Discard
                    </button>
                  </>
                )}
                {!openCamera && image && (
                  <button type="button" onClick={() => setOpenCamera(true)} className="save-btn">
                    Retake
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-3">Upload Patient Image</p>

              <div className="flex flex-col gap-2">
                <button type="button" className="save-btn">
                  Patient Document
                </button>
                <button type="button" className="save-btn">
                  CRM Patient
                </button>
                <button type="button" className="save-btn">
                  Verify ABHA
                </button>
                <button type="button" className="save-btn">
                  Create ABHA
                </button>
              </div>
            </div>
          </div>

          <SaveButtons />
        </form>
      </FormProvider>

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default PatientRegistration;
