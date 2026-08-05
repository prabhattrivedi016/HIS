import {
  MATERIAL_OPTIONS,
  TREATMENT_OPTIONS,
  TYPE_OPTIONS,
  USAGE_OPTIONS,
} from "./frameFittingOptions";
import { DISTANCE_ACUITY_OPTIONS, NEAR_ACUITY_OPTIONS } from "./visualAcuityScales";

/**
 * "Eye Refraction" is a single header that renders the Objective (Undilated + Dilated SPH/CYL/
 * AXIS readings), Subjective (glass prescription + visual acuity), AND Frame Details (I.P.D./RI/
 * Sides/Bridge + Material + Usage/Type/Treatment + Notes) all as one control — there's no
 * separate "Frame Details" header in this EMR, everything ships under this single header. Same
 * "one header, custom internal layout" shape as opticNerveExamConfig.ts/visionConfig.ts. The
 * SPH/CYL/AXIS scales are generated ranges rather than hand-typed arrays; Visual Acuity reuses
 * the exact same Distance/Near scales Vision uses (visualAcuityScales.ts), and the Frame Details
 * option lists reuse frameFittingOptions.ts (shared with the currently-unused standalone
 * frameDetailsConfig.ts, in case a truly separate "Frame Details" header is ever added). Config-
 * driven so a future revised scale needs zero changes to
 * components/dynamicForm/EyeRefractionControl.tsx.
 */
export interface EyeRefractionConfig {
  sphOptions: string[];
  cylOptions: string[];
  axisOptions: string[];
  distanceAcuityOptions: string[];
  nearAcuityOptions: string[];
  materialOptions: string[];
  usageOptions: string[];
  typeOptions: string[];
  treatmentOptions: string[];
}

const formatPower = (v: number) => {
  const rounded = Math.round(v * 100) / 100;
  return rounded > 0 ? `+${rounded.toFixed(2)}` : rounded.toFixed(2);
};

const buildPowerRange = (min: number, max: number, step: number): string[] => {
  const values: string[] = [];
  for (let v = min; v <= max + 1e-9; v += step) values.push(formatPower(v));
  return values;
};

const buildAxisRange = (): string[] => Array.from({ length: 180 }, (_, i) => String(i + 1));

const SPH_OPTIONS = buildPowerRange(-20, 20, 0.25);
const CYL_OPTIONS = buildPowerRange(-6, 6, 0.25);
const AXIS_OPTIONS = buildAxisRange();

interface EyeRefractionRule {
  match: (headerName: string) => boolean;
  config: EyeRefractionConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const EYE_REFRACTION_RULES: EyeRefractionRule[] = [
  {
    match: headerName =>
      normalize(headerName).includes("eye") && normalize(headerName).includes("refraction"),
    config: {
      sphOptions: SPH_OPTIONS,
      cylOptions: CYL_OPTIONS,
      axisOptions: AXIS_OPTIONS,
      distanceAcuityOptions: DISTANCE_ACUITY_OPTIONS,
      nearAcuityOptions: NEAR_ACUITY_OPTIONS,
      materialOptions: MATERIAL_OPTIONS,
      usageOptions: USAGE_OPTIONS,
      typeOptions: TYPE_OPTIONS,
      treatmentOptions: TREATMENT_OPTIONS,
    },
  },
];

export const resolveEyeRefractionConfig = (headerName: string): EyeRefractionConfig | undefined =>
  EYE_REFRACTION_RULES.find(r => r.match(headerName))?.config;
