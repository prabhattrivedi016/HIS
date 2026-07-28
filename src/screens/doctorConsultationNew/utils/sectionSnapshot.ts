import { setByPath } from "@/components/dynamicForm/utils/path";
import { resolveGenericAttributeGroupColumns } from "@/config/genericAttributeGroups";
import { SectionHeaderMappingRecord } from "@/screens/emrControls/types";
import { EmrSectionVisitSnapshotEntry } from "@/store/useEmrSectionHistoryStore";

/** same header-controlType normalization EmrSectionRenderer uses to decide how a header renders —
 * shared here too since isCardGroupSection/applySnapshotToSectionData both need to tell a table
 * header apart from a plain one the same way */
export const mapControlType = (controlType: string): string => {
  const key = (controlType || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-_]/g, "");
  if (key.includes("medicine") && key.includes("list")) return "medicineList";
  if (key.includes("rich")) return "richtext";
  if (key.includes("table")) return "table";
  if (key.includes("textarea")) return "textarea";
  if (key.includes("date")) return "date";
  if (key.includes("number")) return "number";
  if (key.includes("currency")) return "currency";
  if (key.includes("check")) return "switch";
  if (key.includes("dropdown") || key.includes("select") || key.includes("combo"))
    return "dropdown";
  if (key.includes("radio")) return "radio";
  if (key.includes("lookup")) return "lookup";
  if (key.includes("image")) return "imageUpload";
  // anything else with a registered generic-attribute-group config (e.g. "Diagnosis",
  // "Procedure") becomes that repeatable-attribute card widget — everything else (including
  // plain "Text Box" or any unrecognized/typo'd control type) safely falls back to plain text,
  // same as before this existed
  if (resolveGenericAttributeGroupColumns(controlType)) return "genericAttributeGroup";
  return "text";
};

/** mirrors EmrSectionRenderer's own isCardGroup check — a section renders as one repeatable
 * card-group control (instead of one control per header) when every header in it is non-table
 * and there's more than one of them */
export const isCardGroupSection = (headers: SectionHeaderMappingRecord[]): boolean =>
  headers.length > 1 &&
  headers.every(
    h =>
      !["table", "medicineList", "genericAttributeGroup", "imageUpload"].includes(
        mapControlType(h.controlType)
      )
  );

/**
 * Applies a past-visit snapshot's values back into the current section's live data blob — the
 * reverse of EmrSectionRenderer's reportedEntries construction. For a card-group section, the
 * snapshot holds one pseudo-entry (headerId 0) whose value is an array of rows keyed by display
 * name (see EmrSectionRenderer's reportedEntries); those get reverse-mapped to header_<id> keys
 * via `headers` before being written to `.group`. For every other section, each entry writes
 * straight to its own header_<id> path, table headers included (their value is already the
 * whole row array the table control expects at that path).
 */
export const applySnapshotToSectionData = (
  data: Record<string, unknown>,
  sectionId: number,
  headers: SectionHeaderMappingRecord[],
  values: EmrSectionVisitSnapshotEntry["values"]
): Record<string, unknown> => {
  if (isCardGroupSection(headers)) {
    const groupValue = values[0]?.value;
    const rows = Array.isArray(groupValue) ? (groupValue as Record<string, unknown>[]) : [];
    const headerIdByLabel = new Map(headers.map(h => [h.displayName || h.headerName, h.headerId]));

    const convertedRows = rows.map(row => {
      const converted: Record<string, unknown> = {};
      Object.entries(row).forEach(([label, val]) => {
        const headerId = headerIdByLabel.get(label);
        if (headerId !== undefined) converted[`header_${headerId}`] = val;
      });
      return converted;
    });

    return setByPath(data, `section_${sectionId}.group`, convertedRows);
  }

  return values.reduce(
    (acc, entry) => setByPath(acc, `section_${sectionId}.header_${entry.headerId}`, entry.value),
    data
  );
};
