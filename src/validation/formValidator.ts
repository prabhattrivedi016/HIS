type ComponentType = {
  required?: boolean;
  label: string;
  validation?: RegExp;
  minLength?: number;
  maxLength?: number;
};

export const formValidator = (component: ComponentType) => {
  return {
    required: component.required ? `${component.label} is required` : false,
    pattern: component.validation
      ? {
          value: new RegExp(component.validation),
          message: `${component.label} is invalid`,
        }
      : undefined,
    minLength: component.minLength
      ? {
          value: component.minLength,
          message: `Minimum ${component.minLength} characters`,
        }
      : undefined,
    maxLength: component.maxLength
      ? {
          value: component.maxLength,
          message: `Maximum ${component.maxLength} characters`,
        }
      : undefined,
  };
};
