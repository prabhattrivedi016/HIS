type OpdAppointmentConfirmationItem = {
  AppId: number;
  TokenNo: string;
  BranchId: number;
  PatientId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  InsuranceCompanyId: number;
  CorporateId: number;
  DoctorId: number;
  DoctorName: string;
  ServiceItemId: number;
  ServiceName: string;
  Amount: number;
  ReceiptId: number;
  AppDateTime: string;
  SlotId: number;
  SourceType: string;
  StatusId: number;
  STATUS: string;
  IsConfirm: number;
  ConfirmBy: string | null;
  ConfirmOn: string | null;
  IsReschedule: number;
  RescheduleBy: string | null;
  RescheduleOn: string | null;
  IsCancel: number;
  CancelReason: string | null;
  CancelBy: string | null;
  CancelOn: string | null;
  CreatedBy: string | null;
  CreatedOn: string | null;
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
};

type OpdAppointmentConfirmationGridCard = {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  cardLeftTop: { label: string; value: string | number | null }[];
  cardRightTop: { label: string; action: string }[];
  cardAvatar: string | null;
  cardId: { label: string; value: string | number | null }[];
  cardTitle: { label: string; value: string | number | null }[];
  cardFooter: { label: string; value: string | number | null }[];
  buttonSection: { label: string; action: string }[];
};

type OpdAppointmentConfirmationListCard = {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  listLeftButton: { label: string; action: string }[];
  columns: {
    label: string;
    keyFromApi: string;
    value: string | number | null;
    isSortable?: boolean;
    isSearchable?: boolean;
    allowColumnFilter?: boolean;
    isMasked?: boolean;
  }[];
};

export type {
  OpdAppointmentConfirmationGridCard,
  OpdAppointmentConfirmationItem,
  OpdAppointmentConfirmationListCard,
};
