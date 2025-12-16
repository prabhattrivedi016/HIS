const Select = ({ icon: Icon, options = [], value, onChange, error, placeholder }) => {
  return (
    <div className="w-full">
      <div
        className={`relative flex items-center border-2 rounded-lg transition 
        ${error ? "border-red-400" : "border-gray-300"} 
        bg-white`}
      >
        {/* Icon */}
        {Icon && (
          <div className="pl-3 text-gray-500 flex items-center">
            <Icon size={20} className="min-w-[20px]" />
          </div>
        )}

        {/* Select */}
        <select
          value={value}
          onChange={onChange}
          className="
            w-full px-3 py-2 
            sm:py-2 md:py-3       /* Larger tap area on tablets */
            text-sm sm:text-base  /* Responsive font size */
            rounded-lg outline-none bg-transparent cursor-pointer appearance-none
          "
        >
          <option value="">{placeholder}</option>

          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <div className="pr-3 text-gray-500 pointer-events-none flex items-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-xs sm:text-sm mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default Select;
