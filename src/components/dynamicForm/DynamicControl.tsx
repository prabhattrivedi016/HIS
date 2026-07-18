import InputField from "@/components/customInputField";
import { CONTROL_REGISTRY, DEFAULT_CONTROL } from "./controlRegistry";
import { ControlSchema, OptionSchema } from "./types";
import { evaluateConditionalDisplay } from "./utils/conditional";
import { getByPath } from "./utils/path";
import { isEmptyValue } from "./utils/validation";

const COL_SPAN_CLASSES: Record<number, string> = {
  1: "",
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
  4: "sm:col-span-2 lg:col-span-4",
};

interface DynamicControlProps {
  schema: ControlSchema;
  data: unknown;
  onFieldChange: (dataPath: string, value: unknown) => void;
  touched?: boolean;
  showAllErrors?: boolean;
  onFieldBlur?: (dataPath: string) => void;
  optionsOverride?: OptionSchema[];
}

const DynamicControl = ({
  schema,
  data,
  onFieldChange,
  touched,
  showAllErrors,
  onFieldBlur,
  optionsOverride,
}: DynamicControlProps) => {
  const isVisible = evaluateConditionalDisplay(schema.conditionalDisplay, data);
  if (!isVisible) return null;

  const effectiveSchema = optionsOverride ? { ...schema, options: optionsOverride } : schema;
  const Renderer = CONTROL_REGISTRY[schema.type ?? "text"] ?? DEFAULT_CONTROL;
  const value = getByPath(data, schema.dataPath);
  const handleChange = (v: unknown) => onFieldChange(schema.dataPath, v);
  const handleBlur = () => onFieldBlur?.(schema.dataPath);

  const showError =
    Boolean(schema.errorMessage) &&
    Boolean(schema.props?.required) &&
    (touched || showAllErrors) &&
    isEmptyValue(value);

  const wrapperClass = [COL_SPAN_CLASSES[schema.colSpan ?? 1], schema.wrapperClassName]
    .filter(Boolean)
    .join(" ");

  if (schema.type === "dynamicContent") {
    return <Renderer schema={schema} value={value} onChange={handleChange} />;
  }

  if (schema.type === "table") {
    return (
      <div className={wrapperClass}>
        <Renderer
          schema={effectiveSchema}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    );
  }

  if (schema.type === "switch") {
    return (
      <div className={wrapperClass}>
        <div className="flex items-center gap-2">
          <Renderer
            schema={effectiveSchema}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <span className="text-sm text-gray-700 font-medium">{schema.label}</span>
        </div>
        {showError && <p className="input-field-error">{schema.errorMessage}</p>}
      </div>
    );
  }

  return (
    <InputField
      label={schema.label}
      required={schema.props?.required}
      className={wrapperClass}
      layout={schema.labelPosition === "row" ? "row" : "column"}
    >
      <Renderer
        schema={effectiveSchema}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {showError && <p className="input-field-error">{schema.errorMessage}</p>}
    </InputField>
  );
};

export default DynamicControl;
