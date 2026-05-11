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

type InvestigationNameItem = {
  serviceItemId: number;
  hospId: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  name: string;
  code: string;
  reportTypeId: number;
  labTypeId: number;
  reportType: string;
  isSampleRequired: number;
  sampleTypeId: number;
  sampleTypeIdList: string;
  labMethodId: number;
  forGenderId: number;
  forGender: string;
  isOutSource: number;
  isPrintAlone: number;
  isDepartmentReceivingRequired: number;
  shortName: string;
  sampleVolume: string;
  investigationComment: string;
  tatInMin: number;
  isActive: number;
};

type TemplateItem = {
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

type InvestigationInterpretationMappingItem = {
  TypeId: number;
  Type: string;
  InvestigationId: number;
  ItemId: number;
  Name: string;
  investigationName?: string;
};
export type {
  CommentListItem,
  InvestigationInterpretationMappingItem,
  InvestigationCommentItem,
  InvestigationNameItem,
  LovLists,
  ObservationCommentItem,
  ObservationItem,
  SelectItem,
  TemplateItem,
};
