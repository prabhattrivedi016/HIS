/** Shared between visionConfig.ts (Distance/Near × Unaided/Pinhole/Aided) and
 * eyeRefractionConfig.ts (Subjective glass prescription's Visual Acuity column) — both pick
 * acuity from the exact same two scales, so they're defined once here instead of twice. */
export const DISTANCE_ACUITY_OPTIONS = [
  "6/5",
  "6/6",
  "6/7.5",
  "6/9",
  "6/12",
  "6/15",
  "6/18",
  "6/24",
  "6/36",
  "6/60",
  "CF 3m",
  "CF 2m",
  "CF 1m",
  "CFCF",
  "HMCF",
  "PL+",
  "PL-",
];

export const NEAR_ACUITY_OPTIONS = ["N6", "N8", "N10", "N12", "N18", "N24", "N36"];
