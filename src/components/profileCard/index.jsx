import React, { useMemo } from "react";
import { User, MoreVertical } from "lucide-react";

const ProfileCard = ({ data }) => {
  const {
    cardTitle,
    cardId,
    cardFooterSection,
    cardLeftTop,
    cardRightTop,
    buttonSection,
    cardAvatar,
  } = data ?? {};

  //  Safely extract name (works for arrays, objects, strings)
  const userName = useMemo(() => {
    if (!cardTitle) return "";

    // Array of { label, value }
    if (Array.isArray(cardTitle) && typeof cardTitle[0] === "object") {
      return cardTitle
        .map((t) => t.value)
        .join(" ")
        .trim();
    }

    // Array of strings
    if (Array.isArray(cardTitle)) {
      return cardTitle.join(" ").trim();
    }

    // Single object { label, value }
    if (typeof cardTitle === "object") {
      return cardTitle?.value || "";
    }

    // Single string
    return String(cardTitle).trim();
  }, [cardTitle]);

  //  Safely extract cardId
  const cardIdValue = useMemo(() => {
    if (!cardId) return "001";

    // If cardId is array (new config style)
    if (Array.isArray(cardId) && typeof cardId[0] === "object") {
      return cardId.map((id) => id.value).join(" ");
    }

    // If cardId is a single object
    if (typeof cardId === "object") {
      return cardId?.value || "001";
    }

    // Fallback for primitive values
    return String(cardId);
  }, [cardId]);

  // 🧠 Button click handler
  const handleButton = (btn) => {
    switch (btn.action) {
      case "toggleActive":
        console.log("Toggling active state:", btn.action);
        break;
      case "toggleEdit":
        console.log("Editing item:", btn.action);
        break;
      default:
        console.log("Unhandled action:", btn.action);
    }
  };

  return (
    <div className="bg-white shadow-md border border-gray-200 relative hover:shadow-lg transition-all duration-300 w-full rounded-md">
      {/* 🔹 Header */}
      <div className="m-2 flex flex-row justify-between items-center">
        {/* Left */}
        <div className="p-2 m-2 flex items-center">
          <span
            className={`font-semibold text-sm px-3 py-1 rounded ${
              cardLeftTop.value === 1
                ? "text-purple-800 bg-blue-50"
                : "text-orange-500 bg-orange-100"
            }`}
          >
            {cardLeftTop.value === 1 ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Right */}
        {cardRightTop ? (
          <button className="p-2 m-2 border border-gray-300 hover:bg-gray-100 transition-colors rounded-sm">
            <MoreVertical size={20} className="text-gray-600" />
          </button>
        ) : null}
      </div>

      {/* 🔹 Avatar + Title */}
      <div className="flex flex-col items-center pb-4 m-2">
        <div className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
          {cardAvatar ? (
            <i className={`fa ${cardAvatar} text-3xl text-gray-700`}></i>
          ) : (
            <User size={40} className="text-gray-700" />
          )}
        </div>

        <p className="text-gray-500 text-sm mt-2 mb-1"># {cardIdValue}</p>
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          {userName || "Unknown"}
        </h2>
      </div>

      {/* 🔹 Info Section */}
      <div className="border-t border-gray-300 pt-1 rounded-lg p-3 mb-2 mx-2 my-2">
        <div className="grid grid-cols-3 gap-4 divide-x divide-gray-300 text-center">
          {cardFooterSection?.map((footer, idx) => (
            <div key={idx}>
              <p className="text-black-500 text-sm font-medium mb-1">
                {footer.label}
              </p>
              <p className="text-gray-500 font-semibold text-sm">
                {footer.value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Buttons */}
      <div className="flex gap-3 mt-3 mx-2 my-2">
        {buttonSection?.map((btn) => (
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
