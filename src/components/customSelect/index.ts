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

  valueContainer: () =>
    "!px-4 !py-0 !h-[40px] !flex !items-center !flex-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide",

  input: () => "!m-0 !p-0 !text-sm !leading-[40px]",

  multiValue: () => "!flex-shrink-0 !mr-1",

  multiValueLabel: () => "!max-w-[120px] !truncate",

  singleValue: () => "!text-slate-900 !m-0 !p-0 !leading-[40px] !truncate",

  placeholder: () => "!text-slate-400 !m-0 !leading-[40px]",

  indicatorsContainer: () => "!h-[40px] !flex !items-center !pr-2",

  dropdownIndicator: () => "!p-0 !text-slate-500",

  indicatorSeparator: () => "!h-5 !bg-slate-300 !mx-2",

  clearIndicator: () => "hidden",

  menuPortal: () => "!z-[9999]",

  menu: () => "rounded-[10px] border border-slate-200 bg-white shadow-xl",

  menuList: () => "max-h-56 overflow-y-auto p-1",

  option: ({ isFocused, isSelected }) =>
    `
    !bg-transparent
    !text-gray-800
    cursor-pointer
    px-2 py-2 rounded-md

    ${isFocused ? "bg-gray-100" : ""}
    ${isSelected ? "bg-transparent" : ""}
    `,
};
