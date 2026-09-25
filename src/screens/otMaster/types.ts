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
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
  IsActive: number;
};

export type { OtMasterItem };
