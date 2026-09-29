type OtProcessMasterItem = {
  OTProcessId: number;
  ProcessKey: string;
  ProcessName: string;
  FaIconId: number;
  SequenceNo: number;
  IsActive: boolean;
  IsSystemProcess: boolean;
  IconName: string;
  IconClass: string;
  CreatedBy: string;
  CreatedOn: string;
  ModifiedBy: string;
  ModifiedOn: string;
};

type IconListItem = {
  id: number;
  iconClass: string;
  iconName: string;
};

export type { IconListItem, OtProcessMasterItem };
