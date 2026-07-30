import React, { useEffect, useState } from "react";

const RightSideDrawer = ({
  isOpen,
  onClose,
  buttonTitle,
  children,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  buttonTitle: string;
  children: React.ReactNode;
  className: string;
}) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsAnimated(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimated(false);
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 
          transition-opacity duration-300 ease-out ${isAnimated ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[700px] lg:w-[800px] shadow-xl z-50 transition-transform duration-300 ease-in-out overflow-x-hidden bg-gray-100 ${className} ${isAnimated ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className=" flex flex-row justify-between items-center p-1 ml-1 border-b">
            <h2 className="text-lg font-semibold text-gray-800">{buttonTitle}</h2>
            <button
              onClick={onClose}
              className="text-gray-600  m-2  hover:text-black text-4xl leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default RightSideDrawer;
