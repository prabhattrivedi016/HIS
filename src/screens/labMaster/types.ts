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

export type { ColorItem, LabMethodItem, SampleTypeItem };
