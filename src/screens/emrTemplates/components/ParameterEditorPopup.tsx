import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import { showWarning } from "@/utils/alert";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CustomFormField, CustomFormFieldType } from "../types";

interface ParameterEditorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  /** present when editing an existing field, absent when adding a new one */
  initialField?: CustomFormField | null;
  onSave: (field: CustomFormField) => void;
}

const DEFAULT_RADIO_OPTIONS = ["Present", "Absent"];

const emptyState = () => ({
  labelText: "",
  fieldType: "text" as CustomFormFieldType,
  options: [] as string[],
  hasComments: false,
});

/**
 * Add/edit popup for one canvas parameter — opened for "+ Direct Parameter", a category's
 * "+ ADD PARAMETERS", or the edit icon on an existing field row. Stays agnostic of *where* the
 * saved field ends up (top-level vs. inside a category) — the caller (FormBuilder) decides that.
 */
const ParameterEditorPopup = ({
  isOpen,
  onClose,
  initialField,
  onSave,
}: ParameterEditorPopupProps) => {
  const [labelText, setLabelText] = useState("");
  const [fieldType, setFieldType] = useState<CustomFormFieldType>("text");
  const [options, setOptions] = useState<string[]>([]);
  const [hasComments, setHasComments] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialField) {
      setLabelText(initialField.labelText);
      setFieldType(initialField.fieldType);
      setOptions(initialField.options ?? []);
      setHasComments(Boolean(initialField.hasComments));
    } else {
      const blank = emptyState();
      setLabelText(blank.labelText);
      setFieldType(blank.fieldType);
      setOptions(blank.options);
      setHasComments(blank.hasComments);
    }
  }, [isOpen, initialField]);

  const handleTypeChange = (value: CustomFormFieldType) => {
    setFieldType(value);
    if (value === "radio" && options.length === 0) {
      setOptions(DEFAULT_RADIO_OPTIONS);
    }
    if (value === "text") {
      setOptions([]);
      setHasComments(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    setOptions(prev => prev.map((o, i) => (i === index ? value : o)));
  };

  const addOption = () => {
    setOptions(prev => [...prev, ""]);
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!labelText.trim()) {
      showWarning("Please enter a label for this parameter");
      return;
    }

    const cleanedOptions = options.map(o => o.trim()).filter(Boolean);

    if ((fieldType === "radio" || fieldType === "dropdown") && cleanedOptions.length === 0) {
      showWarning("Please add at least one option");
      return;
    }

    onSave({
      fieldId: initialField?.fieldId ?? 0,
      fieldType,
      labelText: labelText.trim(),
      options:
        fieldType === "radio" || fieldType === "dropdown" ? cleanedOptions : undefined,
      hasComments: fieldType === "radio" ? hasComments : undefined,
      sequenceNo: initialField?.sequenceNo ?? 0,
    });

    onClose();
  };

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title={initialField ? "Edit Parameter" : "Add Parameter"}
      className="emr-form-popup"
    >
      <div className="flex flex-col gap-3">
        <InputField label="Label Text" required>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Para patellar hollow test"
            value={labelText}
            onChange={e => setLabelText(e.target.value)}
          />
        </InputField>

        <InputField label="Field Type" required>
          <select
            className="input-field"
            value={fieldType}
            onChange={e => handleTypeChange(e.target.value as CustomFormFieldType)}
          >
            <option value="text">Text</option>
            <option value="radio">Radio</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </InputField>

        {(fieldType === "radio" || fieldType === "dropdown") && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Options
            </p>
            <div className="flex flex-col gap-1.5">
              {options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="input-field !mb-0"
                    placeholder={`Option ${idx + 1}`}
                    value={option}
                    onChange={e => updateOption(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="text-gray-400 hover:text-red-500 transition shrink-0"
                    title="Remove option"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 mt-2"
            >
              <Plus size={13} /> Add Option
            </button>
          </div>
        )}

        {fieldType === "radio" && (
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              className="input-checkbox"
              checked={hasComments}
              onChange={e => setHasComments(e.target.checked)}
            />
            Include a Comments box next to this field
          </label>
        )}
      </div>

      <div className="form-actions-responsive mt-5">
        <button type="button" className="save-btn" onClick={handleSave}>
          {initialField ? "Update" : "Add"}
        </button>
        <button type="button" className="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </CentralPopup>
  );
};

export default ParameterEditorPopup;
