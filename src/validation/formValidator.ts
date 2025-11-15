import { FieldValues, UseFormGetValues } from "react-hook-form";

type Component = {
  required?: boolean;
  label: string;
  validation?: RegExp | string;
  minLength?: number;
  maxLength?: number;
  fieldId: string;
  minDate?: string;
  maxDate?: string;
  matchField?: string;
  readOnly?: boolean;
  customValidate?: (value: any, getValues?: any) => true | string;
  [key: string]: any;
};

export const formValidator = (
  component: Component,
  getValues?: UseFormGetValues<FieldValues>,
  formConfig?: Component[]
) => {
  const validationRules = {
    required: component.required ? `${component.label} is required` : false,

    pattern: component.validation
      ? {
          value:
            component.validation instanceof RegExp
              ? component.validation
              : new RegExp(component.validation),
          message: `${component.label} is invalid`,
        }
      : undefined,

    minLength: component.minLength
      ? {
          value: component.minLength,
          message: `Minimum ${component.minLength} characters required`,
        }
      : undefined,

    maxLength: component.maxLength
      ? {
          value: component.maxLength,
          message: `Maximum ${component.maxLength} characters allowed`,
        }
      : undefined,

    validate: (value: string): true | string => {
      if (component.minDate || component.maxDate) {
        const selectedDate = new Date(value);
        const min = component.minDate ? new Date(component.minDate) : null;
        const max = component.maxDate ? new Date(component.maxDate) : null;

        if (min && selectedDate < min)
          return `${component.label} cannot be before ${component.minDate}`;
        if (max && selectedDate > max)
          return `${component.label} cannot be after ${component.maxDate}`;
      }

      if (component.matchField && getValues) {
        const matchValue = getValues(component.matchField);

        const matchFieldLabel =
          formConfig?.find(f => f.fieldId === component.matchField)?.label || component.matchField;

        if (value !== matchValue) return `${component.label} does not match ${matchFieldLabel}`;
      }

      if (component.customValidate) {
        const result = component.customValidate(value, getValues);
        if (result !== true) return result;
      }

      return true;
    },
  };

  const uiAttributes = {
    readOnly: component.readOnly || false,
    maxLength: component.maxLength || undefined,
  };

  return { validationRules, uiAttributes };
};
