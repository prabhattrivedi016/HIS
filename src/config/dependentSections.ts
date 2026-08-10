/**
 * A "dependent section" is a whole EMR section that (a) never gets its own nav pill in
 * ConsultationEmrSections, and (b) only renders — inline, right after the section containing its
 * trigger header — once the doctor has picked the matching option there. First use case: picking
 * a "Dental Treatment Type" tile (e.g. "Fixed braces") reveals a section literally named
 * "Treatment plan for Fixed braces" right below it; the other 5 treatment-type-specific plan
 * sections stay hidden until their own tile is picked.
 *
 * Purely a naming convention, not a hardcoded per-option list — adding a 6th/7th/Nth treatment
 * type (a new LOV option in Header Master + a new section named "Treatment plan for <that
 * option's exact label>") needs zero code changes here or in ConsultationEmrSections.tsx.
 */
export interface DependentSectionRule {
  /** the header whose selected value decides which dependent section (if any) is visible, e.g.
   * "Dental Treatment Type" */
  matchTriggerHeader: (headerName: string) => boolean;
  /** true for ANY section belonging to this dependent family, regardless of current selection —
   * used to hide them all from the nav pill list up front */
  isDependentSection: (sectionName: string) => boolean;
  /** given a candidate dependent section's name and the trigger header's current value, should
   * this section be the one shown right now? */
  matchesValue: (sectionName: string, triggerValue: string) => boolean;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const DEPENDENT_SECTION_RULES: DependentSectionRule[] = [
  {
    matchTriggerHeader: headerName =>
      normalize(headerName).includes("dental") &&
      normalize(headerName).includes("treatment") &&
      normalize(headerName).includes("type"),
    isDependentSection: sectionName => normalize(sectionName).startsWith("treatment plan for"),
    matchesValue: (sectionName, triggerValue) =>
      normalize(sectionName) === normalize(`Treatment plan for ${triggerValue}`),
  },
];

export const isTriggerHeaderName = (headerName: string): boolean =>
  DEPENDENT_SECTION_RULES.some(r => r.matchTriggerHeader(headerName));

export const isDependentSectionName = (sectionName: string): boolean =>
  DEPENDENT_SECTION_RULES.some(r => r.isDependentSection(sectionName));

/** given a candidate dependent section's name and the trigger header's current value, should this
 * section be the one visible right now? Always false when triggerValue is empty/undefined. */
export const matchesDependentSectionValue = (sectionName: string, triggerValue: string): boolean =>
  DEPENDENT_SECTION_RULES.some(r => r.matchesValue(sectionName, triggerValue));
