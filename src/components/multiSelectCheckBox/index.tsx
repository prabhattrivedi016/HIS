import { components, OptionProps } from "react-select";

interface SelectItem {
  label: string;
  valueL: number;
}

const CheckboxOption = (props: OptionProps<SelectItem>) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-sm text-gray-800 select-none">{props.label}</span>

        <input
          type="checkbox"
          checked={props.isSelected}
          readOnly
          className="w-4 h-4 cursor-pointer accent-indigo-600"
        />
      </div>
    </components.Option>
  );
};

export default CheckboxOption;
