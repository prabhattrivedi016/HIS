export interface ConditionalRule {
  src: string;
  exp: "==" | "!=" | "isnull" | "in" | "notin" | "<" | "<=" | ">" | ">=";
  target: unknown;
  connector?: "&&" | "||";
}

export interface OptionSchema {
  key?: string;
  label: string;
  value: unknown;
  group?: string;
  score?: number;
  /** "EmojiScore" options only — a data: URL image (e.g. a face/pain-scale icon) shown above the
   * option's label instead of a plain radio bullet */
  imageUrl?: string;
}

export interface RadioScoreGroupRow {
  key: string;
  label: string;
  options: OptionSchema[];
}

export interface OptionsRule {
  targetDataPath: string;
  optionsByValue: Record<string, OptionSchema[]>;
  defaultOptions?: OptionSchema[];
}

export interface TableColumnSchema {
  key: string;
  label: string;
  dataTypeId: number;
  options?: OptionSchema[];
  asyncSearch?: (query: string) => Promise<OptionSchema[]>;
}

export interface TableMasterEntryConfig {
  saveEndpoint: string;
  listEndpoint: string;
  idField: string;
  nameField: string;
  tableName: string;
}

export interface PreviousVisitEntry {
  /** ISO date, e.g. "2026-03-23" */
  visitDate: string;
  rows: { id: string; [key: string]: unknown }[];
}

export interface TableOrderSetConfig {
  listEndpoint: string;
  saveEndpoint: string;
  itemSearchEndpoint: string;
  itemSearchParams?: Record<string, unknown>;
  idField: string;
  nameField: string;
  itemsField: string;
}

export interface ControlSchema {
  key: string;
  label?: string;
  type?: string;
  dataPath: string;
  props?: {
    required?: boolean;
    placeholder?: string;
    maxlength?: string | number;
    class?: string;
    [key: string]: unknown;
  };
  options?: OptionSchema[];
  errorMessage?: string;
  colSpan?: 1 | 2 | 3 | 4;
  wrapperClassName?: string;
  labelPosition?: "top" | "row";
  value?: string;
  conditionalDisplay?: ConditionalRule[];
  optionsRules?: OptionsRule[];
  asyncSearch?: (query: string) => Promise<OptionSchema[]>;
  columns?: TableColumnSchema[];
  masterEntryConfig?: TableMasterEntryConfig;
  orderSetConfig?: TableOrderSetConfig;

  previousVisitsEnabled?: boolean;

  previousVisitsData?: PreviousVisitEntry[];
  doctorId?: number;
  patientId?: number;
  visitId?: number;

  controlTypeId?: number;
  favouritesEnabled?: boolean;
  textFavouritesEnabled?: boolean;

  textLarge?: boolean;

  nameColumnKey?: string;

  gridConfigName?: string;

  rows?: RadioScoreGroupRow[];
}

export interface CardSchema {
  key: string;
  type?: string;
  title?: string;
  subtitle?: string;
  controls: ControlSchema[];
  conditionalDisplay?: ConditionalRule[];
}
