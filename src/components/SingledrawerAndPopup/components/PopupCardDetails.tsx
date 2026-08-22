import React from "react";

const PopupCardDetails = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) => {
  return (
    <div className={`flex flex-row gap-1 ${className}`}>
      <span className="name-header whitespace-nowrap">{label}:</span>
      <span className="truncate">{value}</span>
    </div>
  );
};

export default React.memo(PopupCardDetails);
