import type { MouseEvent, SyntheticEvent } from "react";

export type CancelClickHandler = (e?: SyntheticEvent) => void | Promise<void>;

type CancelButtonProps = {
  onClick?: CancelClickHandler;
  type?: "submit" | "button";
  className?: string;
  label?: string;
  disabled?: boolean;
};

const CancelButton = ({
  onClick,
  type,
  className = "cancel-button",
  label = "Cancel",
  disabled = false,
}: CancelButtonProps) => {
  const resolvedType = type ?? (onClick ? "button" : "submit");

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;

    e.preventDefault();
    void onClick(e);
  };

  return (
    <button
      type={resolvedType}
      className={`${className} bg-gray-400 text-white rounded-lg px-3 py-2  text-base font-medium transition active:scale-90 cursor-pointer`}
      onClick={onClick ? handleClick : undefined}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default CancelButton;
