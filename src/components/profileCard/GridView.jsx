import { MoreVertical, User } from "lucide-react";
import { useEffect, useState } from "react";

const GridView = ({ data, onStatusChange, openDrawer, buttonTitle, drawerTitle }) => {
  const {
    cardLeftTop = [],
    cardRightTop = [],
    cardAvatar,
    cardId = [],
    cardTitle = [],
    cardFooter = [],
    buttonSection = [],
    id,
  } = data ?? {};

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cardTitleName = Array.isArray(cardTitle)
    ? cardTitle?.map(t => t?.value).join(" ")
    : "Unknown";

  const cardIdValue = Array.isArray(cardId) ? cardId?.map(t => t?.value) : "-";

  const getButtonLlabel = btnLabel => {
    switch (btnLabel) {
      case "Active": {
        return cardLeftTop[0]?.value === 1 ? "Inactive" : "Active";
      }
      default:
        return btnLabel;
    }
  };

  // handle click
  const handleButtonClick = btnAction => {
    switch (btnAction) {
      case "gridToggleActive": {
        return onStatusChange({ isActive: cardLeftTop[0]?.value === 1 ? 0 : 1, userId: id });
      }

      case "toggleActive": {
        return onStatusChange({ isActive: cardLeftTop[0]?.value === 1 ? 0 : 1, roleId: id });
      }

      case "gridToggleEdit": {
        buttonTitle("Update User");
        drawerTitle("Update Existing User");
        openDrawer(id);

        return;
      }
      case "toggleEdit": {
        buttonTitle("Update Role");
        drawerTitle("Update Existing Role");
        openDrawer(id);
        return;
      }
    }
  };

  // Toggle menu
  const toggleMenu = e => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  // Close menu when clicked outside
  useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col transition hover:shadow-lg min-h-[260px]">
      <div className="flex justify-between items-center mb-3">
        <span
          className={`font-semibold text-xs px-3 py-1 rounded ${
            cardLeftTop[0]?.value === 1 ? "text-green-700 bg-green-100" : "text-red-600 bg-red-100"
          }`}
        >
          {cardLeftTop[0]?.value === 1 ? "Active" : "Inactive"}
        </span>

        {cardRightTop && (
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-md transition" onClick={toggleMenu}>
              <MoreVertical size={16} className="text-gray-600" />
            </button>

            {isMenuOpen && (
              <ul
                className="absolute right-0 mt-2 bg-white rounded-md shadow-md w-32 text-sm z-50"
                onClick={e => e.stopPropagation()}
              >
                <li>
                  <button
                    onClick={() => alert(`View history for role ${id}`)}
                    className="w-full text-left px-4 py-2 border border-gray-200 hover:bg-blue-50 text-gray-700"
                  >
                    History
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
          {cardAvatar ? (
            <i className={`fa ${cardAvatar} text-4xl text-gray-700`}></i>
          ) : (
            <User size={40} className="text-gray-600" />
          )}
        </div>

        <p className="text-gray-500 text-sm mt-2"># {cardIdValue}</p>
        <h2 className="text-lg font-bold text-gray-800 text-center">{cardTitleName}</h2>
      </div>

      {cardFooter.length > 0 && (
        <div className="border border-gray-300 rounded-md mt-3 p-2">
          <div className="flex flex-wrap divide-x divide-gray-300">
            {cardFooter.map((footer, idx) => (
              <div key={idx} className="px-2 py-1 text-center flex-1 min-w-[90px]">
                <p className="text-gray-500 text-xs">{footer.label}</p>
                <p className="text-gray-800 text-sm font-medium">{footer.value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {buttonSection.length > 0 && (
        <div className="flex gap-3 mt-4">
          {buttonSection.map(btn => (
            <button
              key={btn.label}
              style={{
                backgroundColor: btn.color || (btn.label === "Active" ? "#0b5394" : "#5f6f88"),
              }}
              className="flex-1 text-white text-sm py-2 rounded-md font-medium transition hover:opacity-80"
              onClick={() => handleButtonClick(btn.action)}
            >
              {getButtonLlabel(btn.label)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GridView;
