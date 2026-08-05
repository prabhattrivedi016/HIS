/**
 * A "Comparison Grid" control (mapControlType in sectionSnapshot.ts routes any header whose
 * ControlType contains "Comparison" to this) renders a fixed set of rows — each with a Right Eye
 * field, a Left Eye field, and a quick copy-across-eyes shortcut between them — plus a header
 * "NORMAL" bulk-fill checkbox and an optional free-text notes box below. Unlike a table/multi-level
 * grid, rows aren't user-added — the row list itself is the config.
 *
 * Since the control type is shared across many differently-shaped comparisons (same reasoning as
 * "Table"/"Multi Level Input Grid"), the header's own name is what picks its shape here — adding
 * a new one (any other X-vs-Y eye comparison) is just a new rule below, nothing in
 * ComparisonGridControl changes. To add a brand-new ROW TYPE (beyond text/lensCataract/checkbox),
 * add the union member here and its rendering case in ComparisonGridControl.tsx's renderEyeField.
 */
export interface ComparisonGridRow {
  key: string;
  label: string;
  /** default "text" — a single free-text field per eye.
   * "lensCataract" (Basic Eye Examination's Lens row) renders two cataract-grade dropdowns plus a
   * free-text detail field per eye instead.
   * "checkbox" (Optic Disc's Pallor/Congestion/Elevation) renders a plain checkbox per eye instead
   * of a text field. */
  type?: "text" | "lensCataract" | "checkbox";
  /** shared option list for both dropdowns on a "lensCataract" row */
  options?: string[];
  /** groups this row (and any immediately-following rows with the same groupLabel) under a shared
   * section header row rendered once above the first row of the group, e.g. "RIM TO DISC RATIO" /
   * "VERTICAL C:D RATIO" / "NOTES" (Optic Nerve Examination). Rows without a groupLabel render
   * with no group header at all. */
  groupLabel?: string;
}

export interface ComparisonGridConfig {
  rows: ComparisonGridRow[];
  notesEnabled?: boolean;
  /** this header's starting state, e.g. Adnexa Examination ships pre-checked with "Within Normal
   * Limit" already in the notes box — only used until the doctor actually changes something */
  defaultAllNormal?: boolean;
  defaultNotes?: string;
  /** default true. Some grids (Optic Nerve Examination's two panels) have no "mark everything
   * normal" concept at all — set false to hide that header checkbox */
  normalCheckboxEnabled?: boolean;
  /** default true — hides the "< = >" copy-between-eyes column entirely (and its table-head
   * spacer cell) for grids that don't need it, e.g. the plain Optic Nerve Examination text panel */
  showCompareColumn?: boolean;
  /** shown in the header's leading column instead of the NORMAL checkbox — only used when
   * normalCheckboxEnabled is false, e.g. "OPTIC DISC" */
  leadingColumnLabel?: string;
  /** shows a simple reference diagram (one per eye) below the table — currently only "opticDisc"
   * is defined in components/dynamicForm/OpticDiscDiagram.tsx; add a new key + matching case
   * there for a different diagram */
  referenceDiagram?: "opticDisc";
  /** shows the "Empty Slot" report tabs + an upload dropzone alongside the table (Visual Field
   * Analysis, ONH OCT, Macula OCT all use this) — how many slots to start with */
  reportSlotCount?: number;
}

interface ComparisonGridRule {
  match: (headerName: string) => boolean;
  config: ComparisonGridConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const COMPARISON_GRID_RULES: ComparisonGridRule[] = [
  {
    match: headerName => normalize(headerName).includes("fundus"),
    config: {
      rows: [
        { key: "media", label: "Media" },
        { key: "disc", label: "Disc (ONH)" },
        { key: "bloodVessels", label: "Blood Vessels" },
        { key: "macula", label: "Macula" },
        { key: "midperiphery", label: "Midperiphery" },
        { key: "periphery", label: "Periphery" },
      ],
    },
  },
  {
    match: headerName => normalize(headerName).includes("pupil"),
    config: {
      rows: [
        { key: "shape", label: "Shape" },
        { key: "reaction", label: "Reaction" },
        { key: "dilatation", label: "Dilatation" },
        { key: "rapd", label: "RAPD" },
      ],
    },
  },
  {
    // matches both the correct spelling and the common "conjuctiva"/"conjuctive" typo — both
    // share this prefix before diverging
    match: headerName => normalize(headerName).includes("conju"),
    config: {
      rows: [
        { key: "upperTarsalConjunctiva", label: "Upper Tarsal Conjunctiva" },
        { key: "bulbarConjunctiva", label: "Bulbar Conjunctiva" },
        { key: "lowerTarsalConjunctiva", label: "Lower Tarsal Conjunctiva" },
      ],
    },
  },
  {
    match: headerName => normalize(headerName).includes("cornea"),
    config: {
      rows: [
        { key: "epithelium", label: "Epithelium" },
        { key: "superficialStroma", label: "Superficial Stroma" },
        { key: "deepStroma", label: "Deep Stroma" },
        { key: "endothelium", label: "Endothelium" },
        { key: "limbus", label: "Limbus" },
      ],
    },
  },
  {
    match: headerName =>
      normalize(headerName).includes("basic") && normalize(headerName).includes("eye"),
    config: {
      rows: [
        { key: "lidMargin", label: "Lid Margine" },
        { key: "conjunctiva", label: "Conjunctiva" },
        { key: "limbus", label: "Limbus" },
        { key: "cornea", label: "Cornea" },
        { key: "anteriorChamber", label: "Anterior Chamber" },
        { key: "iris", label: "Iris" },
        { key: "pupil", label: "Pupil" },
        {
          key: "lens",
          label: "Lens",
          type: "lensCataract",
          options: [
            "NS Grade 1",
            "NS Grade 2",
            "NS Grade 3",
            "NS Grade 4",
            "Total Cataract Brown",
            "Total Cataract White",
            "Equatorial Cataract",
            "Cortical Spokes",
            "PSC Grade 1",
            "PSC Grade 2",
            "PSC Grade 3",
            "PSC Grade 4",
            "Posterior Polar Cataract",
            "Early Vacuolations",
            "Early Lenticular Changes",
            "AC Cataract",
            "Pseudophakia",
            "Aphakia",
            "Ac Catract",
            "PSC Grade 4",
            "PSV",
          ],
        },
        { key: "fundus", label: "Fundus" },
      ],
    },
  },
  {
    match: headerName => normalize(headerName).includes("adnexa"),
    config: {
      rows: [
        { key: "brow", label: "Brow" },
        { key: "eyeLids", label: "Eye Lids" },
        { key: "earLids", label: "Ear Lids" },
      ],
      defaultAllNormal: true,
      defaultNotes: "Within Normal Limit",
    },
  },
  {
    // the Pallor/Congestion/Elevation checkbox panel + the two reference fundus diagrams — only
    // matches if a header literally named "Optic Disc" is ever added as its own separate header.
    // Today "Optic Nerve Examination" (ControlTypeId 27) is the only header for this exam and
    // renders BOTH panels itself — see components/dynamicForm/OpticNerveExaminationControl.tsx +
    // config/opticNerveExamConfig.ts — this rule is kept for that future possibility only.
    match: headerName =>
      normalize(headerName).includes("optic") && normalize(headerName).includes("disc"),
    config: {
      rows: [
        { key: "pallor", label: "Pallor", type: "checkbox" },
        { key: "congestion", label: "Congestion", type: "checkbox" },
        { key: "elevation", label: "Elevation", type: "checkbox", groupLabel: "ELEVATION" },
      ],
      normalCheckboxEnabled: false,
      leadingColumnLabel: "OPTIC DISC",
      referenceDiagram: "opticDisc",
      notesEnabled: false,
    },
  },
  {
    match: headerName =>
      normalize(headerName).includes("visual") && normalize(headerName).includes("field"),
    config: {
      rows: [{ key: "value", label: "" }],
      normalCheckboxEnabled: false,
      reportSlotCount: 4,
    },
  },
  {
    match: headerName => normalize(headerName).includes("macula"),
    config: {
      rows: [
        { key: "vitreous", label: "Vitreous" },
        { key: "anteriorRetina", label: "Anterior Retina" },
        { key: "posteriorRetina", label: "Posterior Retina" },
        { key: "subRetinalSpace", label: "Sub-Retinal Space" },
        { key: "rpe", label: "RPE" },
        { key: "choroid", label: "Choroid" },
        { key: "notes", label: "Notes" },
      ],
      reportSlotCount: 4,
    },
  },
];

export const resolveComparisonGridConfig = (headerName: string): ComparisonGridConfig | undefined =>
  COMPARISON_GRID_RULES.find(r => r.match(headerName))?.config;
