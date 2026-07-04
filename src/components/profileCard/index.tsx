import { formatDisplayDate } from "@/utils/dateConvertHandler";
import { MoreVertical } from "lucide-react";
import { handleButtonClick } from "./helper";
import { GridViewProps } from "./types";

const GridView = ({
  data,
  onStatusChange,
  openDrawer,
  buttonTitle,
  drawerTitle,
  cardRightTopBtn,
  gridRightBtnRef,
  mapToUser,
  onCustomButtonClick,
  shouldShowButton,
  getCustomButtonLabel,
  isButtonDisabled,
}: GridViewProps) => {
  const {
    cardLeftTop = [],
    cardRightTop = [],
    cardAvatar,
    cardTitle = [],
    cardFooter = [],
    buttonSection = [],
    id,
  } = data ?? {};

  const isDateFormat = (val: string) => /^\d{2}-\d{2}-\d{4}$/.test(val);

  const cardTitleName = Array.isArray(cardTitle)
    ? cardTitle?.map(t => t?.value).join(" ")
    : "Unknown";

  const getButtonLabel = (btnLabel: string, btnAction: string) => {
    if (getCustomButtonLabel) {
      return getCustomButtonLabel(btnLabel, btnAction, id);
    }

    switch (btnLabel) {
      case "Active": {
        return cardLeftTop[0]?.value === 1 ? "Inactive" : "Active";
      }
      default:
        return btnLabel;
    }
  };

  const visibleButtons = shouldShowButton
    ? buttonSection.filter(btn => shouldShowButton(btn.action, id))
    : buttonSection;

  // button handler
  const buttonHandler = (btnAction: string) => {
    handleButtonClick({
      btnAction: btnAction,
      onStatusChange,
      cardLeftTop,
      buttonTitle,
      drawerTitle: drawerTitle,
      id,
      openDrawer,
      mapToUser,
      onCustomButtonClick,
    });
  };

  // card left top helper function
  const getStatusLabel = () => {
    if (!cardLeftTop?.length) return;

    const label = cardLeftTop[0]?.label;
    const value = cardLeftTop[0]?.value;

    if (label === "Status") {
      if (value === 1 || value === 0) {
        return value === 1 ? "Active" : "Inactive";
      }
      return value ?? "";
    }

    return value ?? "";
  };

  const getStatusClass = () => {
    if (!cardLeftTop?.length) return "card-status-default";

    const label = cardLeftTop[0]?.label;
    const value = cardLeftTop[0]?.value;

    if (label === "Status") {
      if (value === 1) return "active";
      if (value === 0) return "inactive";

      const statusText = String(value ?? "")
        .toLowerCase()
        .trim();

      if (statusText.includes("draft")) return "card-status-draft";
      if (statusText.includes("pending") || statusText.includes("approval")) {
        return "card-status-pending";
      }
      if (
        statusText.includes("approv") ||
        statusText.includes("active") ||
        statusText.includes("complete")
      ) {
        return "active";
      }
      if (statusText.includes("cancel") || statusText.includes("reject")) {
        return "inactive";
      }

      return "card-status-default";
    }

    return "card-status-default";
  };

  return (
    <div className="card-layout">
      <div className="flex justify-between items-center mb-3">
        <span className={`card-status ${getStatusClass()}`}>{getStatusLabel()}</span>

        {!!cardRightTop?.length && cardRightTopBtn && (
          <div className="relative">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-md transition"
              onClick={e => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                cardRightTopBtn(id, rect);
              }}
              onMouseDown={e => e.stopPropagation()}
              ref={gridRightBtnRef}
            >
              <MoreVertical size={16} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="card-avatar-size shadow-lg">
          {cardAvatar ? (
            <img
              src={cardAvatar}
              alt="logo"
              className="h-full w-full items-center object-contain rounded-full "
            />
          ) : (
            <i className="fa-solid fa-user fa-2x text-gray-700" />
          )}
        </div>

        <p className="card-id  m-1"></p>
        <h2 className="card-title wrap-break-word  ">{cardTitleName}</h2>
      </div>

      {cardFooter.length > 0 && (
        <div className="footer-border">
          <div className="flex flex-wrap divide-x divide-gray-300 ">
            {cardFooter.map((footer, idx) => (
              <div key={idx} className="px-2 py-1 text-center flex-1 min-w-[90px]">
                <p className="footer-label">{footer?.label}</p>
                {/* <p className="footer-value">{footer?.value || "—"}</p> */}
                <p className="footer-value wrap-break-word">
                  {isDateFormat(String(footer?.value))
                    ? formatDisplayDate(String(footer?.value))
                    : footer?.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibleButtons.length > 0 && (
        <div className="flex gap-3 mt-4">
          {visibleButtons.map(btn => {
            let btnClass = "grid-default-btn";
            const isDisabled = isButtonDisabled?.(btn.action, id) ?? false;

            switch (btn?.label) {
              case "Active":
                btnClass = "grid-active-btn";
                break;
              case "Edit":
                btnClass = "grid-edit-btn";
                break;
              case "Map User":
                btnClass = "grid-map-user-btn";
                break;
              case "Opd Billing":
                btnClass = "grid-active-btn";
                break;
              case "Approve":
                btnClass = "grid-active-btn";
                break;
              case "Cancel":
                btnClass = "grid-edit-btn";
                break;
              case "Paymemnt Collection":
              case "Payment Collection":
                btnClass = "grid-active-btn";
                break;
              default:
                btnClass = "";
            }

            return (
              <button
                key={btn?.label}
                type="button"
                aria-disabled={isDisabled}
                className={`w-full ${btnClass} ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={() => buttonHandler(btn?.action)}
              >
                {getButtonLabel(btn?.label, btn?.action)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GridView;
