import { Bell } from 'lucide-react';
import React from 'react';

const LabInfoRightChart = () => {
    return (
        <div className="lg:col-span-3 space-y-2 ">

            {/* ================= RESULT TREND GRAPHICAL PANEL ================= */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex  justify-between flex-col">
                    <span className="text-[15px] font-bold text-blue-800">Result Trend (Graphical)</span>
                    <select className="bg-gray-50 border border-gray-200 rounded text-[10px] px-2 py-2 text-gray-700 font-semibold focus:outline-none cursor-pointer w-[73%] text-[12px] ">
                        <option>Hemoglobin (g/dL)</option>
                    </select>
                </div>

                {/* Dot-Line Graph Box matching reference image */}
                <div className="h-32  border border-dashed border-gray-200 rounded-lg p-2 flex flex-col justify-between relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-[1px] bg-gray-200"></div>
                    </div>

                    {/* SVG Line & Dots Chart */}
                    <div className="relative h-20 w-full mt-1">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
                            {/* Connecting Line */}
                            <polyline
                                fill="none"
                                stroke="#0284c7"
                                strokeWidth="2"
                                points="15,45 70,35 130,20 185,10"
                            />
                            {/* Data Points */}
                            <circle cx="15" cy="45" r="3.5" className="fill-blue-600 stroke-white stroke-2" />
                            <circle cx="70" cy="35" r="3.5" className="fill-blue-600 stroke-white stroke-2" />
                            <circle cx="130" cy="20" r="3.5" className="fill-blue-600 stroke-white stroke-2" />
                            <circle cx="185" cy="10" r="3.5" className="fill-blue-600 stroke-white stroke-2" />

                            {/* Data Values Text on top of points */}
                            <text x="15" y="36" fontSize="8" fill="#1e293b" fontWeight="bold" textAnchor="middle">11.8</text>
                            <text x="70" y="26" fontSize="8" fill="#1e293b" fontWeight="bold" textAnchor="middle">12.1</text>
                            <text x="130" y="11" fontSize="8" fill="#1e293b" fontWeight="bold" textAnchor="middle">12.8</text>
                            <text x="185" y="2" fontSize="8" fill="#1e293b" fontWeight="bold" textAnchor="middle">13.2</text>
                        </svg>
                    </div>

                    {/* X-Axis Dates */}
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500 px-1 border-t border-gray-200 pt-1">
                        <span>12-Dec</span>
                        <span>19-Dec</span>
                        <span>02-Jan</span>
                        <span>10-Jan</span>
                    </div>
                </div>
            </div>

            {/* ================= REFERENCE RANGE DETAILS ================= */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-4 text-xs shadow-2xs">
                <span className="font-bold text-blue-800 block border-b border-gray-100 pb-1 text-[15px]">Reference Range Details</span>

                <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-4 pt-2 ">
                    <span className="text-gray-600">Age / Gender</span>
                    <span className="font-bold text-gray-900">:</span>
                    <span className="font-bold text-gray-900">Adult / Male</span>

                    <span className="text-gray-600">Method</span>
                    <span className="font-bold text-gray-900">:</span>
                    <span className="font-bold text-gray-900">Photometry</span>

                    <span className="text-gray-600">Reference Range</span>
                    <span className="font-bold text-gray-900">:</span>
                    <span className="font-bold text-gray-900">13.0 - 17.0 g/dL</span>

                    <span className="text-gray-600">Critical Low</span>
                    <span className="font-bold text-gray-900">:</span>
                    <span className="font-bold text-rose-600">&lt; 7.0</span>

                    <span className="text-gray-600">Critical High</span>
                    <span className="font-bold text-gray-900">:</span>
                    <span className="font-bold text-rose-600">&gt; 20.0</span>

                    <span className="text-gray-600">Delta Check</span>
                    <span className="font-bold text-gray-900">:</span>
                    <span className="font-bold text-gray-900">± 25%</span>

                    <span className="text-gray-600">Panic Value</span>
                    <span className="font-bold text-gray-900">:</span>
                    <span className="font-bold text-gray-900">&lt; 5.0 or &gt; 22.0</span>
                </div>
            </div>

            {/* ================= CRITICAL / ALERT MESSAGE ================= */}
            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 space-y-4  shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold">
                    <Bell className="w-5 h-5 text-red-500" />
                    <span className='text-red-500'>Critical / Alert Message</span>
                </div>
                <div className="space-y-5 pl-1 text-[12px] text-black-800 font-bold py-3">
                    <div>• TLC value is above normal range.</div>
                    <div>• Please verify and confirm.</div>
                    <div>• Previous result difference is 11.6%.</div>
                    <div>• No panic value detected.</div>
                </div>
            </div>

        </div>
    );
};

export default LabInfoRightChart;