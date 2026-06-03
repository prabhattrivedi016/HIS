type ListOfLovsItem = {
  value: string;
  dataTypeId: number;
};

type HeaderMasterItem = {
  headerId: number;
  headerName: string;
  displayName: string;
  controlType: string;
  controlTypeId: number;
  isPrint: number;
  isShowInTempRoom: number;
  usedForPatientType: number;
  usedForPatientTypeName: string;
  isActive: number;
};

export type { HeaderMasterItem, ListOfLovsItem };
