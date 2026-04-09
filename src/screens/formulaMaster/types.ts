type OptionItem = {
  label: string;
  value: number;
};

type InvestigationItem = {
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

type ObservationItem = {
  mappingId: number;
  // Some APIs send this as `investigationId`, some as `invastigationId`.
  investigationId?: number;
  invastigationId?: number;
  observationId: number;
  observationName: string;
  method: string;
  methodId: number;
  isHeader: boolean;
  isBold: boolean;
  isUnderLine: boolean;
  isMandatory: number;
  roundUp: string;
};

type FormulaComponent = {
  typeId: string;
  type: "observationId" | "operator" | "numbers";
  component: string;
  sequenceNo: string;
};

type CalculatorItem = {
  typeId: string;
  type: string;
  component: string;
  sequenceNo: string;
};

type FormulaTable = {
  investigationName: string;
  observationName: string;
  formulaText: string;
  observationId: number;
  invastigationId: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

export type {
  CalculatorItem,
  FormulaComponent,
  FormulaTable,
  InvestigationItem,
  ObservationItem,
  OptionItem,
};

/*
categoryId
3
labTypeId
1
reportTypeId
1
isActive
1 */
