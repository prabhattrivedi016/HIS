import { ClassNamesConfig } from "react-select";

export const SelectStyles: ClassNamesConfig = {
  container: () => "w-full",

  control: ({ isFocused }) =>
    `
    !h-[40px] !min-h-[40px]
    !rounded-[10px]
    !border !border-gray-500
    !bg-white
    !shadow-none
    ${isFocused ? "!border-gray-700 !ring-1 !ring-indigo-500" : ""}
    `,

  valueContainer: () => "!px-4 !py-0 !h-[40px] !flex !items-center overflow-hidden",

  input: () => "!m-0 !p-0 !text-sm !leading-[40px]",

  singleValue: () => "!text-slate-900 !m-0 !p-0 !leading-[40px] !truncate",

  placeholder: () => "!text-slate-400 !m-0 !leading-[40px]",

  indicatorsContainer: () => "!h-[40px] !flex !items-center !pr-2",

  dropdownIndicator: () => "!p-0 !text-slate-500",

  indicatorSeparator: () => "!h-5 !bg-slate-300 !mx-2",

  /* ❌ REMOVE CROSS BUTTON COMPLETELY */
  clearIndicator: () => "hidden",

  /* 🔥 KEY FIX FOR OVERFLOW */
  menuPortal: () => "!z-[9999]",

  menu: () => "rounded-[10px] border border-slate-200 bg-white shadow-xl",

  menuList: () => "max-h-56 overflow-y-auto p-1",

  option: ({ isFocused, isSelected }) =>
    `
    px-3 py-2 rounded-md cursor-pointer
    ${isSelected ? "bg-indigo-500 text-white" : ""}
    ${isFocused && !isSelected ? "bg-indigo-100 text-slate-900" : ""}
    `,
};
