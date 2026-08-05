/** Shared between frameDetailsConfig.ts (a standalone "Frame Details" header, if one is ever
 * added on its own) and eyeRefractionConfig.ts (whose single "Eye Refraction" header renders its
 * own Frame Details block alongside Objective/Subjective) — both option lists are defined once
 * here instead of twice. */
export const MATERIAL_OPTIONS = [
  "CR-39",
  "Polycarbonate",
  "Trivex",
  "High Index 1.6",
  "High Index 1.67",
  "High Index 1.74",
  "Glass",
];

export const USAGE_OPTIONS = ["Continuous Use", "As Needed", "Reading", "Screens"];

export const TYPE_OPTIONS = ["Progressive", "Bifocals Kryptok", "Inverted - D", "Executive"];

export const TREATMENT_OPTIONS = [
  "ARC",
  "UV Filter",
  "Tinted",
  "Photosun",
  "Photogrey",
  "Photo Brown",
  "Antiglare glass",
  "Polarized",
];
