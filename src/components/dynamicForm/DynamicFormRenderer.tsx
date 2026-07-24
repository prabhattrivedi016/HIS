import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import DynamicControl from "./DynamicControl";
import { CardSchema, ControlSchema, OptionSchema } from "./types";
import { evaluateConditionalDisplay } from "./utils/conditional";
import { setByPath } from "./utils/path";
import { isFormValid } from "./utils/validation";

export interface DynamicFormRendererHandle {
  validate: () => boolean;
}

export interface FieldChangeEvent {
  cardKey: string;
  controlKey: string;
  dataPath: string;
  value: unknown;
}

interface DynamicFormRendererProps<T> {
  className?: string;
  blob: CardSchema[];
  data: T;
  onDataChange: (data: T) => void;

  onControlChange?: (event: FieldChangeEvent) => void;
}

const DynamicFormRendererInner = <T,>(
  { className, blob, data, onDataChange, onControlChange }: DynamicFormRendererProps<T>,
  ref: React.ForwardedRef<DynamicFormRendererHandle>
) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, OptionSchema[]>>({});

  const { controlsByPath, cardKeyByPath } = useMemo(() => {
    const controls: Record<string, ControlSchema> = {};
    const cardKeys: Record<string, string> = {};
    blob.forEach(card =>
      card.controls.forEach(control => {
        controls[control.dataPath] = control;
        cardKeys[control.dataPath] = card.key;
      })
    );
    return { controlsByPath: controls, cardKeyByPath: cardKeys };
  }, [blob]);

  useImperativeHandle(ref, () => ({
    validate: () => {
      setShowAllErrors(true);
      return isFormValid(blob, data);
    },
  }));

  const handleFieldChange = (dataPath: string, value: unknown) => {
    let nextData = setByPath(data, dataPath, value);

    const control = controlsByPath[dataPath];

    const rules = control?.optionsRules;
    if (rules?.length) {
      const optionUpdates: Record<string, OptionSchema[]> = {};
      rules.forEach(rule => {
        const newOptions = rule.optionsByValue[String(value)] ?? rule.defaultOptions ?? [];
        optionUpdates[rule.targetDataPath] = newOptions;
        // the target's previously-selected value may no longer be valid under the new options — clear it
        nextData = setByPath(nextData, rule.targetDataPath, undefined);
      });
      setDynamicOptions(prev => ({ ...prev, ...optionUpdates }));
    }

    onDataChange(nextData);

    onControlChange?.({
      cardKey: cardKeyByPath[dataPath] ?? "",
      controlKey: control?.key ?? "",
      dataPath,
      value,
    });
  };

  const handleFieldBlur = (dataPath: string) => {
    setTouched(prev => ({ ...prev, [dataPath]: true }));
  };

  return (
    <div className={`flex flex-col gap-4`}>
      {blob.map(card => {
        const isVisible = evaluateConditionalDisplay(card.conditionalDisplay, data);
        if (!isVisible) return null;

        return (
          <div key={card.key} className={`${className}`}>
            {card.title && <h2 className="card-title mb-1">{card.title}</h2>}
            {card.subtitle && <p className="text-sm text-gray-500 mb-3">{card.subtitle}</p>}
            <div className="dynamic-form-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {card.controls.map(control => (
                <DynamicControl
                  key={control.key}
                  schema={control}
                  data={data}
                  onFieldChange={handleFieldChange}
                  touched={touched[control.dataPath]}
                  showAllErrors={showAllErrors}
                  onFieldBlur={handleFieldBlur}
                  optionsOverride={dynamicOptions[control.dataPath]}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DynamicFormRenderer = forwardRef(DynamicFormRendererInner) as <T>(
  props: DynamicFormRendererProps<T> & { ref?: React.ForwardedRef<DynamicFormRendererHandle> }
) => ReturnType<typeof DynamicFormRendererInner>;

export default DynamicFormRenderer;
