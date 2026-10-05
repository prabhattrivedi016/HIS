import InputField from "@/components/customInputField";
import { BookmarkCheck, Printer, Send } from "lucide-react";
import { useState } from "react";

export default function SendDetailsSection() {
  const [formData, setFormData] = useState({
    outsourceLaboratory: "MediScan Labs",
    expectedTat: "3",
    courierMode: "Blue Dart",
    trackingNumber: "BD987654321",
    dispatchDate: "2026-09-28",
    expectedReportDate: "2026-10-01",
    remarks: "",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full mt-3">
      <div className="card p-3">
        {/* Section Header */}
        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide pb-2 mb-3 border-b border-gray-200">
          <Send size={15} className="text-blue-600" />
          <span>Send Details</span>
        </div>

        {/* 6 Inputs Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          {/* 1. Outsource Laboratory */}
          <div className="flex flex-col gap-1">
            <InputField label="Outsource Laboratory *">
              <select
                name="outsourceLaboratory"
                value={formData.outsourceLaboratory}
                onChange={handleChange}
                className="input-field"
              >
                <option value="MediScan Labs">MediScan Labs</option>
                <option value="Thyrocare">Thyrocare</option>
                <option value="Metropolis">Metropolis</option>
              </select>
            </InputField>
          </div>

          {/* 2. Expected TAT (Days) */}
          <div className="flex flex-col gap-1">
            <InputField label="Expected TAT (Days)">
              <input
                type="text"
                name="expectedTat"
                value={formData.expectedTat}
                onChange={handleChange}
                className="input-field"
              />
            </InputField>
          </div>

          {/* 3. Courier / Transport Mode */}
          <div className="flex flex-col gap-1">
            <InputField label="Courier / Transport Mode">
              <select
                name="courierMode"
                value={formData.courierMode}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Blue Dart">Blue Dart</option>
                <option value="DHL">DHL</option>
                <option value="Hand Delivery">Hand Delivery</option>
              </select>
            </InputField>
          </div>

          {/* 4. Tracking Number */}
          <div className="flex flex-col gap-1">
            <InputField label="Tracking Number">
              <input
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter Tracking No."
              />
            </InputField>
          </div>

          {/* 5. Dispatch Date */}
          <div className="flex flex-col gap-1">
            <InputField label="Dispatch Date">
              <input
                type="date"
                name="dispatchDate"
                value={formData.dispatchDate}
                onChange={handleChange}
                className="input-field"
              />
            </InputField>
          </div>

          {/* 6. Expected Report Date */}
          <div className="flex flex-col gap-1">
            <InputField label="Expected Report Date">
              <input
                type="date"
                name="expectedReportDate"
                value={formData.expectedReportDate}
                onChange={handleChange}
                className="input-field"
              />
            </InputField>
          </div>
        </div>

        {/* Remarks & Action Buttons Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-2 border-t border-gray-200">
          {/* Remarks Field */}
          <div className="lg:col-span-7 flex flex-col gap-1">
            <InputField label="Remarks">
              <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter remarks..."
                className="input-field"
              />
            </InputField>
          </div>

          {/* All 3 Action Buttons */}
          <div className="lg:col-span-5 flex items-center justify-end gap-2 flex-wrap mt-5">
            <button
              onClick={() => alert("Print Requisition clicked")}
              className="save-btn flex justify-between items-center gap-1"
            >
              <Printer size={13} />
              <span>Print Requisition</span>
            </button>
            <button
              onClick={() => alert("Save Draft clicked")}
              className="save-btn flex justify-between items-center gap-1"
            >
              <BookmarkCheck size={13} />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => alert("Send Outsource clicked")}
              className="save-btn flex justify-between items-center gap-1"
            >
              <Send size={13} />
              <span>Send Outsource</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
