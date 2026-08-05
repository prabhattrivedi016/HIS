import type { MouseEvent, SyntheticEvent } from "react";

export type RemoveIconClickHandler = (e?: SyntheticEvent) => void | Promise<void>;

type RemoveIconButtonProps = {
  onClick?: RemoveIconClickHandler;
  className?: string;
  disabled?: boolean;
  title?: string;
};

const RemoveIconButton = ({
  onClick,
  className = "",
  disabled = false,
  title = "Remove",
}: RemoveIconButtonProps) => {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;

    e.preventDefault();
    e.stopPropagation();
    void onClick(e);
  };

  return (
    <button
      type="button"
      className="border-0 bg-transparent p-0"
      onClick={onClick ? handleClick : undefined}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      <i
        className={`fa-solid fa-trash text-xl ${className} text-red-500 cursor-pointer active:scale-95 cursor-pointer transition-transform duration-150`}
      />
    </button>
  );
};

export default RemoveIconButton;
