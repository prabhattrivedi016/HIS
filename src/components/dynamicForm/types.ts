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
  /** logged-in doctor, used by "table" controls to load/save doctor-wise favourite entries */
  doctorId?: number;
}

export interface CardSchema {
  key: string;
  type?: string;
  title?: string;
  subtitle?: string;
  controls: ControlSchema[];
  conditionalDisplay?: ConditionalRule[];
}
