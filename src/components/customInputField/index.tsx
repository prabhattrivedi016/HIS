import React from "react";

type InputFieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
  /** "row" puts the label beside the field (prescription-line style) instead of above it */
  layout?: "column" | "row";
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  required,
  hint,
  children,
  className = "",
  layout = "column",
}) => {
  if (layout === "row") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <label className="input-label shrink-0 whitespace-nowrap">
          {label}
          {required && <span className="input-required">*</span>}
        </label>

        {hint && <span className="input-field-msg shrink-0">{hint}</span>}

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>

        {hint && <span className="input-field-msg">{hint}</span>}
      </div>

      {children}
    </div>
  );
};

export default InputField;
