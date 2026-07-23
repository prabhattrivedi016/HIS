import type { MouseEvent, SyntheticEvent } from "react";

export type EditIconClickHandler = (e?: SyntheticEvent) => void | Promise<void>;

type SearchIconButtonProps = {
  onClick?: EditIconClickHandler;
  className?: string;
  disabled?: boolean;
  title?: string;
};

const SearchIconButton = ({
  onClick,
  className = "",
  disabled = false,
  title = "Search",
}: SearchIconButtonProps) => {
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
        className={`fa-solid fa-search text-xl ${className} icon-color-button active:scale-90 cursor-pointer transition-transform duration-150`}
      />
    </button>
  );
};

export default SearchIconButton;
