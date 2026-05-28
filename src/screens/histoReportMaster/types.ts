type HistoTemplateMasterItem = {
  id: number;
  typeId: number;
  type: string;
  name: string;
  contentValue: string;
  isActive: number;
  ipAddress: string;
};

type SpecimenMasterItem = {
  id: number;
  specimenName: string;
  isActive: number;
};
type HistoPendingReasonMasterItem = {
  id: number;
  pendingReason: string;
  isActive: number;
};

type HistoImmunoAntibioticMasterItem = {
  id: number;
  antibioticName: string;
  isActive: number;
};

export type {
  HistoImmunoAntibioticMasterItem,
  HistoPendingReasonMasterItem,
  HistoTemplateMasterItem,
  SpecimenMasterItem,
};
