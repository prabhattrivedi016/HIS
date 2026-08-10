import { TableColumnSchema } from "@/components/dynamicForm/types";

/**
 * Columns for a header whose ControlType is its own distinct value (e.g. "Diagnosis",
 * "Procedure", "Family History") rather than one of the basic control types — such a header
 * renders as a single self-contained repeatable-attribute card widget (CardGroupControl reused
 * directly, driven by these columns instead of sibling headers) instead of needing a bespoke
 * control built per type. Adding support for a new one is just a new entry here, nothing else
 * changes.
 *
 * Option lists are dummy/fallback data (same reasoning as dummyHeaderLovs.ts) until these are
 * backed by real per-header LOVs.
 */
interface GenericAttributeGroupRule {
  match: (rawControlType: string) => boolean;
  columns: TableColumnSchema[];
  /** which column is this group's "name" (card title / master-entry target) — defaults to
   * columns[0] when unset. Needed when the meaningful field isn't listed first, e.g. Family
   * History's "Condition" column sits after "Relationship" in the intended visual order. */
  nameColumnKey?: string;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const asOptions = (values: string[]) => values.map(v => ({ label: v, value: v }));

const STATUS_OPTIONS = [
  "Preparation",
  "In Progress",
  "Completed",
  "Finished",
  "UnFinished",
  "Cancelled",
  "Resolved",
  "Active",
  "Inactive",
];

const CONDITION_OPTIONS = [
  "Migraine",
  "Hypertension",
  "Type 2 Diabetes",
  "Asthma",
  "Gastritis",
  "Common Cold",
  "Heart Attack",
  "Cancer",
];

const GENERIC_ATTRIBUTE_GROUP_RULES: GenericAttributeGroupRule[] = [
  {
    match: raw => normalize(raw).includes("diagnos"),
    columns: [
      {
        key: "diagnosisType",
        label: "Diagnosis Type",
        dataTypeId: 5,
        options: asOptions(CONDITION_OPTIONS),
      },
      { key: "status", label: "Status", dataTypeId: 5, options: asOptions(STATUS_OPTIONS) },
      { key: "remarks", label: "Remarks", dataTypeId: 4 },
    ],
  },
  {
    match: raw => normalize(raw).includes("procedure"),
    columns: [
      {
        key: "procedure",
        label: "Procedure",
        dataTypeId: 5,
        options: asOptions([
          "Wound Dressing",
          "Suturing",
          "Catheterization",
          "Endoscopy",
          "Biopsy",
          "Nebulization",
        ]),
      },
      { key: "status", label: "Status", dataTypeId: 5, options: asOptions(STATUS_OPTIONS) },
      {
        key: "followUp",
        label: "Follow Up",
        dataTypeId: 5,
        options: asOptions(["None", "1 Week", "2 Weeks", "1 Month", "3 Months"]),
      },
      { key: "date", label: "Date", dataTypeId: 3 },
    ],
  },
  {
    match: raw => normalize(raw).includes("family"),
    nameColumnKey: "condition",
    columns: [
      {
        key: "relationship",
        label: "Relationship",
        dataTypeId: 5,
        options: asOptions([
          "Father",
          "Mother",
          "Brother",
          "Sister",
          "Grandfather",
          "Grandmother",
          "Son",
          "Daughter",
        ]),
      },
      { key: "sex", label: "Sex", dataTypeId: 5, options: asOptions(["Male", "Female", "Other"]) },
      { key: "status", label: "Status", dataTypeId: 5, options: asOptions(STATUS_OPTIONS) },
      { key: "date", label: "Date", dataTypeId: 3 },
      {
        key: "condition",
        label: "Condition",
        dataTypeId: 5,
        options: asOptions(CONDITION_OPTIONS),
      },
      { key: "conditionText", label: "Condition Text", dataTypeId: 1 },
      { key: "onsetAge", label: "Onset Age (yrs)", dataTypeId: 2 },
      {
        key: "contributedToDeath",
        label: "Contributed to Death?",
        dataTypeId: 5,
        options: asOptions(["No", "Yes", "Unknown"]),
      },
    ],
  },
];

const resolveGenericAttributeGroup = (
  rawControlType: string
): GenericAttributeGroupRule | undefined =>
  GENERIC_ATTRIBUTE_GROUP_RULES.find(r => r.match(rawControlType));

export const resolveGenericAttributeGroupColumns = (
  rawControlType: string
): TableColumnSchema[] | undefined => resolveGenericAttributeGroup(rawControlType)?.columns;

export const resolveGenericAttributeGroupNameColumnKey = (
  rawControlType: string
): string | undefined => resolveGenericAttributeGroup(rawControlType)?.nameColumnKey;
