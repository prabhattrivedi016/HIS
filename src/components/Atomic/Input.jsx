import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  icon: Icon,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
  autoComplete = "off",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      {/* Input Container */}
      <div
        className={`relative flex items-center border-2 rounded-lg transition ${
          error
            ? "border-red-500"
            : "border-gray-300 focus-within:border-indigo-500"
        }`}
      >
        {/* Left Icon */}
        {Icon && (
          <div className="pl-3 text-gray-400">
            <Icon size={20} />
          </div>
        )}

        {/* Input Field */}
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full px-3 py-2 rounded-lg outline-none bg-transparent text-gray-800 placeholder-gray-400"
        />

        {/* Password Toggle Icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="pr-3 text-gray-400 hover:text-gray-600 transition"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default Input;
