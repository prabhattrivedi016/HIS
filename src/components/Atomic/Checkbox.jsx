import React from "react";

const Checkbox = ({ label, checked, onChange, name, id, error }) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={id || name}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <input
          id={id || name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={`w-4 h-4 accent-blue-600 rounded cursor-pointer 
            focus:ring-2 focus:ring-blue-400 transition-all duration-200`}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>

      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default Checkbox;
