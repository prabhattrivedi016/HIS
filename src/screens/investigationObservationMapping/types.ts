interface InvestigationObservationMappingItem {
  serviceItemId: number;
  hospId: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  name: string;
  code: string;
  reportTypeId: number;
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
}
type PickMasterOption = {
  key: string;
  value: string;
};

type SelectItem = {
  label: string;
  value: number;
};

type ObservationPopupFormData = {
  observationId: number;
  observationName: string;
  prefixName: string;
  suffixName: string;
  methodId: number;
  showInDS: number;
  roundUp: string;
  fieldType: string;
  fieldTypeId: number;
};

type ObservationPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: ObservationMappingItem;
  onSuccess: () => Promise<void>;
};

type LabMethodListIem = {
  methodId: number;
  method: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  isActive: number;
};

type ObservationMappingItem = {
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

type observationTableDataItem = {
  mappingId?: number;
  invastigationId: number;
  observationId: number;
  observationName: string;
  method: string;
  methodId?: number;
  isHeader: boolean;
  isBold: boolean;
  isUnderLine: boolean;
  isMandatory: number;
  roundUp: string;
};

type RangeTableItem = {
  id?: number;
  observationId?: number;
  observationName?: string;
  gender: string;
  fromAge?: string | number;
  toAge: string;
  isActive?: number;
  defaultValue: string;
  minValue: string;
  maxValue: string;
  unit: string;
  displayValue: string;
  error?: string;
};

type EditRangePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data?: observationTableDataItem;
};

export type {
  EditRangePopupProps,
  InvestigationObservationMappingItem,
  LabMethodListIem,
  ObservationMappingItem,
  ObservationPopupFormData,
  ObservationPopupProps,
  observationTableDataItem,
  PickMasterOption,
  RangeTableItem,
  SelectItem,
};
