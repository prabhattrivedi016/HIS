import {
  MATERIAL_OPTIONS,
  TREATMENT_OPTIONS,
  TYPE_OPTIONS,
  USAGE_OPTIONS,
} from "./frameFittingOptions";

/**
 * "Frame Details" (spectacle prescription/frame fitting) is a single header that renders the
 * I.P.D./RI/Sides/Bridge measurements + Material dropdown + Usage/Type/Treatment checkbox groups
 * + Notes box all as one fixed-shape control — config-driven so the option lists can change
 * without touching components/dynamicForm/FrameDetailsControl.tsx.
 *
 * Note: in this EMR, Frame Details actually ships as part of the single "Eye Refraction" header
 * alongside Objective/Subjective (see eyeRefractionConfig.ts + EyeRefractionControl.tsx) rather
 * than as its own header — this file/control stays here, unused for now, only in case a truly
 * standalone "Frame Details" header is ever added on its own.
 */
export interface FrameDetailsConfig {
  materialOptions: string[];
  usageOptions: string[];
  typeOptions: string[];
  treatmentOptions: string[];
}

interface FrameDetailsRule {
  match: (headerName: string) => boolean;
  config: FrameDetailsConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const FRAME_DETAILS_RULES: FrameDetailsRule[] = [
  {
    // note: "eye"+"refraction" is deliberately NOT matched here — that's the separate Objective/
    // Subjective refraction-grid header, its own dedicated "eyeRefraction" control (see
    // eyeRefractionConfig.ts). Matching both here would have swallowed that header into this one.
    match: headerName =>
      normalize(headerName).includes("frame") && normalize(headerName).includes("detail"),
    config: {
      materialOptions: MATERIAL_OPTIONS,
      usageOptions: USAGE_OPTIONS,
      typeOptions: TYPE_OPTIONS,
      treatmentOptions: TREATMENT_OPTIONS,
    },
  },
];

export const resolveFrameDetailsConfig = (headerName: string): FrameDetailsConfig | undefined =>
  FRAME_DETAILS_RULES.find(r => r.match(headerName))?.config;
