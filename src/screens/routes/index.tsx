import React from "react";
import AllergyMaster from "../allergyMaster";
import AllergyResultEntry from "../allergyResultEntry";
import ApprovalAuthorityMaster from "../approvalAuthorityMaster";
import BankMaster from "../bankMaster";
import BedDetails from "../bedDetails";
import BedMaster from "../bedMaster";
import BillReceiptReprint from "../billReceiptReprint";
import BranchMaster from "../branchMaster";
import BranchSettings from "../branchSettings";
import CompanySetting from "../companySetting";
import ConsultationHeaderMaster from "../consultationHeaderMaster";
import ControlTest from "../controlTest";
import CorporateMaster from "../corporateMaster";
import CreditNoteApproval from "../creditNoteApproval";
import CreditNoteGeneration from "../creditNoteGeneration";
import CreditNoteWriteOff from "../creditNoteWriteOff";
import Dashboard from "../dashboard";
import DiagnosisMaster from "../diagnosisMaster";
import DiscountApprovalMaster from "../discountApprovalMaster";
import DoctorConsultationNew from "../doctorConsultationNew";
import DoctorMaster from "../doctorMaster";
import PatientDocumentMaster from "../documentMaster";
import EmrControls from "../emrControls";
import FormulaMaster from "../formulaMaster";
import GravityMaster from "../gravityMaster";
import HeaderFooterMaster from "../headerFooterMaster";
import HistoReportMaster from "../histoReportMaster";
import HistoResultEntry from "../histoResultEntry";
import ImportTariffs from "../importTariffs";
import InvestigationInterpretationTemplate from "../investigationInterpretationTemplate";
import InvestigationObservationMapping from "../investigationObservationMapping";
import IPDAdmission from "../ipdAdmission";
import IpdBilling from "../ipdBilling";
import LabInvestigationMaster from "../labInvestigationMaster";
import LabMaster from "../labMaster";
import LaboratoryHelpDesk from "../laboratoryHelpDesk";
import PathologyResultEntry from "../labResultEntry";
import LabWorkSheet from "../labWorkSheet";
import LocationMaster from "../loactionMaster";
import MicroReportMaster from "../microReportMaster";
import MicroResultEntry from "../microResultEntry";
import MrdLocationMaster from "../mrdLocation";
import NavigationPanel from "../navigationPanel";
import OpdBilling from "../opdBilling";
import OPDiscountApproval from "../opDiscountApproval";
import OpdRefund from "../opdRefund";
import OPPaymentCollection from "../opPaymentCollection";
import OpRefundApproval from "../opRefundApproval";
import OPRefundPayment from "../opRefundPayment";
import PackageMaster from "../packageMaster";
import PatientAdvance from "../patientAdvance";
import PatientRegistration from "../patientRegistration";
import ProcedureMaster from "../procedureMaster";
import RateListMaster from "../rateListMaster";
import ReferDoctorMaster from "../referDoctorMaster";
import ReferLabMaster from "../referLabMaster";
import ResultEntryRadiology from "../resultEntryRadiology";
import RoleMaster from "../roleMaster";
import SampleManagement from "../sampleManagement";
import ServiceMaster from "../serviceMaster";
import TabMaster from "../tabMaster";
import TariffManager from "../tariffManager";
import TemperatureRoom from "../temperatureRoom";
import NoPage from "../unauthorized";
import UserAuthorization from "../userAuthorization";
import UserDepartment from "../userDepartment";
import UserGroupMaster from "../userGroupMaster";
import UserMaster from "../userMaster";
import UserWiseDiscountMaster from "../userWiseDiscountMaster";
import VendorMaster from "../vendorMaster";
import VitalMaster from "../vitalmaster";
import WriteOff from "../writeOff";
import WriteOffApproval from "../writeOffApproval";
import WriteOffGeneration from "../writeOffGeneration";

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
  "pathology-result-entry": <PathologyResultEntry />,
  "result-entry-radiology": <ResultEntryRadiology />,
  "histo-result-entry": <HistoResultEntry />,
  "micro-result-entry": <MicroResultEntry />,
  "lab-work-sheet": <LabWorkSheet />,
  "allergy-result-entry": <AllergyResultEntry />,
  "laboratory-help-desk": <LaboratoryHelpDesk />,
  "allergy-master": <AllergyMaster />,
  "corporate-master": <CorporateMaster />,
  "import-tariffs": <ImportTariffs />,
  "ipd-billing": <IpdBilling />,
  "investigation-observation-mapping": <InvestigationObservationMapping />,
  "refer-lab-master": <ReferLabMaster />,
  "rate-list-master": <RateListMaster />,
  "tariff-manager": <TariffManager />,
  "patient-registration": <PatientRegistration />,
  "discount-approval-master": <DiscountApprovalMaster />,
  "opd-billing": <OpdBilling />,
  "template-investigation-interpretation": <InvestigationInterpretationTemplate />,
  "histo-report-master": <HistoReportMaster />,
  "micro-report-master": <MicroReportMaster />,
  "user-wise-discount-master": <UserWiseDiscountMaster />,
  "consultation-header-master": <ConsultationHeaderMaster />,
  "service-master": <ServiceMaster />,
  "bed-master": <BedMaster />,
  "ipd-admission": <IPDAdmission />,
  "tab-master": <TabMaster />,
  "approval-authority-master": <ApprovalAuthorityMaster />,
  "temperature-room": <TemperatureRoom />,
  "vital-master": <VitalMaster />,
  "branch-settings": <BranchSettings />,
  "op-discount-approval": <OPDiscountApproval />,
  "op-payment-collection": <OPPaymentCollection />,
  "diagnosis-master": <DiagnosisMaster />,
  "procedure-master": <ProcedureMaster />,
  "emr-controls": <EmrControls />,
  "control-test": <ControlTest />,
  "patient-advance": <PatientAdvance />,
  "opd-refund": <OpdRefund />,
  "op-refund-approval": <OpRefundApproval />,
  "gravity-master": <GravityMaster />,
  "op-refund-payment": <OPRefundPayment />,
  "bill-receipt-reprint": <BillReceiptReprint />,
  "credit-note": <CreditNoteWriteOff />,
  "write-off": <WriteOff />,
  "credit-note-approval": <CreditNoteApproval />,
  "write-off-approval": <WriteOffApproval />,
  "credit-note-generation": <CreditNoteGeneration />,
  "write-off-generation": <WriteOffGeneration />,
  "package-master": <PackageMaster />,
};
