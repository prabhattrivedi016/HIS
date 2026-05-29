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

type AntibioticMasterItem = {
  antibioticNameId: number;
  antibioticName: string;
  antibioticGroupId: number;
  antibioticGroup: string;
  isActive: number;
};

type AntibioticGroupItem = {
  antibioticGroupId: number;
  antibioticGroupName: string;
  isActive: number;
};

type CultureItem = {
  id: number;
  typeId: number;
  type: string;
  name: string;
  contentValue: string;
  isActive: number;
  ipAddress: string;
};

export type {
  AntibioticGroupItem,
  AntibioticMasterItem,
  CultureItem,
  OrganismGroupItem,
  OrganismMasterItem,
};
