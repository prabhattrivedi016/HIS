const InputField = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="input-label">
      {label}
      {required && <span className="input-required">*</span>}
    </label>
    {children}
  </div>
);
export default InputField;
