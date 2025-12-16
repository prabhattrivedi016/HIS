import React, { useState } from "react";

const IconDropdown = ({ faIcons, value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="border rounded-lg p-2 flex items-center justify-between cursor-pointer bg-white"
      >
        {value ? (
          <div className="flex items-center gap-2">
            <i className={`${value.iconClass} text-lg`} />
            <span>{value.iconName}</span>
          </div>
        ) : (
          <span className="text-gray-500">Select Icon</span>
        )}
        <span>▾</span>
      </div>

      {open && (
        <div className="absolute left-0 right-0 bg-white shadow-lg border rounded-lg mt-1 max-h-60 overflow-y-auto z-50">
          {faIcons.map(icon => (
            <div
              key={icon.id}
              onClick={() => {
                onChange(icon);
                setOpen(false);
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              <i className={`${icon.iconClass} text-lg`} />
              <span>{icon.iconName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(IconDropdown);
