import type { MouseEvent, SyntheticEvent } from "react";

export type EditIconClickHandler = (e?: SyntheticEvent) => void | Promise<void>;

type EditIconButtonProps = {
  onClick?: EditIconClickHandler;
  className?: string;
  disabled?: boolean;
  title?: string;
};

const EditIconButton = ({
  onClick,
  className = "",
  disabled = false,
  title = "Edit",
}: EditIconButtonProps) => {
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
        className={`fa-solid fa-edit text-xl ${className} text-blue-500 active:scale-90 cursor-pointer transition-transform duration-150`}
      />
    </button>
  );
};

export default EditIconButton;
