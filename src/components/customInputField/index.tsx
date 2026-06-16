import React from "react";

type InputFieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  required,
  hint,
  children,
  className = "",
}) => (
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

export default InputField;
