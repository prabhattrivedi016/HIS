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

/** one row in a condition rule chain — mirrors a Salesforce Flow "Get Records" filter row
 * (Field / Operator / Value). connector joins this row to the running result of every row
 * before it ("AND"/"OR"); ignored on the first row. headerId points at the OTHER header
 * being checked, e.g. for "B == 3", headerId is B's headerId. */
type SectionConditionalRule = {
  /** the row's real DB id (EMR/getEMRSectionAttributeCondition's "Id") — undefined for a
   * row added in the UI that hasn't been saved yet, so there's nothing to delete on the backend */
  id?: number;
  headerId: number | null;
  operator: "==" | "!=" | "isnull" | "in" | "notin" | "<" | "<=" | ">" | ">=";
  value: string;
  connector: "AND" | "OR";
};

/** one attribute's own visibility rule — e.g. attribute "A" only renders once
 * "B == 3 AND C != test" resolves true (each attribute in a section can have a
 * completely independent rule chain referencing any other attribute in the section) */
type SectionAttributeCondition = {
  targetHeaderId: number;
  conditions: SectionConditionalRule[];
};

/** conditional visibility for an entire EMR Section — one independent rule chain per attribute
 * that needs one; attributes with no entry here always render unconditionally */
type SectionConditionalConfig = {
  attributeConditions: SectionAttributeCondition[];
};

export type {
  EmrSectionItem,
  EmrSectionMappingTableItem,
  MasterHeaderItem,
  SectionAttributeCondition,
  SectionConditionalConfig,
  SectionConditionalRule,
  SectionHeaderMapping,
  SectionHeaderMappingItem,
  SectionHeaderMappingRecord,
  SectionScoreFieldItem,
};
