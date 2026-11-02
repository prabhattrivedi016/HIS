import { useState } from "react";

const QUICK_TAGS = [
  {
    name: "Normal Study",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  {
    name: "Suggestive of Infection",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  {
    name: "Correlate Clinically",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  {
    name: "Repeat Sample",
    color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  },
  {
    name: "Insufficient Sample",
    color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  },
  {
    name: "Hemolysed Sample",
    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  },
];

const TABS = ["Comments & Interpretation", "Predefined Comments", "Technical Notes"];

const CommentBox = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const [techComment, setTechComment] = useState("Sample is adequate. Result verified.");

  const [pathoComment, setPathoComment] = useState(
    "CBC shows elevated TLC with neutrophilia, suggestive of infection. Correlate clinically."
  );

  // Append a quick tag without adding duplicate tags.
  const handleTagClick = tag => {
    setTechComment(prev => {
      const sentence = `${tag}.`;

      if (prev.includes(sentence)) return prev;

      return prev.trim() ? `${prev.trim()} ${sentence}` : sentence;
    });
  };

  const handleClearComments = () => {
    setTechComment("");
    setPathoComment("");
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-3 shadow-sm mt-1">
      {/* Tabs */}
      <div className="flex items-center gap-5 overflow-x-auto whitespace-nowrap border-b border-gray-100 mb-3">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-semibold pb-2 border-b-2 transition-colors shrink-0 ${
              activeTab === tab
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Comments & Interpretation */}
      {activeTab === "Comments & Interpretation" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Technician Comment */}
            <div className="space-y-1">
              <label htmlFor="techComment" className="text-[11px] font-bold text-gray-700">
                Technician Comment
              </label>

              <textarea
                id="techComment"
                rows={3}
                value={techComment}
                onChange={e => setTechComment(e.target.value)}
                placeholder="Enter technician comment..."
                className="w-full resize-y min-h-[65px] bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Pathologist Interpretation */}
            <div className="space-y-1">
              <label htmlFor="pathoComment" className="text-[11px] font-bold text-gray-700">
                Interpretation (Pathologist)
              </label>

              <textarea
                id="pathoComment"
                rows={3}
                value={pathoComment}
                onChange={e => setPathoComment(e.target.value)}
                placeholder="Enter pathologist interpretation..."
                className="w-full resize-y min-h-[65px] bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Predefined Comments */}
      {activeTab === "Predefined Comments" && (
        <div className="text-xs text-gray-500 py-4 text-center">
          Predefined comments can be configured here.
        </div>
      )}

      {/* Technical Notes */}
      {activeTab === "Technical Notes" && (
        <div className="text-xs text-gray-500 py-4 text-center">
          Technical notes can be configured here.
        </div>
      )}
    </div>
  );
};

export default CommentBox;
