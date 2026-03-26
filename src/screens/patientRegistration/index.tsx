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
import { useRef, useState } from "react";
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
});

const PatientRegistration = () => {
  const { loading, fetchApi } = useGlobalApi();
  const methods = useForm({
    resolver: yupResolver(patientRegistrationSchema),
    defaultValues: resetFormData(),
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

    showSuccess(resp?.message ?? "Data saved successfully");
    reset(resetFormData());
    setImage(null);
    setCapturedImage(null);
    setResetSignal(prev => prev + 1);
  };

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
              <SearchPatient />
              <PatientDetails resetSignal={resetSignal} />
              <PatientMaritalStatus />
              <ContactAndIdProof />
              <Abha />
              <Address resetSignal={resetSignal} />
              <Insurance resetSignal={resetSignal} />
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
