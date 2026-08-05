/**
 * A handful of EMR sections (Pain Assessment being the first) mix a few different simple control
 * types (an EmojiScore picker, plain text fields, inline checkbox-list groups, a closing notes
 * box) and want them laid out as one dense "label-left, field-right" form instead of the generic
 * one-card-per-header grid every other section uses. This is purely a LAYOUT choice — the
 * underlying data still lives at the exact same `section_X.header_Y` paths a normal section would
 * use, so history/snapshot/progress-tracking all keep working unmodified.
 *
 * Config-driven the same way as every other grid-shaped control here: a rule list matched by
 * SECTION name (not header name, since this describes the whole section's layout). Add a new rule
 * for any future section that wants this same dense layout — nothing in
 * components/dynamicForm/CompactFormGroupControl.tsx needs to change.
 */
export interface CompactFormRowPairRule {
  /** matches a header name that should share one row with the OTHER header matching a rule with
   * the same pairKey, instead of getting its own full-width row */
  match: (headerName: string) => boolean;
  pairKey: string;
}

export interface CompactFormSectionConfig {
  rowPairRules?: CompactFormRowPairRule[];
}

interface CompactFormSectionRule {
  match: (sectionName: string) => boolean;
  config: CompactFormSectionConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const COMPACT_FORM_SECTION_RULES: CompactFormSectionRule[] = [
  {
    match: sectionName =>
      normalize(sectionName).includes("pain") && normalize(sectionName).includes("assessment"),
    config: {
      rowPairRules: [
        // "Pain is worse" (not to be confused with "Pain feels worse when", which also contains
        // "pain"+"worse" — "is worse" is the distinguishing substring) pairs with "Onset of Pain"
        { match: h => normalize(h).includes("is worse"), pairKey: "worse-onset" },
        { match: h => normalize(h).includes("onset"), pairKey: "worse-onset" },
      ],
    },
  },
];

export const resolveCompactFormSectionConfig = (
  sectionName: string
): CompactFormSectionConfig | undefined =>
  COMPACT_FORM_SECTION_RULES.find(r => r.match(sectionName))?.config;
