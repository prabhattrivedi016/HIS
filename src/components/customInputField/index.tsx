// Using children, the same wrapper can handle anything you put between the opening and closing tags.
import React from "react";
type InputFieldProps = {
  label?: string;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const InputField: React.FC<InputFieldProps> = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="input-label">
      {label}
      {required && <span className="input-required">*</span>}
    </label>
    {children}
  </div>
);

export default InputField;
