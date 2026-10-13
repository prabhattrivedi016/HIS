import InputField from "@/components/customInputField";
import { Building2, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";

export default function GRNDetails() {
  const [IsYes, SetIsYes] = useState<"yes" | "no">("no");

  const ToggleHide = () => {
    SetIsYes(current => (current === "yes" ? "no" : "yes"));
  };

  return (
    <div className="card bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-2xs mt-2 w-full">
      {/* Header Title */}
      <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-gray-100 text-blue-900 font-bold text-xs">
        <FileText size={15} className="text-blue-600" />
        <span>GRN Details</span>
      </div>

      {/* Main Grid: Left GRN Form Fields | Vertical Divider | Right Vendor Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Side: GRN Form Fields in 3 columns with labels on top */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-end">
          {/* GRN No. */}
          <div className={`flex flex-col gap-1 ${IsYes === "yes" ? "hidden" : ""}`}>
            <InputField label="GRN No.">
              <div className="relative flex items-center">
                <input
                  type="text"
                  defaultValue="GRN-2026-10-05-001"
                  className="input-field w-full"
                />
              </div>
            </InputField>
          </div>

          {/* Store */}
          <div className="flex flex-col gap-1">
            <InputField label="Store" required>
              <select className="input-field cursor-pointer w-full">
                <option>Main Store</option>
                <option>Emergency Store</option>
              </select>
            </InputField>
          </div>

          {/* GRN Date */}
          <div className={`flex flex-col gap-1 ${IsYes === "yes" ? "hidden" : ""}`}>
            <InputField label="GRN Date" required>
              <div className="relative flex items-center">
                <input type="text" defaultValue="05-10-2026" className="input-field w-full" />
              </div>
            </InputField>
          </div>

          {/* Store Location */}
          <div className="flex flex-col gap-1">
            <InputField label="Store Location">
              <select className="input-field cursor-pointer w-full">
                <option>Central Store - Ground Floor</option>
                <option>Warehouse B</option>
              </select>
            </InputField>
          </div>

          {/* PO No. */}
          <div className={`flex flex-col gap-1 ${IsYes === "yes" ? "hidden" : ""}`}>
            <InputField label="PO No.">
              <div className="relative flex items-center">
                <input type="text" defaultValue="PO-2026-0008" className="input-field w-full" />
              </div>
            </InputField>
          </div>

          {/* Bill Type */}
          <div className="flex flex-col gap-1">
            <InputField label="Bill Type">
              <select className="input-field cursor-pointer w-full">
                <option>Original</option>
                <option>Duplicate</option>
              </select>
            </InputField>
          </div>

          {/* Vendor */}
          <div className="flex flex-col gap-1">
            <InputField label="Vendor" required>
              <div className="relative flex items-center">
                <input
                  type="text"
                  defaultValue="MedLife Healthcare Pvt Ltd"
                  className="input-field w-full"
                />
              </div>
            </InputField>
          </div>

          {/* Payment Terms */}
          <div className="flex flex-col gap-1">
            <InputField label="Payment Terms">
              <select className="input-field cursor-pointer w-full">
                <option>30 Days</option>
                <option>15 Days</option>
                <option>Immediate</option>
              </select>
            </InputField>
          </div>

          {/* Invoice No. */}
          <div className={`flex flex-col gap-1 ${IsYes === "yes" ? "hidden" : ""}`}>
            <InputField label="Invoice No." required>
              <input type="text" defaultValue="INV-258741" className="input-field w-full" />
            </InputField>
          </div>

          {/* Reference */}
          <div className="flex flex-col gap-1">
            <InputField label="Reference">
              <select className="input-field cursor-pointer w-full">
                <option>-Select-</option>
                <option>Ref 1</option>
              </select>
            </InputField>
          </div>

          {/* Invoice Date */}
          <div className="flex flex-col gap-1">
            <InputField label={IsYes === "yes" ? "Challan Date" : "Invoice Date"} required>
              <div className="relative flex items-center">
                <input type="text" defaultValue="05-10-2026" className="input-field w-full" />
              </div>
            </InputField>
          </div>

          {/* Challan Toggle */}
          <div className="flex flex-col gap-1">
            <InputField label="Challan">
              <button
                type="button"
                role="switch"
                aria-checked={IsYes === "yes"}
                onClick={ToggleHide}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  IsYes === "yes" ? "bg-[#0B5394]" : "bg-gray-300 "
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                    IsYes === "yes" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-[11px] text-gray-600 opacity-0">{IsYes}</span>
            </InputField>
          </div>
        </div>

        {/* Right Side: Vendor Details Card */}
        <div className="lg:col-span-4 lg:border-l lg:border-gray-200 lg:pl-4 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                <Building2 size={14} className="text-blue-600" />
                <span>Vendor Details</span>
              </div>
              <button
                onClick={() => alert("View Vendor clicked")}
                className="bg-[#0B5394] hover:bg-blue-900 text-white px-2 py-1.5 rounded-md text-[10px] flex items-center gap-1 cursor-pointer transition active:scale-90 shadow-2xs shrink-0"
              >
                <ExternalLink size={10} />
                <span>View Vendor</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start">
              <div className="flex items-center w-20 h-20 sm:w-22 sm:h-22 bg-blue-50 justify-center rounded-sm shrink-0">
                <Building2 size={34} className="text-blue-900" />
              </div>
              <div className="space-y-1.5 text-[12px] sm:text-[13px] text-gray-700 pt-1 w-full text-center sm:text-left">
                <div className="font-bold text-gray-900">MedLife Healthcare Pvt Ltd</div>
                <div className="text-gray-600 leading-tight">
                  A-45, Industrial Area, Lucknow - 226010
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-gray-600">
                  <span className="font-medium text-gray-500">Contact :</span>
                  <span className="font-bold text-gray-900">9876543210</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-gray-600">
                  <span className="font-medium text-gray-500">GST No. :</span>
                  <span className="font-bold text-gray-900">09ABCDE1234F1Z5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
