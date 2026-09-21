import { createContext, ReactNode, useState } from "react";

type IpdPatientItem = {
  BranchId: number;
  PatientId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  ContactNumber: string;
  VisitId: number;
  IPDNo: string;
  AdmissionDate: string;
  AdmissionTime: string;
  DischargeDate: string;
  DischargeTime: string;
  State: string;
  District: string;
  City: string;
  Address: string | null;
  FullAddress: string;
  BedNo: string;
  Corporate: string;
  PrimaryDoctor: string;
  PrimaryDoctorId: number;
  SecondaryDoctor: string | null;
  PrimaryDoctorDepartment: string;
  PrimaryDoctorDepartmentId: number;
  BillingTypeId: number;
  InsuranceCompanyId: number;
  CorporateId: number;
  BedId: number;
  ProName: string;
  IsDischarged: number;
  DischargeType: string | null;
  IsFileClosed: number;
  BillNo: string | null;
  StatusId: number;
  TotalBillAmount: number;
  TotalDiscountPerOnBill: number;
  TotalDiscountAmountOnBill: number;
  RoundOff: number;
  TotalPayableAmount: number;
  TotalBalanceAmount: number;
  TotalBalanceAmount1: number;
  DSId: string | null;
  PatientAdvanceAmt: number;
  Remarks: string | null;
  BillingType: string;
  DoctorNumber: string;
  UserNAme: string;
  IsCaseBillingApplicable: number;
  Relation: string | null;
  RelativeName: string | null;
  DischargedOn: string | null;
  IsBillGenerated: number;
  BillGeneratedBy: string | null;
  BillGeneratedOn: string | null;
  FileClosedBy: string | null;
  FileClosedOn: string | null;
  DischargedBy: null | string;
};

type IpdPatientDetailsContextProviderProps = {
  children: ReactNode;
};

type IpdPatientDetailsContextType = {
  updatedIpdPatientDetails: IpdPatientItem | null;
  setUpdatedIpdPatientDetails: React.Dispatch<React.SetStateAction<IpdPatientItem | null>>;
};

export const IpdPatientDetailsContext = createContext<IpdPatientDetailsContextType | null>(null);

export const IpdPatientDetailsContextProvider = ({
  children,
}: IpdPatientDetailsContextProviderProps) => {
  const [updatedIpdPatientDetails, setUpdatedIpdPatientDetails] = useState<IpdPatientItem | null>(
    null
  );
  return (
    <IpdPatientDetailsContext.Provider
      value={{ updatedIpdPatientDetails, setUpdatedIpdPatientDetails }}
    >
      {children}
    </IpdPatientDetailsContext.Provider>
  );
};
