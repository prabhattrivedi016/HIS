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
}

export interface OptionsRule {
  targetDataPath: string;
  optionsByValue: Record<string, OptionSchema[]>;
  defaultOptions?: OptionSchema[];
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
}

export interface CardSchema {
  key: string;
  type: "Card";
  title?: string;
  subtitle?: string;
  controls: ControlSchema[];
  conditionalDisplay?: ConditionalRule[];
}
