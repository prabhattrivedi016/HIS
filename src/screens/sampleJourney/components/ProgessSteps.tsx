import {
  Barcode,
  CheckCircle,
  Cog,
  Droplet,
  Eye,
  FileCheck,
  FileText,
  Inbox,
  Loader,
  ShieldCheck,
} from "lucide-react";

export default function ProgressSteps() {
  const steps = [
    {
      id: 1,
      title: "Registration",
      icon: FileText,
      date: "23-09-2026 09:10 AM",
      by: "Anita Singh",
    },
    {
      id: 2,
      title: "Sample Collection",
      icon: Droplet,
      date: "23-09-2026 09:15 AM",
      by: "Ravi Kumar",
    },
    {
      id: 3,
      title: "Sample Received in Lab",
      icon: Inbox,
      date: "23-09-2026 09:20 AM",
      by: "Pooja Verma",
    },
    {
      id: 4,
      title: "Accessioned",
      icon: Barcode,
      date: "23-09-2026 09:22 AM",
      by: "Amit Yadav",
    },
    {
      id: 5,
      title: "Processing",
      icon: Cog,
      date: "23-09-2026 10:15 AM",
      by: "Analyzer (Hematology)",
    },
    {
      id: 6,
      title: "Result Entry & Validation",
      icon: CheckCircle,
      date: "23-09-2026 11:05 AM",
      by: "Sneha Patel",
    },
    {
      id: 7,
      title: "Approved",
      icon: ShieldCheck,
      date: "23-09-2026 11:20 AM",
      by: "Dr. P. Singh",
    },
    {
      id: 8,
      title: "",
      icon: Loader,
      date: "23-09-2026 11:22 AM",
      by: "System Dispatch",
      isPendingIcon: true,
    },
    {
      id: 9,
      title: "Reported",
      icon: FileCheck,
      date: "23-09-2026 11:24 AM",
      by: "Patient Portal / HIS",
    },
  ];

  const handleEyeClick = step => {
    alert(`Step ${step.id}: ${step.title}\nDate & Time: ${step.date}\nPerformed By: ${step.by}`);
  };

  return (
    <div className="card mt-2">
      <div className="min-w-[1100px] flex items-center justify-between relative px-6 py-6">
        {/* Continuous Green Connecting Line behind nodes */}
        <div className="absolute left-12 right-12 top-[35%] -translate-y-1/2 h-[3px] bg-emerald-500 z-0"></div>

        {steps.map(step => {
          const StepIcon = step.icon;
          const isReported = step.id === 9;
          const isLoaderStep = step.id === 8;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              {/* Step Circle with Icon */}
              <div
                className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform ${
                  isReported ? "bg-blue-600" : "bg-emerald-600"
                }`}
              >
                <StepIcon size={20} />
              </div>

              {/* Step Title Label */}
              <div className="mt-2.5 text-center">
                <div className="text-[11px] font-bold text-gray-800 whitespace-nowrap min-h-[16px]">
                  {step.title ? `${step.id}. ${step.title}` : ""}
                </div>
              </div>

              {/* Eye Icon Button Placed Below the Step (Hidden for Loader step) */}
              {!isLoaderStep ? (
                <button
                  onClick={() => handleEyeClick(step)}
                  className="mt-1.5 w-6 h-6 bg-white text-blue-600 border border-blue-300 rounded-full flex items-center justify-center shadow-xs hover:bg-blue-50 cursor-pointer transition-all active:scale-95"
                  title="View Step Details"
                >
                  <Eye size={12} />
                </button>
              ) : (
                <div className="mt-1.5 h-6"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
