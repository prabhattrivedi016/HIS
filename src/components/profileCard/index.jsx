import React from "react";
import { User, MoreVertical } from "lucide-react";

const ProfileCard = (data) => {
  console.log("data of grid view is ", data);
  const {
    cardTitle,
    cardId,
    cardFooterSection = [],
    cardLeftTop,
    buttonSection = [],
    cardAvatar,
    gridCardRightTop,
  } = data?.data;

  console.log("grid card right top", data?.gridCardRightTop?.label);
  //   user name
  const userName = Array.isArray(cardTitle)
    ? cardTitle.map((t) => (t?.value ? t.value : t)).join(" ")
    : typeof cardTitle === "object"
    ? cardTitle?.value || "Unknown"
    : cardTitle || "Unknown";

  //  Extract card ID safely
  const cardIdValue = Array.isArray(cardId)
    ? cardId.map((id) => (id?.value ? id.value : id)).join(" ")
    : typeof cardId === "object"
    ? cardId?.value || "001"
    : cardId || "001";

  //  Button click handler
  const handleButton = (btn) => {
    console.log(`${btn.label} clicked`);
    // you can extend this for toggle/edit actions
  };

  return (
    <div className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 w-full rounded-md">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center p-3">
        {/* Left: Status */}
        <span
          className={`font-semibold text-sm px-3 py-1 rounded ${
            cardLeftTop?.value === 1
              ? "text-green-700 bg-green-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {cardLeftTop?.value === 1 ? "Active" : "Inactive"}
        </span>

        {/* Right: Menu Button */}
        {gridCardRightTop && (
          <button className="p-2 border border-gray-300 hover:bg-gray-100 rounded-md transition">
            <MoreVertical size={18} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* 🔹 Avatar + Title */}
      <div className="flex flex-col items-center pb-4">
        <div className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
          {cardAvatar ? (
            <i className={`fa ${cardAvatar} text-3xl text-gray-700`}></i>
          ) : (
            <User size={40} className="text-gray-700" />
          )}
        </div>

        <p className="text-gray-500 text-sm mt-2 mb-1"># {cardIdValue}</p>
        <h2 className="text-xl font-bold text-gray-800 text-center">
          {userName}
        </h2>
      </div>

      {/* 🔹 Footer Info */}
      {cardFooterSection.length > 0 && (
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
      )}

      {/* 🔹 Action Buttons */}
      {buttonSection.length > 0 && (
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
      )}
    </div>
  );
};

export default ProfileCard;
