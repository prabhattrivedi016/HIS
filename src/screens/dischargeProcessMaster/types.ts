type DischargeProcessItem = {
  DischargeProcessId: number;
  ProcessKey: string;
  ProcessName: string;
  SequenceNo: number;
  FaIconId: number;
  IconName: string | null;
  IconClass: string | null;
  IsMandatory: 1 | 0;
  IsActive: 1 | 0;
  IsSystemProcess: 1 | 0;
  CreatedBy: string;
  CreatedOn: string;
  ModifiedBy: string | null;
  ModifiedOn: string | null;
};

type MappedCorporateItem = {
  DischargeProcessCorporateMappingId: number;
  DischargeProcessId: number;
  ProcessKey: string;
  ProcessName: string;
  CorporateId: number;
  CorporateName: string;
  InsuranceCompanyName: string;
};

type InsuranceListItem = {
  insuranceCompanyId: number;
  insuranceCompanyName: string;
};

type CorpoarteItem = {
  DischargeProcessCorporateMappingId?: number;
  ProcessName?: string;
  DischargeProcessId?: number;
  CorporateId?: number;
  branchId: number;
  insuranceCompanyId: number;
  corporateId: number;
  corporateName: string;
  paymentType: string;
  paymentTypeId: number;
  isRegistrationChargeApplicable: number;
  isCaseBillingApplicable: number;
};

type IconListItem = {
  id: number;
  iconClass: string;
  iconName: string;
};

export type {
  CorpoarteItem,
  DischargeProcessItem,
  IconListItem,
  InsuranceListItem,
  MappedCorporateItem,
};
