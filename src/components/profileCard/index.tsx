import { MoreVertical } from "lucide-react";
import { handleButtonClick } from "./helper";

type CardItem = {
  label?: string;
  value?: string | number;
};

type ButtonItem = {
  label: string;
  action: string;
  color?: string;
};

type GridViewData = {
  cardLeftTop?: CardItem[];
  cardRightTop?: CardItem[];
  cardId?: CardItem[];
  cardAvatar?: string | null;
  cardTitle?: CardItem[];
  cardFooter?: CardItem[];
  buttonSection?: ButtonItem[];
  id: number;
};

type GridViewProps = {
  data: GridViewData;
  onStatusChange: (payload: {
    isActive: number;
    userId?: number;
    roleId?: number;
    cardRightTopBtn?: string;
    id?: number;
  }) => void;
  openDrawer: (id: number) => void;
  buttonTitle: (title: string) => void;
  drawerTitle: (title: string) => void;
};

const GridView = ({
  data,
  onStatusChange,
  openDrawer,
  buttonTitle,
  drawerTitle,
  cardRightTopBtn,
  gridRightBtnRef,
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

  const getButtonLlabel = (btnLabel: string) => {
    switch (btnLabel) {
      case "Active": {
        return cardLeftTop[0]?.value === 1 ? "Inactive" : "Active";
      }
      default:
        return btnLabel;
    }
  };

  // button handler
  const buttonHandler = btnAction => {
    handleButtonClick({
      btnAction: btnAction,
      onStatusChange,
      cardLeftTop,
      buttonTitle,
      drawerTitle: drawerTitle,
      id,
      openDrawer: openDrawer,
    });
  };

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
        <div className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
          {cardAvatar ? (
            <i className="fa-solid fa-user fa-2x text-gray-700"></i>
          ) : (
            // <i className={`fa ${cardAvatar} fa-3x text-gray-700`}></i>
            <i className="fa-solid fa-user fa-2x text-gray-700"></i>
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
              onClick={() => buttonHandler(btn.action)}
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
