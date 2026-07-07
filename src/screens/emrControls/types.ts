/** a header from the Consultation Header Master catalog (Admin/getAllDoctorHeaderMaster), available to add into a section */
type MasterHeaderItem = {
  headerId: number;
  headerName: string;
  displayName: string;
  controlType: string;
  controlTypeId: number;
  isPrint: number;
  isShowInTempRoom: number;
  usedForPatientType: number;
  usedForPatientTypeName: string;
  isMandatory: number;
  isActive: number;
};

/** which headers already belong to a section, and in what order — separate from the catalog itself */
type SectionHeaderMapping = {
  headerId: number;
  sequenceNo: number;
};

/** one row returned by EMR/getEMRSectionHeaderMapping — a header already mapped into a section */
type SectionHeaderMappingRecord = {
  mappingId: number;
  sectionId: number;
  headerId: number;
  headerName: string;
  displayName: string;
  controlType: string;
  controlTypeId: number;
  sequenceNo: number;
};

/** one header mapped into a section, with its position within that section */
type SectionHeaderMappingItem = {
  headerId: number;
  headerName: string;
  displayName: string;
  controlType: string;
  mappingId: number;
  sequenceNo: number;
};

type EmrSectionItem = {
  sectionId: number;
  sectionName: string;
  displayName: string;
  isActive: number;
};

/** one row returned by EMR/getEMRSectionMappingForMaster — every active EMR Section,
 * already mapped or not, for a chosen department/doctor. mappingId > 0 means it's mapped */
type EmrSectionMappingTableItem = {
  sectionId: number;
  sectionName: string;
  displayName: string;
  isActive: number;
  mappingId: number;
  sequenceNo: number;
};

/** one field participating in a section's score formula (e.g. Braden Scale sub-scores + Total) */
type SectionScoreFieldItem = {
  headerId: number;
  headerName: string;
  referenceName: string;
  formulaDefinition: string;
};

export type {
  EmrSectionItem,
  EmrSectionMappingTableItem,
  MasterHeaderItem,
  SectionHeaderMapping,
  SectionHeaderMappingItem,
  SectionHeaderMappingRecord,
  SectionScoreFieldItem,
};
