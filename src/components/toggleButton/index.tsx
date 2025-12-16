import { useEffect, useState } from "react";

const ToggleButton = ({ checked = false, disabled = false, onClick }) => {
  const [isOn, setIsOn] = useState(checked);

  // Sync internal state with parent controlled prop
  useEffect(() => {
    setIsOn(checked);
  }, [checked]);

  const handleClick = () => {
    if (disabled) return;

    const newValue = !isOn;
    setIsOn(newValue);

    // Send value to parent
    onClick?.(newValue);
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition 
        ${isOn ? "bg-blue-500" : "bg-gray-300"} 
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition 
          ${isOn ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  );
};

export default ToggleButton;
