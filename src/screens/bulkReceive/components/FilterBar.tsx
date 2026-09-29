import { Barcode } from "lucide-react";
import { useState } from "react";

export default function FilterBar() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, label: "Select Samples" },
    { id: 2, label: "Verify Details" },
    { id: 3, label: "Assign Tests & Department" },
    { id: 4, label: "Confirm Receive" },
  ];

  const handleScanAutoFill = () => {
    alert("Scan & Auto Fill clicked");
  };

  return (
    <div className="card">
      {/* ================= TOP HEADER ROW ================= */}

      {/* ================= 4-STEP PROGRESS BAR ================= */}
      <div className="overflow-x-auto py-2 border border-gray-200 px-3 rounded-lg bg-blue-50">
        <div className="flex items-center justify-between min-w-[700px] sm:min-w-0">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div
                  onClick={() => setCurrentStep(step.id)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  {/* Numbered Circle with Blue BG & White Text */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isActive || isCompleted
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.id}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isActive ? "text-[#123b70] font-bold" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Horizontal Connecting Line between steps */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-[2px] bg-gray-200 mx-3 min-w-[30px]" />
                )}
              </div>
            );
          })}
          {/* RIGHT: SCAN & AUTO FILL BUTTON (GREEN BG) */}
          <button
            onClick={handleScanAutoFill}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
          >
            <Barcode size={16} strokeWidth={2} />
            <span>Scan & Auto Fill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
