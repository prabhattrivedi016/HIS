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
}: GridViewProps) => {
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

  const cardTitleName = Array.isArray(cardTitle)
    ? cardTitle?.map(t => t?.value).join(" ")
    : "Unknown";

  const cardIdValue = Array.isArray(cardId) ? cardId?.map(t => t?.value) : "-";

  const getButtonLabel = (btnLabel: string) => {
    switch (btnLabel) {
      case "Active": {
        return cardLeftTop[0]?.value === 1 ? "Inactive" : "Active";
      }
      default:
        return btnLabel;
    }
  };

  // button handler
  const buttonHandler = (btnAction: string) => {
    handleButtonClick({
      btnAction: btnAction,
      onStatusChange,
      cardLeftTop,
      buttonTitle,
      drawerTitle: drawerTitle,
      id,
      openDrawer: openDrawer,
      mapToUser,
    });
  };

  return (
    <div className="card-layout">
      <div className="flex justify-between items-center mb-3">
        <span className={`card-status ${cardLeftTop[0]?.value === 1 ? "active" : "inactive"}`}>
          {cardLeftTop[0]?.value === 1 ? "Active" : "Inactive"}
        </span>

        {cardRightTop && (
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100 rounded-md transition"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                cardRightTopBtn(id, rect);
              }}
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

        <p className="card-id mb-3"># {cardIdValue}</p>
        <h2 className="card-title">{cardTitleName}</h2>
      </div>

      {cardFooter.length > 0 && (
        <div className="footer-border">
          <div className="flex flex-wrap divide-x divide-gray-300">
            {cardFooter.map((footer, idx) => (
              <div key={idx} className="px-2 py-1 text-center flex-1 min-w-[90px]">
                <p className="footer-label">{footer?.label}</p>
                <p className="footer-value">{footer?.value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {buttonSection.length > 0 && (
        <div className="flex gap-3 mt-4">
          {buttonSection.map(btn => {
            let btnClass = "grid-default-btn";

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
              default:
                btnClass = "";
            }

            return (
              <button
                key={btn?.label}
                className={`w-full ${btnClass}`}
                onClick={() => buttonHandler(btn?.action)}
              >
                {getButtonLabel(btn?.label)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GridView;
