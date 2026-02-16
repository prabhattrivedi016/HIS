type TestMethodItem = {
  methodId: number;
  method: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  isActive: number;
};

type SelectItem = {
  label: string;
  value: number;
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

export type { SampleTypeItem, SelectItem, TestMethodItem };
