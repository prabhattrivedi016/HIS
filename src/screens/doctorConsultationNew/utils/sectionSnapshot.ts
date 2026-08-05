import { setByPath } from "@/components/dynamicForm/utils/path";
import { resolveCompactFormSectionConfig } from "@/config/compactFormSections";
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
  // "Check-Box List" (multiple selectable options, driven by this header's List Of Values) is
  // distinct from a plain "Check Box" (one on/off toggle) — must come before the generic "check"
  // rule below, since both contain that substring
  if (key.includes("check") && key.includes("list")) return "checkbox-list";
  if (key.includes("check")) return "switch";
  if (key.includes("dropdown") || key.includes("select") || key.includes("combo"))
    return "dropdown";
  // "Radio With Score" (each option carries its own integer score, e.g. NIPS/APGAR-style scored
  // assessments) is distinct from a plain "Radio" — must come first, since both contain "radio"
  if (key.includes("radio") && key.includes("score")) return "radioScore";
  if (key.includes("radio")) return "radio";
  // "EmojiScore" (each option carries an image + score, e.g. a Wong-Baker pain-face scale) —
  // options come back from GET_DOCTOR_HEARDER_LOVS with a base64Data image alongside value/score
  if (key.includes("emoji") && key.includes("score")) return "emojiScore";
  if (key.includes("lookup")) return "lookup";
  if (key.includes("image")) return "imageUpload";
  if (key.includes("dental")) return "dentalChart";
  if (key.includes("multilevel")) return "multiLevelInputGrid";
  if (key.includes("comparison")) return "comparisonGrid";
  // some comparison-grid-shaped headers ship with their own uniquely-named ControlType instead of
  // the generic "Comparison Grid" (same reasoning as "Radio With Score" above) — route those here
  // too. Add a new line like these for any future one-off comparison-grid ControlType name.
  // "Optic Nerve Examination" (ControlTypeId 27) is its own dedicated two-panel control (see
  // opticNerveExamConfig.ts) — it's the only header for this exam, there's no separate "Optic
  // Disc" header to pair it with, so it can't reuse the plain single-table comparisonGrid shape.
  if (key.includes("optic") && key.includes("nerve")) return "opticNerveExam";
  if (key.includes("optic") && key.includes("disc")) return "comparisonGrid";
  if (key.includes("visual") && key.includes("field")) return "comparisonGrid";
  if (key.includes("macula")) return "comparisonGrid";
  if (key.includes("gonioscopy")) return "gonioscopy";
  // "Intra Ocular Pressure" logs repeated dated readings over time (a trend chart), not a fixed
  // row list — see config/intraOcularPressureConfig.ts
  if (key.includes("intraocular") && key.includes("pressure")) return "intraOcularPressure";
  if (key.includes("iop")) return "intraOcularPressure";
  // "Vision" is its own dedicated Right/Left visual-acuity control — see config/visionConfig.ts
  if (key.includes("vision")) return "vision";
  // "Frame Details" (spectacle fitting) — see config/frameDetailsConfig.ts
  if (key.includes("frame") && key.includes("detail")) return "frameDetails";
  // "Eye Refraction" (Objective/Subjective refraction grids) — a SEPARATE header from "Frame
  // Details" even though both live under the same "Eye Refraction" section — see
  // config/eyeRefractionConfig.ts
  if (key.includes("eye") && key.includes("refraction")) return "eyeRefraction";
  // anything else with a registered generic-attribute-group config (e.g. "Diagnosis",
  // "Procedure") becomes that repeatable-attribute card widget — everything else (including
  // plain "Text Box" or any unrecognized/typo'd control type) safely falls back to plain text,
  // same as before this existed
  if (resolveGenericAttributeGroupColumns(controlType)) return "genericAttributeGroup";
  return "text";
};

export const isCardGroupSection = (headers: SectionHeaderMappingRecord[]): boolean =>
  headers.length > 1 &&
  headers.every(
    h =>
      ![
        "table",
        "medicineList",
        "genericAttributeGroup",
        "imageUpload",
        "dentalChart",
        "multiLevelInputGrid",
        "comparisonGrid",
        "radioScore",
        "gonioscopy",
        "opticNerveExam",
        "intraOcularPressure",
        "emojiScore",
        "vision",
        "frameDetails",
        "eyeRefraction",
      ].includes(mapControlType(h.controlType))
  );

/**
 * A section made entirely of "Radio With Score" headers (e.g. NIPS Score: Facial Expression /
 * Cry / Breathing patterns / Arms / Legs / State of arousal, each its own scored-radio header)
 * renders as ONE combined scored-assessment control instead of one control per header — same
 * architectural slot as isCardGroupSection, just for this specific shape. A new scored assessment
 * (APGAR, any other X/Y-point scale) needs zero code changes: create the section, add headers to
 * it with ControlType "Radio With Score" and their option/score rows via Header Master, done.
 */
export const isRadioScoreGroupSection = (headers: SectionHeaderMappingRecord[]): boolean =>
  headers.length > 0 && headers.every(h => mapControlType(h.controlType) === "radioScore");

/**
 * A section whose NAME matches a config/compactFormSections.ts rule (Pain Assessment being the
 * first) renders as one dense "label-left, field-right" layout instead of the generic
 * one-card-per-header grid — purely a layout choice, same underlying `section_X.header_Y` storage
 * as a normal section, so it's independent of isCardGroupSection/isRadioScoreGroupSection above.
 */
export const isCompactFormGroupSection = (
  sectionName: string,
  headers: SectionHeaderMappingRecord[]
): boolean => headers.length > 1 && Boolean(resolveCompactFormSectionConfig(sectionName));

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

  if (isRadioScoreGroupSection(headers)) {
    return values.reduce(
      (acc, entry) =>
        setByPath(
          acc,
          `section_${sectionId}.radioScoreGroup.header_${entry.headerId}`,
          entry.value
        ),
      data
    );
  }

  return values.reduce(
    (acc, entry) => setByPath(acc, `section_${sectionId}.header_${entry.headerId}`, entry.value),
    data
  );
};
