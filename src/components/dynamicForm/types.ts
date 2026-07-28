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
  /** optgroup label to cluster this option under, e.g. "Days" / "Months" / "Year" */
  group?: string;
}

export interface OptionsRule {
  targetDataPath: string;
  optionsByValue: Record<string, OptionSchema[]>;
  defaultOptions?: OptionSchema[];
}

export interface TableColumnSchema {
  key: string;
  label: string;
  /** 1: Text Box, 2: Number, 3: Date Picker, 4: Text Area, 5: Dropdown */
  dataTypeId: number;
  options?: OptionSchema[];
  /** when set, renders as a search-as-you-type text input instead of the dataTypeId default */
  asyncSearch?: (query: string) => Promise<OptionSchema[]>;
}

export interface TableMasterEntryConfig {
  /** ENDPOINTS key the table's "Add entry" drawer independently saves new master records to */
  saveEndpoint: string;
  /** ENDPOINTS key to list existing master records, rendered below the drawer's form */
  listEndpoint: string;
  /** backend field name for the entity's id, e.g. "complaintId" */
  idField: string;
  /** backend field name for the entity's name, e.g. "complaintName" */
  nameField: string;
  /** backend table name, passed to DELETE_RECORD_BY_TABLE_NAME to delete a row from this master */
  tableName: string;
}

/** one past visit's worth of rows for a "Previous Visits" panel — `rows` are matched against the
 * control's live `columns` by key first, falling back to a normalized label match, so the same
 * dummy dataset works whether columns are keyed by header id (`header_12`) or by name
 * (`diagnosisType`, or even the raw label text like table columns use) */
export interface PreviousVisitEntry {
  /** ISO date, e.g. "2026-03-23" */
  visitDate: string;
  rows: { id: string; [key: string]: unknown }[];
}

export interface TableOrderSetConfig {
  /** ENDPOINTS key to list this doctor's order sets (named groups of rows to bulk-add) */
  listEndpoint: string;
  /** ENDPOINTS key to create/update an order set, and to toggle its favourite flag */
  saveEndpoint: string;
  /** ENDPOINTS key to search the picklist of items an order set can be built from */
  itemSearchEndpoint: string;
  /** fixed params sent with every item search request, e.g. { categoryTypeId: 3, isActive: 1 } */
  itemSearchParams?: Record<string, unknown>;
  idField: string;
  nameField: string;
  /** backend field name for the array of item names inside an order set, e.g. "items" */
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
  /** "table"/"card-group" controls only — default false. Set true to show a "Previous Visits"
   * panel that lets the doctor browse past-visit rows (grouped by visit date) and copy selected
   * ones into this control for the current visit */
  previousVisitsEnabled?: boolean;
  /** the past-visit data the "Previous Visits" panel above renders — dummy/mock until a real
   * per-header history endpoint exists (same precedent as dummyHeaderLovs.ts) */
  previousVisitsData?: PreviousVisitEntry[];
  /** logged-in doctor, used by "table" controls to load/save doctor-wise favourite entries */
  doctorId?: number;
  /** current patient, used by "medicineList" controls to look up its own past-visit snapshots */
  patientId?: number;
  /** current visit, used by "imageUpload" controls to scope the shared visit-reports store */
  visitId?: number;
  /** "table" controls only — default true. Set false to hide the favourites bar/star column entirely */
  favouritesEnabled?: boolean;
  /** "textarea"/"richtext" controls only — default false. Set true to show the "save as favourite" bar */
  textFavouritesEnabled?: boolean;
  /** "textarea" controls only — default false. Set true for a large, auto-growing textarea
   * instead of the normal fixed-height one */
  textLarge?: boolean;
  /** "card-group" controls only — which column's key is the entry's "name" (card title,
   * duplicate-check, and the field a master-entry/order-set pick lands in). Defaults to the
   * first column when unset — only needed when the meaningful/master-searchable field isn't
   * sequenced first (e.g. Family History's "Condition" column, with "Relationship" ahead of it) */
  nameColumnKey?: string;
}

export interface CardSchema {
  key: string;
  type?: string;
  title?: string;
  subtitle?: string;
  controls: ControlSchema[];
  conditionalDisplay?: ConditionalRule[];
}
