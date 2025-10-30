import React from "react";

const Button = ({
  children,
  variant = "primary",
  type = "button", // <-- Accept type
  onClick,
  disabled,
  className = "",
  ...rest
}) => {
  const base =
    "w-full px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2";
  const styles = {
    primary: "button-primary cursor-pointer active:scale-95",
    secondary: "button-secondary cursor-pointer active:scale-95",
  };

  return (
    <button
      type={type} // <-- APPLY type
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
