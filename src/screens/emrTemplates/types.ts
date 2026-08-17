/** UNVERIFIED — Templates types below are pattern-matched against the EMR Section types in
 * src/screens/emrControls/types.ts (see src/config/defaults/index.ts's "templates" ENDPOINTS
 * comment block); not yet confirmed against a real backend contract. */

/** a Template Category — the tabs a doctor picks from in the consultation page's Templates
 * picker (e.g. "Assessment", "Scoring", "Examination") */
type TemplateCategoryItem = {
  templateCategoryId: number;
  categoryName: string;
  isActive: number;
};

/** a named, categorized Template — literally a curated, ordered bundle of existing EMR Sections
 * (not its own header composition) */
type TemplateItem = {
  templateId: number;
  templateName: string;
  displayName: string;
  templateCategoryId: number;
  categoryName: string;
  isActive: number;
};

/** which sections already belong to a template, and in what order — payload shape sent to
 * CREATE_UPDATE_TEMPLATE, mirrors emrControls' SectionHeaderMapping */
type TemplateSectionMapping = {
  sectionId: number;
  sequenceNo: number;
};

/** one row returned by GET_TEMPLATE_SECTION_MAPPING — a section already mapped into a template,
 * mirrors emrControls' SectionHeaderMappingRecord */
type TemplateSectionMappingRecord = {
  mappingId: number;
  templateId: number;
  sectionId: number;
  sectionName: string;
  displayName: string;
  sequenceNo: number;
};

/** one section mapped into a template, with its position — checklist row shape, mirrors
 * emrControls' SectionHeaderMappingItem */
type TemplateSectionMappingItem = {
  sectionId: number;
  sectionName: string;
  displayName: string;
  mappingId: number;
  sequenceNo: number;
};

/** one row returned by GET_TEMPLATE_DEPARTMENT_MAPPING — every active Template, already mapped
 * or not, for a chosen department/doctor. mappingId > 0 means it's mapped. Mirrors emrControls'
 * EmrSectionMappingTableItem. */
type TemplateMappingTableItem = {
  templateId: number;
  templateName: string;
  displayName: string;
  isActive: number;
  mappingId: number;
  sequenceNo: number;
};

export type {
  TemplateCategoryItem,
  TemplateItem,
  TemplateMappingTableItem,
  TemplateSectionMapping,
  TemplateSectionMappingItem,
  TemplateSectionMappingRecord,
};
