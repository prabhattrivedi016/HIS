type ColorItem = {
  colorId: number;
  colorName: string;
  colorCode: string;
};

type SampleTypeItem = {
  sampleTypeId: number;
  sampleType: string;
  containerColorId: number;
  colorName: string;
  colorCode: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  isActive: number;
};

type LabMethodItem = {
  methodId: number;
  method: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  isActive: number;
};

type FieldBoyItem = {
  fieldBoyId: number;
  fieldBoyName: string;
  isActive: number;
  createdBy?: string;
  createdOn?: string;
  lastModifiedBy?: string;
  lastModifiedOn?: string;
};

type SampleRejectionItem = {
  sampleRejectionRemarksID: number;
  sampleRejectionRemarks: string;
  isActive: number;
  createdBy?: string;
  createdOn?: string;
  lastModifiedBy?: string;
  lastModifiedOn?: string;
};

type SampleRemarksItem = {
  sampleRemarksID: number;
  sampleRemarks: string;
  isActive: number;
};
export type {
  ColorItem,
  FieldBoyItem,
  LabMethodItem,
  SampleRejectionItem,
  SampleRemarksItem,
  SampleTypeItem,
};
