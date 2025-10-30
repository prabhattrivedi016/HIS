const InputField = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="text-sm font-sm text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);
export default InputField;
