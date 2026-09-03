import type { MouseEvent, SyntheticEvent } from "react";

export type CommentIconClickHandler = (e?: SyntheticEvent) => void | Promise<void>;

type CommentIconButtonProps = {
  onClick?: CommentIconClickHandler;
  className?: string;
  disabled?: boolean;
  title?: string;
};

const CommentIconButton = ({
  onClick,
  className = "",
  disabled = false,
  title = "View Remarks",
}: CommentIconButtonProps) => {
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
        className={`fa-solid fa-comments text-lg ${className} text-blue-500 active:scale-90 cursor-pointer transition-transform duration-150`}
      />
    </button>
  );
};

export default CommentIconButton;
