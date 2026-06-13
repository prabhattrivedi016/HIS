type TypeItem = {
  serviceItemId: number;
  hospId: number;
  categoryTypeId: number;
  categoryId: number;
  categoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  subSubCategoryId: number;
  subSubCategoryName: string;
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
  gstPer: number;
  roomTypeId: number;
  roomType: string;
  isICU: number;
  snomedCode: string;
  opdConsultationTypeId: number;
  opdConsultationType: "";
  isOnlineConsultationAllow: number;
  isTeleConsultationService: number;
};

type FloorItem = {
  floorId: number;
  floorName: string;
};

type WardItem = {
  WardNameId: number;
  WardName: string;
};

type BlockItem = {
  blockId: number;
  blockName: string;
};

type BedMasterTableItem = {
  BranchName: string;
  BranchId: number;
  Type: string;
  TypeId: number;
  FloorName: string;
  FloorId: number;
  BlockName: string;
  BlockId: number;
  WardName: string;
  WardNameId: number;
  RoomName: string;
  BedNo: number;
  BedId: number;
  IsActive: number;
  RoomType: string;
  RoomTypeId: number;
  Gender: string;
};

export type { BedMasterTableItem, BlockItem, FloorItem, TypeItem, WardItem };
