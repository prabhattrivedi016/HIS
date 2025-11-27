import React from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonType = "button" | "submit" | "reset";

type ButtonProps = {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  type?: ButtonType;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
  className = "",
  ...rest
}) => {
  const base =
    "w-full px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2";

  const styles: Record<ButtonVariant, string> = {
    primary: "button-primary cursor-pointer active:scale-95",
    secondary: "button-secondary cursor-pointer active:scale-95",
  };

  return (
    <button
      type={type}
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
