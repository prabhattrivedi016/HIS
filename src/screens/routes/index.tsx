import BankMaster from "../bankMaster";
import BedDetails from "../bedDetails";
import BranchMaster from "../branchMaster";
import CompanySetting from "../companySetting";
import Dashboard from "../dashboard";
import DoctorConsultationNew from "../doctorConsultationNew";
import DoctorMaster from "../doctorMaster";
import FormulaMaster from "../formulaMaster";
import HeaderFooterMaster from "../headerFooterMaster";
import LabInvestigationMaster from "../labInvestigationMaster";
import LabMaster from "../labMaster";
import LocationMaster from "../loactionMaster";
import MrdLocationMaster from "../mrdLocation";
import NavigationPanel from "../navigationPanel";
import PatientDocumentMaster from "../patientDocumentMaster";
import ReferDoctorMaster from "../referDoctorMaster";
import RoleMaster from "../roleMaster";
import UserAuthorization from "../userAuthorization";
import UserDepartment from "../userDepartment";
import UserGroupMaster from "../userGroupMaster";
import UserMaster from "../userMaster";
import VendorMaster from "../vendorMaster";

export const authorizedRouteMap: Record<string, JSX.Element> = {
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
};
