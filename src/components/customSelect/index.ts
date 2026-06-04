import { SelectItem } from "@/types";
import { StylesConfig } from "react-select";

export interface OptionItem {
  label?: string;
  value?: string | number;
}

export const SelectStyles: StylesConfig<OptionItem, boolean> = {
  container: base => ({
    ...base,
    width: "100%",
    maxWidth: "1000px",
  }),

  control: (base, state) => ({
    ...base,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: "40px",
    height: "40px",
    borderRadius: "10px",
    borderColor: state.isFocused ? "#6366f1" : "#6b7280",
    boxShadow: state.isFocused ? "0 0 0 1px #6366f1" : "none",
    backgroundColor: "#fff",
    overflow: "hidden",
  }),

  input: base => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: "14px",
    // fontFamily: "Inter, sans-serif",
    fontFamily: "Poppins, sans-serif",
  }),

  multiValue: base => ({
    ...base,
    marginRight: "4px",
    flexShrink: 0,
  }),

  multiValueLabel: base => ({
    ...base,
    maxWidth: "120px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  singleValue: base => ({
    ...base,
    color: "#0f172a",
    margin: 0,
    padding: 0,
    lineHeight: "40px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  placeholder: base => ({
    ...base,
    color: "#94a3b8",
    margin: 0,
    lineHeight: "40px",
  }),

  indicatorsContainer: base => ({
    ...base,
    height: "40px",
    paddingRight: "8px",
  }),

  dropdownIndicator: base => ({
    ...base,
    padding: 0,
    color: "#64748b",
  }),

  indicatorSeparator: base => ({
    ...base,
    height: "20px",
    backgroundColor: "#cbd5f5",
    margin: "0 8px",
  }),

  clearIndicator: () => ({
    display: "none",
  }),

  menuPortal: base => ({
    ...base,
    zIndex: 9999,
  }),

  menu: base => ({
    ...base,
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  }),

  menuList: base => ({
    ...base,
    maxHeight: "14rem",
    padding: "4px",
  }),

  option: (base, state) => ({
    ...base,
    cursor: "pointer",
    borderRadius: "6px",
    padding: "8px",
    backgroundColor: state.isFocused ? "#f3f4f6" : "transparent",
    color: "#1f2937",
  }),
};

// Disabled styles for react-select
export const getDisabledStyles = (isDisabled: boolean): StylesConfig<SelectItem, false> => {
  const baseStyles = SelectStyles as StylesConfig<SelectItem, false>;

  if (!isDisabled) {
    return baseStyles;
  }

  return {
    ...baseStyles,
    control: (provided, state: any) => ({
      ...(typeof baseStyles.control === "function"
        ? baseStyles.control(provided, state)
        : baseStyles.control),
      opacity: 0.5,
      cursor: "not-allowed",
      backgroundColor: "#dcdcdc",
      borderColor: "#ccc",
      pointerEvents: "none" as const,
    }),
    option: (provided, state: any) => ({
      ...(typeof baseStyles.option === "function"
        ? baseStyles.option(provided, state)
        : baseStyles.option),
      opacity: 0.5,
      cursor: "not-allowed",
    }),
    singleValue: (provided, state: any) => ({
      ...(typeof baseStyles.singleValue === "function"
        ? baseStyles.singleValue(provided, state)
        : baseStyles.singleValue),
      opacity: 0.6,
    }),
  };
};
