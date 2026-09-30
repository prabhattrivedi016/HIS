import React, { useState } from 'react';

const CommentBox = () => {
    const [resultStatus, setResultStatus] = useState("Verify (Technician)");
    const [techComment, setTechComment] = useState("Sample is adequate. Result verified.");
    const [pathoComment, setPathoComment] = useState("CBC shows elevated TLC with neutrophilia, suggestive of infection. Correlate clinically.");

    // 6 Quick tags with specific reference colors (Green, Yellow, Blue, Orange, Red, Purple)
    const quickTags = [
        { name: "Normal Study", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
        { name: "Suggestive of Infection", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
        { name: "Correlate Clinically", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
        { name: "Repeat Sample", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" },
        { name: "Insufficient Sample", color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
        { name: "Hemolysed Sample", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" }
    ];

    const handleTagClick = (tag) => {
        setTechComment((prev) => prev ? `${prev} ${tag}.` : `${tag}.`);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 grid grid-cols-1 lg:grid-cols-12 gap-4 shadow-2xs mt-1">

            {/* LEFT COLUMN: Comments & Interpretation (9 Cols) */}
            <div className="lg:col-span-9 space-y-2.5">

                {/* Comment Sub-tabs */}
                <div className="flex flex-nowrap items-center justify-between bg-blue-50/60  px-2 py-2 rounded-xl overflow-x-auto gap-2 whitespace-nowrap no-scrollbar">
                    <span className="text-blue-600 border-b-2 border-blue-600 pb-1 cursor-pointer">Comments & Interpretation</span>
                    <span className="text-gray-500 hover:text-gray-800 pb-1 cursor-pointer ml-3">Predefined Comments</span>
                    <span className="text-gray-500 hover:text-gray-800 pb-1 cursor-pointer ml-3">Technical Notes</span>
                    <span className="text-gray-500 hover:text-gray-800 pb-1 cursor-pointer ml-3">History / Log</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Technician Comment */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-700">Technician Comment</span>
                        </div>
                        <textarea
                            rows="2"
                            value={techComment}
                            onChange={(e) => setTechComment(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 text-gray-800 focus:outline-none focus:border-blue-500"
                        ></textarea>
                    </div>

                    {/* Interpretation (Pathologist) */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-700">Interpretation (Pathologist)</span>
                        </div>
                        <textarea
                            rows="2"
                            value={pathoComment}
                            onChange={(e) => setPathoComment(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 text-gray-800 focus:outline-none focus:border-blue-500"
                        ></textarea>
                    </div>
                </div>

                {/* Quick Suggestion Tags - X-Axis Scrollable & Colored */}
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pt-1 pb-1">
                    {quickTags.map((tag) => (
                        <button
                            key={tag.name}
                            onClick={() => handleTagClick(tag.name)}
                            className={`text-[10px] font-bold px-3 py-1 rounded-md border transition-all cursor-pointer shrink-0 shadow-2xs ${tag.color}`}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT COLUMN: Result Status Radio Selection (3 Cols) */}
            <div className="lg:col-span-3 space-y-3 border-t lg:border-t-0 lg:border-l border-gray-200 pt-3 lg:pt-0 lg:pl-4">
                <span className="text-[15px] font-bold text-blue-800 block">Result Status</span>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs font-semibold text-gray-700 pt-1">
                    {[
                        "Save as Draft",
                        "Verify (Technician)",
                        "Authorize (Pathologist)",
                        "Hold Result",
                        "Reject Sample",
                    ].map((statusOption) => (
                        <label
                            key={statusOption}
                            className="flex items-center gap-2 cursor-pointer select-none"
                        >
                            <input
                                type="radio"
                                name="resultStatusRadio"
                                checked={resultStatus === statusOption}
                                onChange={() => setResultStatus(statusOption)}
                                className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span
                                className={
                                    resultStatus === statusOption
                                        ? "text-blue-900 font-bold"
                                        : "text-gray-600"
                                }
                            >
                                {statusOption}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default CommentBox;