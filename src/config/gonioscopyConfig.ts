export interface GonioscopyConfig {
  lensOptions: string[];
  quadrantOptions: string[];
}

interface GonioscopyRule {
  match: (headerName: string) => boolean;
  config: GonioscopyConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const GONIOSCOPY_RULES: GonioscopyRule[] = [
  {
    match: headerName => normalize(headerName).includes("gonioscopy"),
    config: {
      lensOptions: ["3 Mirror Lens", "4 Mirror Lens", "Koeppes Lens"],
      quadrantOptions: [
        "LI",
        "IRIS Root",
        "CBB",
        "TM(non-pigmented)",
        "TM(pigmented)",
        "Scleral Spur",
        "Schwalbes line",
        "PAS",
        "Angle Recession",
      ],
    },
  },
];

export const resolveGonioscopyConfig = (headerName: string): GonioscopyConfig | undefined =>
  GONIOSCOPY_RULES.find(r => r.match(headerName))?.config;
