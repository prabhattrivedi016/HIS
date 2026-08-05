export interface IntraOcularPressureConfig {
  methodOptions: string[];
}

interface IntraOcularPressureRule {
  match: (headerName: string) => boolean;
  config: IntraOcularPressureConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const INTRA_OCULAR_PRESSURE_RULES: IntraOcularPressureRule[] = [
  {
    match: headerName =>
      (normalize(headerName).includes("intra") &&
        normalize(headerName).includes("ocular") &&
        normalize(headerName).includes("pressure")) ||
      normalize(headerName).includes("iop"),
    config: {
      methodOptions: ["Goldman Applanation", "Perkins", "NCT"],
    },
  },
];

export const resolveIntraOcularPressureConfig = (
  headerName: string
): IntraOcularPressureConfig | undefined =>
  INTRA_OCULAR_PRESSURE_RULES.find(r => r.match(headerName))?.config;
