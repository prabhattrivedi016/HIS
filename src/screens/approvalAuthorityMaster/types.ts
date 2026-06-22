type ApprovalTableItem = {
  Id: number;
  ApprovalFlowId: number;
  ApprovalFlow: string;
  IsAllApprovalRequired: number;
  ApprovalTypeId: number;
  ApprovalType: string;
  RoleId: number;
  RoleName: string;
  Level1UserName: string;
  Level2UserName: string;
  Level3UserName: string;
  Level4UserName: string;
  ApprovalLevelId: number;
  ApprovalLevel: string;
  Level1UserId: string;
  Level2UserId: string;
  Level3UserId: string;
  Level4UserId: string;
  AmountUpTo: number;
  IsActive: number;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
};

type LevelVisibility = {
  level1: boolean;
  level2: boolean;
  level3: boolean;
  level4: boolean;
};

export type { ApprovalTableItem, LevelVisibility };
