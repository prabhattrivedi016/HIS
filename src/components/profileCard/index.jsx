import { MoreVertical, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateforRoleMasterstatus } from "../../api/roleMasterApis";
import { updateforUserMasterstatus } from "../../api/userMasterApis";
import { formConfig } from "../../config/formConfig/formConfig";
import RoleMasterDrawer from "../../screens/roleMaster/components/RoleMasterDrawer";
import FormComponent from "../formComponent/FormComponent";

const ProfileCard = ({ data, onStatusChange, onCloseDrawer }) => {
  console.log("data of profilecard view", data);

  const [openDrawer, setOpenDrawer] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(data?.data?.cardLeftTop?.value);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setLocalStatus(data?.cardLeftTop?.value);
  }, [data]);

  // close menu
  useEffect(() => {
    const handleOutsideClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const {
    cardTitle,
    cardId,
    cardFooterSection = [],
    cardLeftTop,
    buttonSection = [],
    cardAvatar,
    gridCardRightTop,
    type,
  } = data ?? {};
  console.log("profile cardID", cardId);
  //   user name
  const userName = Array.isArray(cardTitle)
    ? cardTitle.map(t => (t?.value ? t.value : t)).join(" ")
    : typeof cardTitle === "object"
    ? cardTitle?.value || "Unknown"
    : cardTitle || "Unknown";

  //  card ID
  const cardIdValue = Array.isArray(cardId)
    ? cardId.map(id => (id?.value ? id.value : id)).join(" ")
    : typeof cardId === "object"
    ? cardId?.value || "001"
    : cardId || "001";

  const handleToggleActive = async () => {
    console.log("toggle button is working");
    try {
      setStatusLoading(true);
      const newStatus = localStatus === "Active" ? "0" : "1";

      let payload;

      if (type === "User Master") {
        payload = {
          isActive: newStatus,
          userId: cardId?.value || cardId,
        };
        console.log("payload for user master", payload);
      } else {
        payload = {
          isActive: newStatus,
          roleId: cardId?.value || cardId,
        };
        console.log("payload for role master is", payload);
      }

      const apiCall =
        type === "Role Master" ? updateforRoleMasterstatus : updateforUserMasterstatus;

      console.log("payload for toggle", payload);

      const response = await apiCall(payload);

      if (response?.status === 200) {
        const updatedStatus = newStatus === "1" ? "Active" : "Inactive";
        setLocalStatus(updatedStatus);
        onStatusChange && onStatusChange();
      } else {
        console.log("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  //  Button click handler
  const handleButton = async btn => {
    switch (btn.action) {
      case "toggleActive":
        await handleToggleActive();
        break;
      case "toggleEdit":
        setOpenDrawer(type);
        break;
      default:
        null;
    }
  };

  // handle action of three dot
  const handleMenuAction = action => {
    setMenuOpen(false);
    switch (action) {
      case "history":
        console.log("History clicked");
        break;
      case "edit":
        setOpenDrawer(type);
        break;
      case "delete":
        console.log("Delete clicked");
        break;
      case "view":
        console.log("View details clicked");
        break;
      default:
        break;
    }
  };

  const onClose = () => {
    setOpenDrawer("");
    onCloseDrawer?.();
  };
  return (
    <div className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 w-full rounded-md">
      <div className="flex justify-between items-center p-3">
        <span
          className={`font-semibold text-sm px-3 py-1 rounded ${
            localStatus === "Active" ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"
          }`}
        >
          {localStatus}
        </span>

        {gridCardRightTop && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="p-2 border border-gray-300 hover:bg-gray-100 rounded-md transition"
            >
              <MoreVertical size={18} className="text-gray-600" />
            </button>

            {/* 🔹 Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {[
                  { label: "View Details", action: "view" },
                  { label: "Edit", action: "edit" },
                  { label: "History", action: "history" },
                  { label: "Delete", action: "delete" },
                ].map(item => (
                  <button
                    key={item.action}
                    onClick={() => handleMenuAction(item.action)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
        <h2 className="text-xl font-bold text-gray-800 text-center">{userName}</h2>
      </div>

      {/* 🔹 Footer Info */}
      {cardFooterSection.length > 0 && (
        <div className="border-t border-gray-200 p-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            {cardFooterSection.map((footer, idx) => (
              <div key={idx}>
                <p className="text-gray-500 text-xs">{footer.label}</p>
                <p className="text-gray-800 text-sm font-medium">{footer.value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 Action Buttons */}

      {buttonSection.length > 0 && (
        <div className="flex gap-3 p-3">
          {buttonSection.map(btn => (
            <button
              key={btn.label}
              disabled={statusLoading}
              style={{ backgroundColor: btn.color }}
              className={`flex-1 text-white py-2 rounded-lg font-medium transition ${
                statusLoading ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"
              }`}
              onClick={() => handleButton(btn)}
            >
              {btn.action === "toggleActive"
                ? localStatus === "Active"
                  ? "Inactive"
                  : "Active"
                : btn.label}
            </button>
          ))}
        </div>
      )}

      {/* drawer */}
      {openDrawer === "Role Master" ? (
        <RoleMasterDrawer
          open={openDrawer === "Role Master"}
          onClose={onClose}
          cardLeftTop={cardLeftTop?.value === "Active" ? "1" : "0"}
          cardTitle={cardTitle?.value}
          cardId={cardId?.value}
          cardAvatar={cardAvatar}
        />
      ) : (
        <></>
      )}
      {openDrawer === "User Master" ? (
        <FormComponent
          open={openDrawer === "User Master"}
          onClose={onClose}
          formConfig={formConfig}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default ProfileCard;
