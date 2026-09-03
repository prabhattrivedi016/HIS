import CentralPopup from "@/components/centralPopup";
import { FileText, SplitSquareVertical } from "lucide-react";

const SeparateBillButton = ({
  isOpen,
  onClose,
  buttonClickHandler,
}: {
  isOpen: boolean;
  onClose: () => void;
  buttonClickHandler: (value: string) => void;
}) => {
  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md w-full!"
      title="Billing Preference"
    >
      <div className="flex flex-col gap-4 p-1">
        <p className="text-sm text-gray-500 mb-2 leading-relaxed">
          How would you like to process this charge? Select one of the billing options below to
          proceed.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Option 1: Generate Separate Bill */}
          <button
            onClick={() => buttonClickHandler("generateSeparateBill")}
            className="flex flex-col items-center justify-between text-center p-5 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all duration-300 group"
          >
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300 mb-3">
              <SplitSquareVertical size={24} />
            </div>
            <div>
              <span className="block text-sm font-semibold text-gray-800 mb-1">Separate Bill</span>
              {/* <span className="block text-xs text-gray-500 px-1 leading-normal">
                Generate a new, separate invoice for this service.
              </span> */}
            </div>
          </button>

          {/* Option 2: Add In Main Bill */}
          <button
            onClick={() => buttonClickHandler("addInMainBill")}
            className="flex flex-col items-center justify-between text-center p-5 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all duration-300 group"
          >
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300 mb-3">
              <FileText size={24} />
            </div>
            <div>
              <span className="block text-sm font-semibold text-gray-800 mb-1">Main Bill</span>
              {/* <span className="block text-xs text-gray-500 px-1 leading-normal">
                Add this service to the patient's primary bill.
              </span> */}
            </div>
          </button>
        </div>
      </div>
    </CentralPopup>
  );
};

export default SeparateBillButton;
