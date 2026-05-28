type HistoTemplateMasterItem = {
  id: number;
  typeId: number;
  type: string;
  name: string;
  contentValue: string;
  isActive: number;
  ipAddress: string;
};

type SpecimenMasterItem={
    "id": number,
    "specimenName":string,
    "isActive": number
}

export type { HistoTemplateMasterItem, SpecimenMasterItem };

