import React from "react";
import AllergyMaster from "../allergyMaster";
import AllergyResultEntry from "../allergyResultEntry";
import BankMaster from "../bankMaster";
import BedDetails from "../bedDetails";
import BranchMaster from "../branchMaster";
import CompanySetting from "../companySetting";
import CorporateMaster from "../corporateMaster";
import Dashboard from "../dashboard";
import DoctorConsultationNew from "../doctorConsultationNew";
import DoctorMaster from "../doctorMaster";
import FormulaMaster from "../formulaMaster";
import HeaderFooterMaster from "../headerFooterMaster";
import HistoResultEntry from "../histoResultEntry";
import ImportTariffs from "../importTariffs";
import InvestigationObservationMapping from "../investigationObservationMapping";
import IpdBilling from "../ipdBilling";
import LabInvestigationMaster from "../labInvestigationMaster";
import LabMaster from "../labMaster";
import LaboratoryHelpDesk from "../laboratoryHelpDesk";
import LabResultEntry from "../labResultEntry";
import LabWorkSheet from "../labWorkSheet";
import LocationMaster from "../loactionMaster";
import MicroResultEntry from "../microResultEntry";
import MrdLocationMaster from "../mrdLocation";
import NavigationPanel from "../navigationPanel";
import PatientDocumentMaster from "../patientDocumentMaster";
import PatientMaster from "../patientMaster";
import RateListMaster from "../rateListMaster";
import ReferDoctorMaster from "../referDoctorMaster";
import ReferLabMaster from "../referLabMaster";
import ResultEntryRadiology from "../resultEntryRadiology";
import RoleMaster from "../roleMaster";
import SampleManagement from "../sampleManagement";
import NoPage from "../unauthorized";
import UserAuthorization from "../userAuthorization";
import UserDepartment from "../userDepartment";
import UserGroupMaster from "../userGroupMaster";
import UserMaster from "../userMaster";
import VendorMaster from "../vendorMaster";

export const authorizedRouteMap: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  "role-master": <RoleMaster />,
  "user-master": <UserMaster />,
  "user-group": <UserGroupMaster />,
  "user-department": <UserDepartment />,
  "user-authorization": <UserAuthorization />,
  "navigation-pane": <NavigationPanel />,
  "branch-master": <BranchMaster />,
  "location-master": <LocationMaster />,
  "print-settings": <HeaderFooterMaster />,
  "bank-master": <BankMaster />,
  "vendor-master": <VendorMaster />,
  "mrd-location": <MrdLocationMaster />,
  "doctor-master": <DoctorMaster />,
  "patient-document": <PatientDocumentMaster />,
  "company-setting": <CompanySetting />,
  "refer-doctor-master": <ReferDoctorMaster />,
  "lab-master": <LabMaster />,
  "lab-investigation-master": <LabInvestigationMaster />,
  "formula-master": <FormulaMaster />,
  "doctor-consultation-new": <DoctorConsultationNew />,
  "bed-details": <BedDetails />,
  "no-page": <NoPage />,
  "sample-management": <SampleManagement />,
  "lab-result-entry": <LabResultEntry />,
  "result-entry-radiology": <ResultEntryRadiology />,
  "histo-result-entry": <HistoResultEntry />,
  "micro-result-entry": <MicroResultEntry />,
  "lab-work-sheet": <LabWorkSheet />,
  "allergy-result-entry": <AllergyResultEntry />,
  "laboratory-help-desk": <LaboratoryHelpDesk />,
  "allergy-master": <AllergyMaster />,
  "patient-master": <PatientMaster />,
  "corporate-master": <CorporateMaster />,
  "import-tariffs": <ImportTariffs />,
  "ipd-billing": <IpdBilling />,
  "investigation-observation-mapping": <InvestigationObservationMapping />,
  "refer-lab-master": <ReferLabMaster />,
  "rate-list-master": <RateListMaster />,
};
