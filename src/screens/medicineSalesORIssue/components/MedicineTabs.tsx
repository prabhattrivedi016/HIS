import { useState } from "react";
import {
    Tally1,
    Tally2,
    Tally3,
    Tally4,
    Tally5,
    FileText,
    FileCheck,
} from "lucide-react";

export default function MedicineTabs() {
    const [activeTab, setActiveTab] = useState("General Information");

    const tabsData = [
        { name: "Medicine Issue", icon: Tally1 },
        { name: "Indent Details", icon: Tally2 },
        { name: "Previous Issues", icon: Tally3 },
        { name: "Prescriptions History", icon: Tally4 },
        { name: "Patient Medicine", icon: Tally5 },
        { name: "Billing & Payment", icon: FileCheck },
        { name: "Remarks/Instruction", icon: FileText },
        
    ];

    return (
        <div className="card mt-1">
            <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">
                {tabsData.map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.name;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isActive
                                ? "bg-[#0B5394] text-white shadow-xs"
                                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                                }`}
                        >
                            <IconComponent size={14} />
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}