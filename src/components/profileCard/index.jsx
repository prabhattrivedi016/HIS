import React from "react";
import { User, MoreVertical } from "lucide-react";

const ProfileCard = ({ data }) => {
  const {
    cardTitle,
    cardId,
    cardFooterSection = [],
    cardLeftTop,
    buttonSection = [],
    cardAvatar,
    cardRightTop,
  } = data || {};

  // Extract name and ID safely
  const userName =
    typeof cardTitle === "object"
      ? cardTitle?.value
      : Array.isArray(cardTitle)
      ? cardTitle.join(" ")
      : cardTitle || "Unknown";

  const cardIdValue =
    typeof cardId === "object" ? cardId?.value : cardId || "001";

  // Handle button click
  const handleButton = (btn) => {
    console.log(`${btn.label} clicked`);
  };

  return (
    <div className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 w-full rounded-md">
      {/* Header */}
      <div className="flex justify-between items-center p-3">
        {/* Left status */}
        <span
          className={`font-semibold text-sm px-3 py-1 rounded ${
            cardLeftTop?.value === 1
              ? "text-purple-800 bg-blue-50"
              : "text-orange-500 bg-orange-100"
          }`}
        >
          {cardLeftTop?.value === 1 ? "Active" : "Inactive"}
        </span>

        {/* Right menu button (conditionally rendered) */}
        {cardRightTop && (
          <button className="p-2 border border-gray-300 hover:bg-gray-100 rounded-sm transition">
            <MoreVertical size={18} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Avatar + Title */}
      <div className="flex flex-col items-center pb-4">
        <div className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
          {cardAvatar ? (
            <i className={`fa ${cardAvatar} text-3xl text-gray-700`}></i>
          ) : (
            <User size={40} className="text-gray-700" />
          )}
        </div>

        <p className="text-gray-500 text-sm mt-2 mb-1"># {cardIdValue}</p>
        <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 p-3">
        <div className="grid grid-cols-3 gap-4 text-center">
          {cardFooterSection.map((footer, idx) => (
            <div key={idx}>
              <p className="text-gray-500 text-xs">{footer.label}</p>
              <p className="text-gray-800 text-sm font-medium">
                {footer.value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 p-3">
        {buttonSection.map((btn) => (
          <button
            key={btn.label}
            style={{ backgroundColor: btn.color }}
            className="flex-1 text-white py-2 rounded-lg font-medium hover:opacity-80 transition"
            onClick={() => handleButton(btn)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileCard;
