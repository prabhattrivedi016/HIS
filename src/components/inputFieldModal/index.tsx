import { memo } from "react";

interface InputFieldModalProps<T extends object> {
  showPopup: boolean;
  data?: T[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelect: (item: T) => void;
  getLabel: (item: T) => string;
  className?: string;
  rowClassName?: string;
}

const InputFieldModal = <T extends object>({
  showPopup,
  data = [],
  activeIndex,
  setActiveIndex,
  onSelect,
  getLabel,
  className = "",
  rowClassName = "",
}: InputFieldModalProps<T>) => {
  if (!showPopup || data.length === 0) return null;

  return (
    <div className={`input-popup-bg ${className}`}>
      {data.map((item, index) => (
        <div
          key={(item as any).id ?? index}
          className={`input-popup-row ${
            index === activeIndex ? "bg-gray-200" : ""
          } ${rowClassName}`}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => onSelect(item)}
        >
          {getLabel(item)}
        </div>
      ))}
    </div>
  );
};

InputFieldModal.displayName = "InputFieldModal";

export default memo(InputFieldModal) as typeof InputFieldModal;
