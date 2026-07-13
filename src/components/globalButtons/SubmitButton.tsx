import type { MouseEvent, SyntheticEvent } from "react";

export type SubmitClickHandler = (e?: SyntheticEvent) => void | Promise<void>;

type SubmitButtonProps = {
  onClick?: SubmitClickHandler;
  type?: "submit" | "button";
  className?: string;
  label?: string;
  disabled?: boolean;
};

const SubmitButton = ({
  onClick,
  type,
  className = "save-btn",
  label = "Save",
  disabled = false,
}: SubmitButtonProps) => {
  const resolvedType = type ?? (onClick ? "button" : "submit");

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;

    e.preventDefault();
    void onClick(e);
  };

  return (
    <button
      type={resolvedType}
      className={`${className} text-white rounded-lg px-3 py-2  text-base font-medium transition active:scale-90 cursor-pointer`}
      onClick={onClick ? handleClick : undefined}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default SubmitButton;
