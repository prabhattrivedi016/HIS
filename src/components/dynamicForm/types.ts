export interface ConditionalRule {
  src: string;
  exp: "==" | "!=";
  target: unknown;
  connector?: "&&" | "||";
}

export interface OptionSchema {
  key?: string;
  label: string;
  value: unknown;
}

export interface OptionsRule {
  /** the other control whose options list gets replaced */
  targetDataPath: string;
  /** new options for the target, keyed by this control's selected value (stringified) */
  optionsByValue: Record<string, OptionSchema[]>;
  /** used when the selected value has no matching key above */
  defaultOptions?: OptionSchema[];
}

export interface ControlSchema {
  key: string;
  label?: string;
  /** control type — falls back to a plain text input if omitted/unrecognized */
  type?: string;
  /** dot-path into the data object this control reads/writes, e.g. "Risks.Properties.0.Address.City" */
  dataPath: string;
  props?: {
    required?: boolean;
    placeholder?: string;
    maxlength?: string | number;
    /** extra classes merged onto the actual input/select/textarea element */
    class?: string;
    [key: string]: unknown;
  };
  options?: OptionSchema[];
  /** shown under the control once it's touched (or validate() is called) while required and empty */
  errorMessage?: string;
  /** how many of the row's 4 columns this control takes up — simplest way to control layout, no Tailwind knowledge needed */
  colSpan?: 1 | 2 | 3 | 4;
  /** extra classes merged onto the InputField wrapper, for anything colSpan doesn't cover */
  wrapperClassName?: string;
  /** "row" puts the label beside the control (prescription-line style) instead of above it */
  labelPosition?: "top" | "row";
  /** static HTML for type "dynamicContent" */
  value?: string;
  conditionalDisplay?: ConditionalRule[];
  /** when this control's value changes, replace another control's options list (cascading dropdowns) */
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
