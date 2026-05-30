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

type MicroMappingTableItem = {
  antibioticIdList: string;
  organismId: string;
  organismName: string;
  antibioticName: string;
  antibioticNameId: string;
  antibioticClassName: string;
  antibioticClassId: string;
  breakPoint: string;
  sdd: string;
  refRangeI: string;
  refRangeS: string;
  refRangeR: string;
  resistant: string;
};

type MicroMappingApiItem = {
  organismId?: number;
  organismName?: string;
  antibioticName?: string;
  antibioticNameId?: number | string;
  antibioticClassName?: string;
  antibioticClassId?: number | string;
  breakPoint?: string;
  sdd?: string;
  refRangeI?: string;
  refRangeS?: string;
  refRangeR?: string;
  resistant?: string | number | boolean;
  isActive?: number;
};

type MicroMappingAddTableItem = {
  organismId?: number | string;
  organismName?: string;
  sdd: string;
  refRangeI: string;
  refRangeS: string;
  refRangeR: string;
  resistant: string;
  antibioticName: string;
  antibioticNameId: number | string;
  antibioticClassName?: string;
  antibioticClassId?: number | string;
  breakPoint: string;
};

type MicroMappingPayloadItem = {
  organismName: string;
  antibioticName: string;
  antibioticNameId: number;
  antibioticClassName: string;
  breakPoint: string;
  sdd: string;
  refRangeI: string;
  refRangeS: string;
  refRangeR: string;
  resistant: string;
};

type MicroMappingUpdatePayload = {
  organismId: number;
  antibioticIdList: string;
  antibioticClassId: number;
  microMappings: MicroMappingPayloadItem[];
};

export type {
  AntibioticGroupItem,
  AntibioticMasterItem,
  CultureItem,
  MicroMappingAddTableItem,
  MicroMappingApiItem,
  MicroMappingTableItem,
  MicroMappingUpdatePayload,
  OrganismGroupItem,
  OrganismMasterItem,
};
