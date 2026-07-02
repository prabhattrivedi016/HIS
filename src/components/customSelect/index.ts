import { SelectItem } from "@/types";
import { StylesConfig } from "react-select";

export interface OptionItem {
  label?: string;
  value?: string | number;
}

/* Colors / metrics aligned with native .input-field (Tailwind) so react-select
   looks identical to the browser's default <select> used across the app. */
const BORDER_COLOR = "#9ca3af"; // gray-400
const FOCUS_COLOR = "#6366f1"; // indigo-500
const TEXT_COLOR = "#0f172a"; // slate-900
const PLACEHOLDER_COLOR = "#6b7280"; // gray-500
const DISABLED_BG = "#e5e7eb"; // gray-200 (matches .disabled-input-field)
const DISABLED_BORDER = "#9ca3af"; // gray-400 (matches .disabled-input-field)
const DISABLED_TEXT = "#9ca3af"; // gray-400
const BORDER_RADIUS = "0.5rem"; // rounded-lg
const CONTROL_HEIGHT = "40px"; // py-2 + line-height ~= 40px
const FONT_SIZE = "1rem"; // base
const FONT_FAMILY = "inherit";
const PADDING_X = "16px"; // px-4

export const SelectStyles: StylesConfig<OptionItem, boolean> = {
  container: base => ({
    ...base,
    width: "100%",
    maxWidth: "100%",
    marginBottom: "0.5rem", // mb-2
  }),

  control: (base, state) => ({
    ...base,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: CONTROL_HEIGHT,
    borderRadius: BORDER_RADIUS,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: state.isDisabled ? DISABLED_BORDER : state.isFocused ? FOCUS_COLOR : BORDER_COLOR,
    boxShadow: state.isDisabled ? "none" : state.isFocused ? `0 0 0 1px ${FOCUS_COLOR}` : "none",
    backgroundColor: state.isDisabled ? DISABLED_BG : "#fff",
    cursor: state.isDisabled ? "not-allowed" : "default",
    opacity: 1,
    alignItems: "center",
    flexWrap: "nowrap",
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    "&:hover": {
      borderColor: state.isDisabled
        ? DISABLED_BORDER
        : state.isFocused
          ? FOCUS_COLOR
          : BORDER_COLOR,
    },
  }),

  valueContainer: base => ({
    ...base,
    height: CONTROL_HEIGHT,
    padding: `0 4px 0 ${PADDING_X}`,
    display: "flex",
    alignItems: "center",
    flexWrap: "nowrap",
  }),

  input: base => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
    color: TEXT_COLOR,
  }),

  multiValue: base => ({
    ...base,
    backgroundColor: "#f3f4f6",
    borderRadius: "4px",
    margin: "2px 4px 2px 0",
    flexShrink: 0,
  }),

  multiValueLabel: base => ({
    ...base,
    color: TEXT_COLOR,
    fontSize: "0.875rem",
    fontFamily: FONT_FAMILY,
    maxWidth: "160px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  singleValue: (base, state) => ({
    ...base,
    color: state.isDisabled ? DISABLED_TEXT : TEXT_COLOR,
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
    lineHeight: "normal",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  placeholder: (base, state) => ({
    ...base,
    color: state.isDisabled ? DISABLED_TEXT : PLACEHOLDER_COLOR,
    opacity: 1,
    margin: 0,
    display: "flex",
    alignItems: "center",
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
    fontWeight: 400,
    lineHeight: "normal",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  indicatorsContainer: base => ({
    ...base,
    height: CONTROL_HEIGHT,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 0,
    margin: 0,
  }),

  /* No vertical separator line before the arrow (native selects don't have one) */
  indicatorSeparator: () => ({
    display: "none",
  }),

  /* Native-sized chevron, pushed to the far right like a browser <select> */
  dropdownIndicator: (base, state) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    marginLeft: "auto",
    marginRight: "1px",
    color: state.isDisabled ? DISABLED_TEXT : TEXT_COLOR,
    "& svg": {
      width: "18px",
      height: "18px",
    },
    "&:hover": {
      color: state.isDisabled ? DISABLED_TEXT : TEXT_COLOR,
    },
  }),

  /* Hide the clear (x) indicator so it matches a native <select> */
  clearIndicator: () => ({
    display: "none",
  }),

  menuPortal: base => ({
    ...base,
    zIndex: 9999,
  }),

  menu: base => ({
    ...base,
    borderRadius: BORDER_RADIUS,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
    overflow: "hidden",
  }),

  menuList: base => ({
    ...base,
    maxHeight: "14rem",
    padding: "4px",
  }),

  option: (base, state) => ({
    ...base,
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
    backgroundColor: state.isSelected ? "#e0e7ff" : state.isFocused ? "#f3f4f6" : "#fff",
    color: state.isDisabled ? DISABLED_TEXT : TEXT_COLOR,
    "&:active": {
      backgroundColor: "#e0e7ff",
    },
  }),
};

/**
 * Disabled styles for react-select. Kept for backward compatibility.
 * The base SelectStyles already reacts to `isDisabled`, so passing the
 * `isDisabled` prop on the <Select /> is enough for the disabled look.
 */
export const getDisabledStyles = (_isDisabled: boolean): StylesConfig<SelectItem, false> => {
  return SelectStyles as StylesConfig<SelectItem, false>;
};
