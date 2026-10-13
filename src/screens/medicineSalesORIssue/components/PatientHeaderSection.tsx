import InputField from "@/components/customInputField";
import { User } from "lucide-react";
import { useState } from "react";

export default function PatientHeaderSection() {
  const [activePatientType, setActivePatientType] = useState("IPD");
  const [searchQuery, setSearchQuery] = useState("");

  const patientTypes = [
    "OPD",
    "IPD",
    "EMERGENCY",
    "DISCHARGE",
    "CASH",
    "PANEL",
    "DOCTOR",
    "STAFF",
    "OTHER",
  ];

  return (
    <div className="card p-3 bg-white border border-gray-200 rounded-lg shadow-xs space-y-3 w-full">
      {/* Top Row: Patient Types & Patient Info Box Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
        {/* 1. Patient Type Container */}
        <div className="xl:col-span-4 flex flex-col gap-1.5 card p-3 bg-white border border-gray-200 rounded-lg">
          <InputField label="Patient Type">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1">
              {patientTypes.map(type => {
                const isActive = activePatientType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setActivePatientType(type)}
                    className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition active:scale-90 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#0B5394] text-white shadow-xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </InputField>
        </div>

        {/* 2. Unified Right-Side Container for UHID Search & Patient Details */}
        <div className="xl:col-span-8 card p-3 bg-white border border-gray-200 rounded-lg flex flex-row  items-center justify-between gap-3 w-full  flex-nowrap overflow-x-auto whitespace-nowrap pb-1 [&::-webkit-scrollbar]:h-1 sm:w-auto">
          {/* 1. UHID / Patient Search */}
          <div className="flex-1 min-w-[200px]">
            <InputField label="UHID / Patient Search">
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by UHID, Name, Mobile, IP No ..."
                  className="input-field w-full"
                />
              </div>
            </InputField>
          </div>

          {/* 2. IPD No. */}
          <div className="w-[110px] shrink-0 mt-[-8px]">
            <InputField label="IPD No.">
              <input
                type="text"
                readOnly
                value="IP25000123"
                className="border border-gray-300 bg-blue-50 text-gray-900 font-bold w-full px-2 py-1.5 rounded-lg text-xs h-[44px] "
              />
            </InputField>
          </div>

          {/* 3. Bed No. */}
          <div className="w-[80px] shrink-0 mt-[-8px]">
            <InputField label="Bed No.">
              <input
                type="text"
                readOnly
                value="A-105"
                className="border border-gray-300 bg-blue-50 text-gray-900 font-bold w-full px-2 py-1.5 rounded-lg text-xs h-[44px]"
              />
            </InputField>
          </div>

          {/* 4. Patient Name */}
          <div className="w-[130px] shrink-0 mt-[-8px]">
            <InputField label="Patient Name">
              <input
                type="text"
                readOnly
                value="Ramesh Kumar"
                className="border border-gray-300 bg-blue-50 text-gray-900 font-bold w-full px-2 py-1.5 rounded-lg text-xs h-[44px]"
              />
            </InputField>
          </div>

          {/* 5. Age / Gender */}
          <div className="w-[120px] shrink-0 mt-[-8px]">
            <InputField label="Age / Gender">
              <input
                type="text"
                readOnly
                value="45 Years / Male"
                className="border border-gray-300 bg-blue-50 text-gray-900 font-bold w-full px-2 py-1.5 rounded-lg text-xs h-[44px]"
              />
            </InputField>
          </div>

          {/* 6. Patient Details Button */}
          <div className="shrink-0 pt-5 mt-[-6px]">
            <button
              onClick={() => alert("Patient Details clicked")}
              className="save-btn flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <User size={13} />
              <span>Patient Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
