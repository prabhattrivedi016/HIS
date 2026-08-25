/** Templates types below — CONFIRMED against the real backend (see src/config/defaults/index.ts's
 * "templates" ENDPOINTS comment block for which endpoints are confirmed vs. still guessed). */

/** a Template Category — the tabs a doctor picks from in the consultation page's Templates
 * picker (e.g. "Assessment", "Scoring", "Examination"). No status/isActive concept on the
 * backend — category master is name-only. */
type TemplateCategoryItem = {
  templateCategoryId: number;
  templateCategoryName: string;
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
  /** 1 = the doctor can fill this template more than once per visit (e.g. repeated dressing
   * rounds), 0 = single-entry only. CONFIRMED against createUpdateEMRTemplateMaster's payload. */
  isMultipleEntryAllow: number;
  /** picklist-driven (GET_PICKLIST_MASTER?fieldName=TemplateApplicableTo) — which context this
   * template applies to. CONFIRMED against createUpdateEMRTemplateMaster's payload; the GET list's
   * response field name is a pattern-matched guess (ApplicableTo) pending confirmation. */
  applicableTo: number;
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

/** UNVERIFIED — Form Builder types below, same status as the Template endpoints: this admin
 * screen doesn't have a confirmed backend yet, see src/config/defaults/index.ts's "form builder"
 * ENDPOINTS comment block. */

type CustomFormFieldType = "text" | "radio" | "dropdown";

/** one field on the canvas — a plain text box, a Present/Absent-style radio group (with an
 * optional adjacent free-text Comments box), or a dropdown */
type CustomFormField = {
  fieldId: number; // 0 = not yet persisted
  fieldType: CustomFormFieldType;
  labelText: string;
  options?: string[]; // radio & dropdown only
  hasComments?: boolean; // radio only
  sequenceNo: number;
};

/** a named group of fields on the canvas (e.g. "KNEE CASE") — local to this one form, not a
 * shared/reusable master like TemplateCategoryItem */
type CustomFormCategory = {
  categoryId: number; // 0 = not yet persisted
  categoryName: string;
  sequenceNo: number;
  fields: CustomFormField[];
};

/** one row in the top-level canvas order — a standalone field or a category with its own nested
 * fields. Both kinds share one sequenceNo space so they can be interleaved at any position. */
type CustomFormBlock =
  | { blockType: "field"; sequenceNo: number; field: CustomFormField }
  | { blockType: "category"; sequenceNo: number; category: CustomFormCategory };

/** a saved Form Builder form — the header record; its blocks come from GET_CUSTOM_FORM_FIELDS */
type CustomFormItem = {
  formId: number;
  formName: string;
  displayName: string;
  isActive: number;
};

export type {
  CustomFormBlock,
  CustomFormCategory,
  CustomFormField,
  CustomFormFieldType,
  CustomFormItem,
  TemplateCategoryItem,
  TemplateItem,
  TemplateMappingTableItem,
  TemplateSectionMapping,
  TemplateSectionMappingItem,
  TemplateSectionMappingRecord,
};
