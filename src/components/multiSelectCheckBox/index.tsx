import { OptionProps } from "react-select";

export interface SelectItem {
  label: string;
  value: number;
}

const MultiCheckboxOption = (props: OptionProps<SelectItem, true>) => {
  const { label, isSelected, innerRef, innerProps, isFocused } = props;

  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`
        flex items-center justify-between w-full px-3 py-2
        cursor-pointer
        ${isFocused ? "bg-gray-100" : ""}
      `}
    >
      {/* Label */}
      <span className="text-sm text-gray-800 select-none">{label}</span>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        readOnly
        className="w-4 h-4 accent-indigo-600 pointer-events-none"
      />
    </div>
  );
};

export default MultiCheckboxOption;
