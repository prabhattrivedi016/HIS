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

type CategoryListItem = {
  categoryId: number;
  categoryName: string;
};

type SubCategoryListItem = {
  categoryId: number;
  subCategoryId: number;
  subCategoryName: string;
  labTypeId: number;
  labType?: string;
};

type SubSubCategoryItem = {
  subCategoryId: number;
  subSubCategoryId: number;
  subSubCategoryName: string;
  subSubCategoryAlias?: string;
  printOrder?: number;
};

type InvestigationTableItem = {
  serviceItemId: number;
  hospId: number;
  categoryId: number;
  subCategoryId: number;
  subCategoryName?: string;
  subSubCategoryId: number;
  subSubCategoryName?: string;
  name: string;
  code: string;
  reportTypeId: number;
  reportType: string;
  isSampleRequired: number;
  sampleTypeId: number;
  sampleTypeIdList: "";
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
type PickMasterOption = {
  key: string;
  value: string;
};

type EditablePopupData =
  | {
      categoryId?: number;
      subCategoryId?: number;
      subCategoryName?: string;
      labTypeId?: number;
      labType?: string;
    }
  | {
      subCategoryId?: number;
      subSubCategoryId?: number;
      subSubCategoryName?: string;
      subSubCategoryAlias?: string;
      printOrder?: number | string;
    }
  | null;

type AddLabInvestigationProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string;
  categoryId?: number | null;
  data?: InvestigationTableItem | null;
  refreshTableData?: () => Promise<void>;
};

export type {
  AddLabInvestigationProps,
  CategoryListItem,
  EditablePopupData,
  InvestigationTableItem,
  PickMasterOption,
  SampleTypeItem,
  SelectItem,
  SubCategoryListItem,
  SubSubCategoryItem,
  TestMethodItem,
};
