type InvestigationCommentItem = {
  Type: string;
  TypeId: number;
  Id: number;
  Name: string;
  IsActive: number;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
};

type ObservationItem = {
  observationId: number;
  observationName: string;
  prefix: string;
  suffix: string;
  method: string;
  methodId: number;
  showInDischargeSummary: number;
  roundUp: string;
  fieldTypeId: number;
  isActive: number;
};
type SelectItem = {
  label: string;
  value: number;
};

type LovLists = {
  LOVId: number;
  LOVName: string;
};

type CommentListItem = {
  Type: string;
  TypeId: number;
  Id: number;
  Name: string;
  IsActive: number;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
};

type ObservationCommentItem = {
  TypeId: number;
  Type: string;
  ObservationId: number;
  ItemId: number;
  Name: string;
  observationName?: string;
};
export type {
  CommentListItem,
  InvestigationCommentItem,
  LovLists,
  ObservationCommentItem,
  ObservationItem,
  SelectItem,
};
