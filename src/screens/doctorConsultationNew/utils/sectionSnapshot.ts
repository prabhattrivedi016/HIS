import { setByPath } from "@/components/dynamicForm/utils/path";
import { resolveCompactFormSectionConfig } from "@/config/compactFormSections";
import { resolveGenericAttributeGroupColumns } from "@/config/genericAttributeGroups";
import { SectionHeaderMappingRecord } from "@/screens/emrControls/types";
import { PatientVisitHistoryEntry } from "../hooks/usePatientVisitHistory";
import { EmrSectionVisitSnapshotEntry } from "../types";

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
  if (key.includes("check") && key.includes("list")) return "checkbox-list";
  if (key.includes("check")) return "switch";
  if (key.includes("radio") && key.includes("score")) return "radioScore";
  if (key.includes("radio")) return "radio";
  if (key.includes("dropdown") || key.includes("select") || key.includes("combo"))
    return "dropdown";
  if (key.includes("emoji") && key.includes("score")) return "emojiScore";
  if (key.includes("lookup")) return "lookup";
  if (key.includes("image")) return "imageUpload";
  if (key.includes("treatment") && key.includes("objective")) return "treatmentObjectives";
  if (key.includes("dental") && key.includes("treatment") && key.includes("type"))
    return "dentalTreatmentType";
  if (key.includes("dental")) return "dentalChart";
  if (key.includes("multilevel")) return "multiLevelInputGrid";
  if (key.includes("comparison")) return "comparisonGrid";
  if (key.includes("optic") && key.includes("nerve")) return "opticNerveExam";
  if (key.includes("optic") && key.includes("disc")) return "comparisonGrid";
  if (key.includes("visual") && key.includes("field")) return "comparisonGrid";
  if (key.includes("macula")) return "comparisonGrid";
  if (key.includes("gonioscopy")) return "gonioscopy";
  if (key.includes("intraocular") && key.includes("pressure")) return "intraOcularPressure";
  if (key.includes("iop")) return "intraOcularPressure";
  if (key.includes("vision")) return "vision";
  if (key.includes("frame") && key.includes("detail")) return "frameDetails";

  if (key.includes("eye") && key.includes("refraction")) return "eyeRefraction";

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
        "radio",
        "gonioscopy",
        "opticNerveExam",
        "intraOcularPressure",
        "emojiScore",
        "vision",
        "frameDetails",
        "eyeRefraction",
        "treatmentObjectives",
        "dentalTreatmentType",
      ].includes(mapControlType(h.controlType))
  );

// a plain "Radio" header (mapControlType -> "radio", distinct from "Radio Score" -> "radioScore")
// is otherwise a single standalone question (renders via RadioControl) — but a SECTION of several
// of them (e.g. "Bite analysis": Overjet/Overbite/Crossbite/... each graded None-Severe) is the
// same "themed set of graded rows" pattern radioScore sections already use, so 2+ "radio" headers
// group the same way instead of falling through to isCardGroupSection's repeatable-row grid. A
// lone "radio" header (length 1) is unaffected — that's still just one independent question.
export const isRadioScoreGroupSection = (headers: SectionHeaderMappingRecord[]): boolean => {
  if (headers.length === 0) return false;
  const types = headers.map(h => mapControlType(h.controlType));
  if (headers.length === 1) return types[0] === "radioScore";
  return types.every(t => t === "radioScore" || t === "radio");
};

export const isCompactFormGroupSection = (
  sectionName: string,
  headers: SectionHeaderMappingRecord[]
): boolean => headers.length > 1 && Boolean(resolveCompactFormSectionConfig(sectionName));

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

/** turns one section's raw rows from usePatientVisitHistory's getSectionRows(sectionId) into
 * display-ready snapshots — resolves each row's HeaderId to a real headerName/controlType via this
 * section's own header mapping (the raw API rows carry neither), and JSON.parses HeaderValue the
 * same way ConsultationEmrSections does for the current visit */
export const buildVisitSnapshots = (
  sectionId: number,
  sectionRows: PatientVisitHistoryEntry[],
  headers: SectionHeaderMappingRecord[]
): EmrSectionVisitSnapshotEntry[] => {
  const headerNameById = new Map(headers.map(h => [h.headerId, h.displayName || h.headerName]));
  const controlTypeById = new Map(headers.map(h => [h.headerId, h.controlType]));

  return sectionRows.map(entry => ({
    id: `${entry.visitId}-${sectionId}`,
    visitId: entry.visitId,
    doctorId: entry.doctorId,
    doctorName: entry.doctorName,
    recordedOn: entry.recordedOn,
    values: entry.rows
      .filter(r => headerNameById.has(r.HeaderId))
      .map(r => {
        let value: unknown;
        try {
          value = JSON.parse(r.HeaderValue);
        } catch {
          value = r.HeaderValue;
        }
        return {
          headerId: r.HeaderId,
          headerName: headerNameById.get(r.HeaderId) ?? "",
          controlType: controlTypeById.get(r.HeaderId) ?? "",
          value,
        };
      }),
  }));
};

export const isEmptyValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

export const pruneEmptyValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(pruneEmptyValue).filter(v => !isEmptyValue(v));
  }
  if (value !== null && typeof value === "object") {
    const pruned: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, raw]) => {
      const prunedValue = pruneEmptyValue(raw);
      if (!isEmptyValue(prunedValue)) pruned[key] = prunedValue;
    });
    return pruned;
  }
  return value;
};
