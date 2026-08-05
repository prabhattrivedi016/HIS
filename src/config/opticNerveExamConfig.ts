/**
 * "Optic Nerve Examination" (ControlTypeId 27) is a single header that renders TWO panels side by
 * side — there's no separate "Optic Disc" header in this EMR to pair it with (unlike the generic
 * "comparisonGrid" shape in comparisonGrids.ts, which needs one header per panel). Kept
 * config-driven the same way as every other grid-shaped control here: this is a rule list matched
 * by header name, so a future second instance of this exact shape needs zero changes to
 * components/dynamicForm/OpticNerveExaminationControl.tsx — just a new rule below.
 */
export interface OpticNerveExamRow {
  key: string;
  label: string;
  /** default "text" — a free-text field per eye. "checkbox" (the right panel's Pallor/
   * Congestion/Elevation) renders a plain checkbox per eye instead. */
  type?: "text" | "checkbox";
  /** groups this row (and any immediately-following rows with the same groupLabel) under a
   * shared section header row rendered once above the first row of the group, e.g. "RIM TO DISC
   * RATIO" / "VERTICAL C:D RATIO" / "NOTES" / "ELEVATION" */
  groupLabel?: string;
}

export interface OpticNerveExamConfig {
  /** left panel — plain text rows, no copy-between-eyes column, an "Additional Notes" box below */
  leftRows: OpticNerveExamRow[];
  /** right panel — checkbox rows WITH the copy-between-eyes column, plus the reference fundus
   * diagram (components/dynamicForm/OpticDiscDiagram.tsx) below it */
  rightRows: OpticNerveExamRow[];
  /** shown in the right panel's leading column header instead of a NORMAL checkbox */
  rightLeadingColumnLabel: string;
}

interface OpticNerveExamRule {
  match: (headerName: string) => boolean;
  config: OpticNerveExamConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const OPTIC_NERVE_EXAM_RULES: OpticNerveExamRule[] = [
  {
    match: headerName =>
      normalize(headerName).includes("optic") && normalize(headerName).includes("nerve"),
    config: {
      leftRows: [
        { key: "inferior", label: "Inferior", groupLabel: "RIM TO DISC RATIO" },
        { key: "superior", label: "Superior", groupLabel: "RIM TO DISC RATIO" },
        { key: "nasal", label: "Nasal", groupLabel: "RIM TO DISC RATIO" },
        { key: "temporal", label: "Temporal", groupLabel: "RIM TO DISC RATIO" },
        { key: "cd", label: "C:D", groupLabel: "VERTICAL C:D RATIO" },
        { key: "notes", label: "Notes", groupLabel: "NOTES" },
      ],
      rightRows: [
        { key: "pallor", label: "Pallor", type: "checkbox" },
        { key: "congestion", label: "Congestion", type: "checkbox" },
        { key: "elevation", label: "Elevation", type: "checkbox", groupLabel: "ELEVATION" },
      ],
      rightLeadingColumnLabel: "OPTIC DISC",
    },
  },
];

export const resolveOpticNerveExamConfig = (headerName: string): OpticNerveExamConfig | undefined =>
  OPTIC_NERVE_EXAM_RULES.find(r => r.match(headerName))?.config;
