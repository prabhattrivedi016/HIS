import { createPortal } from "react-dom";
import { useScrollLock } from "../../hooks/useScrollLock";

type CentralPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  closeOnOutsideClick?: boolean;
};

const CentralPopup = ({
  isOpen,
  onClose,
  children,
  className = "",
  title = "Central Popup",
  closeOnOutsideClick = true,
}: CentralPopupProps) => {
  useScrollLock(isOpen);
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />

      {/* Popup */}
      <div
        className={`relative z-10 w-[30%]  max-w-2xl! max-h-[calc(100vh-20px)] overflow-auto rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 ${className}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="truncate text-lg font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="text-3xl leading-none text-gray-600 transition hover:text-black"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
};

export default CentralPopup;
