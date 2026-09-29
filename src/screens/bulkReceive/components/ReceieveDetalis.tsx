import InputField from "@/components/customInputField";
import { Bookmark, Check } from "lucide-react";
import { useState } from "react";

export default function ReceiveDetails() {
  const [receiveData, setReceiveData] = useState({
    receivedBy: "Admin",
    receiveDateTime: "2026-09-23T11:24",
    remarks: "",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setReceiveData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmReceive = () => {
    alert(
      `Confirm Receive clicked!\n- Received By: ${receiveData.receivedBy}\n- Date & Time: ${receiveData.receiveDateTime}\n- Remarks: ${receiveData.remarks || "None"}`
    );
  };

  const handleSaveDraft = () => {
    alert("Saved as Draft successfully!");
  };

  return (
    <div className="card flex flex-col lg:flex-row gap-3 items-stretch justify-between  p-3 sm:p-4  my-3">
      {/* =====================================================
            DIV 1: RECEIVE DETAILS (Received By, Date & Time, Remarks)
            ===================================================== */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-3 lg:w-[60%] ">
        <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide">Receive Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Received By Selection */}
          <div className="flex flex-col">
            <InputField label="Received By">
              <div className="relative flex items-center">
                <select
                  name="receivedBy"
                  value={receiveData.receivedBy}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="Admin">Admin</option>
                  <option value="Dr. Sharma">Dr. Sharma</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Pharmacist">Pharmacist</option>
                </select>
              </div>
            </InputField>
          </div>

          {/* Receive Date & Time */}
          <div className="flex flex-col">
            <InputField label="Receive Date & Time">
              <div className="relative flex items-center">
                <input
                  type="datetime-local"
                  name="receiveDateTime"
                  value={receiveData.receiveDateTime}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </InputField>
          </div>

          {/* Remarks (Optional) */}
          <div className="flex flex-col">
            <InputField label="Remarks (Optional)">
              <input
                type="text"
                name="remarks"
                value={receiveData.remarks}
                onChange={handleChange}
                placeholder="Enter remarks..."
                className="input-field"
              />
            </InputField>
          </div>
        </div>
      </div>

      {/* =====================================================
            DIV 2: SUMMARY CARD
            ===================================================== */}
      <div className="bg-blue-50 border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between shrink-0 lg:w-[400px]">
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Summary</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-white p-2 rounded-lg border border-gray-100">
            <div className="text-[10px] font-semibold text-gray-500">Total Samples</div>
            <div className="text-sm font-extrabold text-[#123b70]">12</div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-100 ">
            <div className="text-[10px] font-semibold text-gray-500 ">Departments</div>
            <div className="text-sm font-extrabold text-[#123b70]">3</div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-100">
            <div className="text-[10px] font-semibold text-gray-500">Tests</div>
            <div className="text-sm font-extrabold text-[#123b70]">13</div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-100">
            <div className="text-[10px] font-semibold text-gray-500">Priority (High)</div>
            <div className="text-sm font-extrabold text-rose-600">2</div>
          </div>
        </div>
      </div>

      {/* ===================================================
            DIV 3: Action Buttons (Confirm Receive & Save as Draft) 
            =======================================================*/}
      <div className="flex flex-col sm:flex-row lg:flex-col justify-between gap-2 shrink-0">
        <button
          onClick={handleConfirmReceive}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
        >
          <Check size={16} strokeWidth={3} />
          <span>Confirm Receive (12)</span>
        </button>
        <button
          onClick={handleSaveDraft}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
        >
          <Bookmark size={15} className="text-gray-500" />
          <span>Save as Draft</span>
        </button>
      </div>
    </div>
  );
}
