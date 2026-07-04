/** one named sub-field belonging to a header, e.g. "Substance" (Dropdown) or "Allergies Notes" (Text Box) */
type EmrControlField = {
  fieldId: number;
  fieldName: string;
  controlTypeId: number;
  controlType: string;
  options: string[];
  sequenceNo: number;
};

type EmrControlItem = {
  headerId: number;
  headerName: string;
  displayName: string;
  fields: EmrControlField[];
  isPrint: number;
  isShowInTempRoom: number;
  usedForPatientType: number;
  usedForPatientTypeName: string;
  isActive: number;
};

export type { EmrControlField, EmrControlItem };
