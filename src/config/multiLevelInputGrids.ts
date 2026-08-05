export interface MultiLevelGridLeafColumn {
  key: string;
  label: string;
  width?: number;
}

export interface MultiLevelGridColumnGroup {
  label: string;
  columns: MultiLevelGridLeafColumn[];
}

export interface MultiLevelGridConfig {
  title: string;

  leadingColumn: MultiLevelGridLeafColumn;
  groups: MultiLevelGridColumnGroup[];
}

interface MultiLevelInputGridRule {
  match: (headerName: string) => boolean;
  config: MultiLevelGridConfig;
}

const normalize = (v: string) => (v || "").trim().toLowerCase();

const MULTI_LEVEL_INPUT_GRID_RULES: MultiLevelInputGridRule[] = [
  {
    match: headerName => normalize(headerName).includes("keratometer"),
    config: {
      title: "Keratometer (dioptres)",
      leadingColumn: { key: "method", label: "METHOD", width: 140 },
      groups: [
        {
          label: "OD",
          columns: [
            { key: "odK1", label: "K1", width: 64 },
            { key: "odAxis1", label: "AXIS", width: 64 },
            { key: "odK2", label: "K2", width: 64 },
            { key: "odAxis2", label: "AXIS", width: 64 },
          ],
        },
        {
          label: "OS",
          columns: [
            { key: "osK1", label: "K1", width: 64 },
            { key: "osAxis1", label: "AXIS", width: 64 },
            { key: "osK2", label: "K2", width: 64 },
            { key: "osAxis2", label: "AXIS", width: 64 },
          ],
        },
      ],
    },
  },
];

export const resolveMultiLevelInputGridConfig = (
  headerName: string
): MultiLevelGridConfig | undefined =>
  MULTI_LEVEL_INPUT_GRID_RULES.find(r => r.match(headerName))?.config;
