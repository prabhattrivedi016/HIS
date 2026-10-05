type OtMasterItem = {
  BranchName: string;
  BranchId: number;
  OTId: number;
  OTName: string;
  OTStartTime: string;
  OTEndTime: string;
  OTSlotMins: number;
  CreateBy: string;
  CreateOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
  IsActive: number;
};
type resourceItem = {
  name: string;
  id: number;
};

export type { OtMasterItem, resourceItem };
