type ValueItem = {
  label?: string;
  value?: string | number;
  keyFromApi?: string;
};

type LabelAction = {
  label: string;
  action: string;
};

interface CorporateMasterGridItem {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  cardLeftTop: { label: string; value?: number | null }[];
  cardRightTop: ValueItem[];
  cardAvatar?: string | null;
  cardId: ValueItem[];
  cardTitle: ValueItem[];
  cardFooter: ValueItem[];
  cardButton: {
    label: string;
    action: string;
  }[];
  buttonSection: {
    label: string;
    action: string;
    color?: string;
  }[];
}

interface ListColumn {
  label: string;
  keyFromApi: string;

  value: string | number | null;

  isSortable?: boolean;
  isSearchable?: boolean;
  allowColumnFilter?: boolean;
  isMasked?: boolean;
}

interface CorporateMasterListItem {
  type: "corporateMaster";
  cardType: "corporateMasterList";
  cardViewType: "list";

  id: number;

  listLeftButton: LabelAction[];

  columns: ListColumn[];
}

type CorporateTypeItem = {
  corporateTypeId: number;
  corporateTypeName: string;
};

type AddNewCorporateTypeProps = {
  isOpen: boolean;
  onClose: () => void;
  data: CorporateTypeItem | null;
  refreshData: () => void;
};

type InsuranceCompanyItem = {
  insuranceCompanyId: number;
  insuranceCompanyName: string;
};

type AddNewInsuranceProps = {
  isOpen: boolean;
  onClose: () => void;
  data: InsuranceCompanyItem | null;
  refresh: () => void;
};
type PaymentTypeItem = {
  value: string;
  key: string;
};

type PaymentItem = {
  paymentModeId: number;
  paymentModeName: string;
  payModeType: string;
  payModeTypeId: number;
  isRefundAllowed: number;
  isActive: number;
};

type SelectItem = {
  label: string;
  value: string | number;
};

type RateListItem = {
  rateListId: number;
  rateListName: string;
  applicableDate: string;
  expiryDate: string;
  isActive: number;
};

type AddNewCorporateMasterProps = {
  isOpen: boolean;
  onClose: () => void;
  corporateId: number | null;
  refreshData: () => Promise<void>;
};

type AddIpdOpdPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  ipdValue?: string;
  opdValue?: string;
  setIpdValue?: (value: string) => void;
  setOpdValue?: (value: string) => void;
};
export type {
  AddIpdOpdPopupProps,
  AddNewCorporateMasterProps,
  AddNewCorporateTypeProps,
  AddNewInsuranceProps,
  CorporateMasterGridItem,
  CorporateMasterListItem,
  CorporateTypeItem,
  InsuranceCompanyItem,
  PaymentItem,
  PaymentTypeItem,
  RateListItem,
  SelectItem,
};
