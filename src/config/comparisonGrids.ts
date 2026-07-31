export interface ComparisonGridRow {
  key: string;
  label: string;
}

export interface ComparisonGridConfig {
  rows: ComparisonGridRow[];
  notesEnabled?: boolean;
  /** this header's starting state, e.g. Adnexa Examination ships pre-checked with "Within Normal
   * Limit" already in the notes box — only used until the doctor actually changes something */
  defaultAllNormal?: boolean;
  defaultNotes?: string;
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
];

export const resolveComparisonGridConfig = (headerName: string): ComparisonGridConfig | undefined =>
  COMPARISON_GRID_RULES.find(r => r.match(headerName))?.config;
