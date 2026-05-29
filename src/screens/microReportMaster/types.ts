type OrganismGroupItem = {
  organismGroupId: number;
  organismGroupName: string;
  isActive: number;
};

type OrganismMasterItem = {
  organismNameId: number;
  organismName: string;
  organismGroupId: number;
  organismGroup: string;
  isActive: number;
};

export type { OrganismGroupItem, OrganismMasterItem };
