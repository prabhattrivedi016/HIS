import TextEditor from "@/components/ckEditor";
import { SelectStyles } from "@/components/customSelect";
import DOMPurify from "dompurify";
import { Check } from "lucide-react";
import Select from "react-select";
import { ControlSchema } from "./types";

export interface ControlRenderProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  rows?: number;
  isMulti?: boolean;
}

const mergeClass = (base: string, schema: ControlSchema) =>
  schema.props?.class ? `${base} ${schema.props.class}` : base;

const TextControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <input
    type="text"
    className={mergeClass("input-field", schema)}
    placeholder={schema.props?.placeholder as string}
    required={schema.props?.required}
    maxLength={schema.props?.maxlength ? Number(schema.props.maxlength) : undefined}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const TextareaControl = ({ schema, value, onChange, onBlur, rows }: ControlRenderProps) => (
  <textarea
    className={mergeClass("input-field resize-y min-h-[38px]", schema)}
    rows={rows ?? 1}
    placeholder={(schema.props?.placeholder as string) || "Type here…"}
    required={schema.props?.required}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const NumberControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <input
    type="number"
    className={mergeClass("input-field", schema)}
    placeholder={schema.props?.placeholder as string}
    required={schema.props?.required}
    maxLength={schema.props?.maxlength ? Number(schema.props.maxlength) : undefined}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const DateControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <input
    type="date"
    className={mergeClass("input-field", schema)}
    required={schema.props?.required}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const CurrencyControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
    <input
      type="number"
      className={mergeClass("input-field pl-6", schema)}
      placeholder={schema.props?.placeholder as string}
      required={schema.props?.required}
      value={(value as string) ?? ""}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
    />
  </div>
);

const SwitchControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <label className="flex items-center gap-2 cursor-pointer select-none h-10">
    <input
      type="checkbox"
      className={mergeClass("input-checkbox", schema)}
      checked={value === true || value === "true"}
      onChange={e => onChange(e.target.checked ? "true" : "false")}
      onBlur={onBlur}
    />
  </label>
);

const DropdownControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <select
    className={mergeClass("input-field", schema)}
    required={schema.props?.required}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  >
    <option value="">-- Select --</option>
    {schema.options?.map((opt, i) => (
      <option key={opt.key ?? i} value={opt.value as string}>
        {opt.label}
      </option>
    ))}
  </select>
);

const SearchDropdownControl = ({
  schema,
  value,
  onChange,
  onBlur,
  isMulti,
}: ControlRenderProps) => {
  const options = (schema.options ?? []).map(opt => ({
    label: opt.label,
    value: opt.value as string | number,
  }));
  const selected = options.find(opt => opt.value === value) ?? null;

  return (
    <Select
      value={selected}
      options={options}
      placeholder={schema.props?.placeholder as string}
      isSearchable
      isMulti={isMulti}
      isClearable
      onChange={opt => onChange((opt as { value: unknown } | null)?.value ?? null)}
      onBlur={onBlur}
      styles={SelectStyles}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      className={schema.props?.class as string}
    />
  );
};

const RadioControl = ({ schema, value, onChange }: ControlRenderProps) => (
  <div className={mergeClass("flex flex-wrap gap-2", schema)}>
    {schema.options?.map((opt, i) => {
      const selected = value === opt.value;
      return (
        <button
          key={opt.key ?? i}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all active:scale-95 ${
            selected
              ? "bg-blue-500 border-blue-500 text-white shadow-sm"
              : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          {selected && <Check size={13} />}
          {opt.label}
        </button>
      );
    })}
  </div>
);

const RichTextControl = ({ value, onChange }: ControlRenderProps) => (
  <TextEditor value={(value as string) ?? ""} onChange={onChange} />
);

const DynamicContentControl = ({ schema }: ControlRenderProps) => (
  <div
    className={mergeClass("text-sm text-gray-700", schema)}
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(schema.value ?? "") }}
  />
);

export const CONTROL_REGISTRY: Record<string, React.FC<ControlRenderProps>> = {
  text: TextControl,
  textarea: TextareaControl,
  number: NumberControl,
  number2: NumberControl,
  date: DateControl,
  currency: CurrencyControl,
  switch: SwitchControl,
  dropdown: DropdownControl,
  "search-dropdown": SearchDropdownControl,
  radio: RadioControl,
  richtext: RichTextControl,
  dynamicContent: DynamicContentControl,
};

export const DEFAULT_CONTROL = TextControl;
