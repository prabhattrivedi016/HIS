/**
 * "Treatment Objectives" is a single header rendering a multi-select tile grid (pick any number
 * of predefined objectives) plus a "+ New Objective" affordance for adding a custom one on the
 * fly. Config-driven so the starting objective list can change without touching
 * components/dynamicForm/TreatmentObjectivesControl.tsx.
 */
export interface TreatmentObjectiveOption {
  key: string;
  title: string;
  description: string;
}

export interface TreatmentObjectivesConfig {
  defaultObjectives: TreatmentObjectiveOption[];
}

interface TreatmentObjectivesRule {
  match: (headerName: string) => boolean;
  config: TreatmentObjectivesConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const TREATMENT_OBJECTIVES_RULES: TreatmentObjectivesRule[] = [
  {
    match: headerName =>
      normalize(headerName).includes("treatment") && normalize(headerName).includes("objective"),
    config: {
      defaultObjectives: [
        {
          key: "resolveCrowding",
          title: "Resolve crowding",
          description: "Create space / relieve crowding",
        },
        {
          key: "correctOverjet",
          title: "Correct overjet",
          description: "Reduce horizontal overlap",
        },
        {
          key: "correctDeepBite",
          title: "Correct deep bite",
          description: "Reduce vertical overlap",
        },
        { key: "closeSpacing", title: "Close spacing", description: "Close diastema / spaces" },
        {
          key: "improveMidline",
          title: "Improve midline",
          description: "Align upper & lower midline",
        },
        {
          key: "correctCrossbite",
          title: "Correct crossbite",
          description: "Anterior / posterior correction",
        },
        { key: "levelAlign", title: "Level & align", description: "Level curve of Spee" },
        {
          key: "improveSmileAesthetics",
          title: "Improve smile aesthetics",
          description: "Smile arc & display",
        },
        {
          key: "correctOpenBite",
          title: "Correct open bite",
          description: "Establish anterior contact",
        },
        { key: "retractIncisors", title: "Retract incisors", description: "Reduce proclination" },
      ],
    },
  },
];

export const resolveTreatmentObjectivesConfig = (
  headerName: string
): TreatmentObjectivesConfig | undefined =>
  TREATMENT_OBJECTIVES_RULES.find(r => r.match(headerName))?.config;
