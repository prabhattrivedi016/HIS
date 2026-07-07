import { CardSchema, ControlSchema } from "../types";
import { evaluateConditionalDisplay } from "./conditional";
import { getByPath } from "./path";

export const isEmptyValue = (value: unknown): boolean =>
  value === undefined || value === null || value === "" || value === false;

export const isControlInvalid = (schema: ControlSchema, data: unknown): boolean => {
  if (!schema.props?.required) return false;
  if (!evaluateConditionalDisplay(schema.conditionalDisplay, data)) return false;
  return isEmptyValue(getByPath(data, schema.dataPath));
};

/** walks every visible, required control across all visible cards */
export const isFormValid = (blob: CardSchema[], data: unknown): boolean =>
  blob.every(card => {
    if (!evaluateConditionalDisplay(card.conditionalDisplay, data)) return true;
    return card.controls.every(control => !isControlInvalid(control, data));
  });
