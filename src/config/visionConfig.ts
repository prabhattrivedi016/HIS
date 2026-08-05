import { DISTANCE_ACUITY_OPTIONS, NEAR_ACUITY_OPTIONS } from "./visualAcuityScales";

/**
 * "Vision" is a single header that renders a RIGHT/LEFT pair of Distance/Near × Unaided/Pinhole/
 * Aided visual-acuity tables — there's no separate "Right"/"Left" header to pair, same reasoning
 * as opticNerveExamConfig.ts. Config-driven so a future differently-labeled instance (or a
 * revised acuity scale) needs zero changes to components/dynamicForm/VisionControl.tsx.
 */
export interface VisionConfig {
  /** shared by the Distance row's Unaided/Pinhole/Aided columns, both eyes */
  distanceOptions: string[];
  /** shared by the Near row's Unaided/Pinhole/Aided columns, both eyes */
  nearOptions: string[];
}

interface VisionRule {
  match: (headerName: string) => boolean;
  config: VisionConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const VISION_RULES: VisionRule[] = [
  {
    match: headerName => normalize(headerName).includes("vision"),
    config: {
      distanceOptions: DISTANCE_ACUITY_OPTIONS,
      nearOptions: NEAR_ACUITY_OPTIONS,
    },
  },
];

export const resolveVisionConfig = (headerName: string): VisionConfig | undefined =>
  VISION_RULES.find(r => r.match(headerName))?.config;
