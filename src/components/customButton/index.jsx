const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
  color,
  className = "",
  ...rest
}) => {
  const base =
    "w-full px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2";

  const styles = {
    primary: "button-primary cursor-pointer active:scale-95",
    secondary: "button-secondary cursor-pointer active:scale-95",
    addButtons: "text-white font-medium bg-[#1e6da1] hover:bg-blue-600 active:scale-95",
    signupBtn: "text-indigo-600 hover:underline font-medium cursor-pointer w-auto p-0 inline-flex",
  };

  // Variants that should NOT receive base styles
  const noBaseVariants = ["signupBtn"];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={color ? { backgroundColor: color } : undefined}
      className={`
        ${!noBaseVariants.includes(variant) ? base : ""}
        ${styles[variant]}
        ${className}
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
      `}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
