import {
  Activity,
  AlertCircle,
  Ban,
  CheckCheck,
  CheckCircle,
  FileText,
  Hourglass,
  Inbox,
  Layers,
  PauseCircle,
  Printer,
  Send,
  Star,
  TestTube,
  Zap,
} from "lucide-react";
import { MouseEvent, useMemo, useState } from "react";
import { StateValueProps } from "../types";

interface CardConfig {
  key: string;
  name: string;
  icon: typeof Layers;
  valueKey: keyof StateValueProps;
  bgClass: string;
  borderClass: string;
  iconBgClass: string;
  iconColorClass: string;
}

const CARDS_CONFIG: CardConfig[] = [
  {
    key: "allClicked",
    name: "All",
    icon: Layers,
    valueKey: "all",
    bgClass: "bg-[#f1f9ff]",
    borderClass: "border-[#dcecf7]",
    iconBgClass: "bg-[#e1f2ff]",
    iconColorClass: "text-[#0875d1]",
  },
  {
    key: "collectionPendingClicked",
    name: "CollectionPending",
    icon: Hourglass,
    valueKey: "collectionPending",
    bgClass: "bg-[#faf5ff]",
    borderClass: "border-[#f3e8ff]",
    iconBgClass: "bg-[#ede9fe]",
    iconColorClass: "text-purple-600",
  },
  {
    key: "sampleCollectedClicked",
    name: "Sample Collected",
    icon: TestTube,
    valueKey: "sampleCollected",
    bgClass: "bg-[#fffbeb]",
    borderClass: "border-[#fef3c7]",
    iconBgClass: "bg-[#fde68a]",
    iconColorClass: "text-amber-600",
  },
  {
    key: "sampleRejectedClicked",
    name: "Sample Rejected",
    icon: Ban,
    valueKey: "sampleRejected",
    bgClass: "bg-[#fff1f2]",
    borderClass: "border-[#fecdd3]",
    iconBgClass: "bg-[#ffe4e6]",
    iconColorClass: "text-red-600",
  },
  {
    key: "departmentReceivingPendingClicked",
    name: "Dept. Receiving Pending",
    icon: Inbox,
    valueKey: "departmentReceivingPending",
    bgClass: "bg-[#eff6ff]",
    borderClass: "border-[#bfdbfe]",
    iconBgClass: "bg-[#dbeafe]",
    iconColorClass: "text-blue-500",
  },
  {
    key: "departmentReceiveClicked",
    name: "Department Received",
    icon: CheckCheck,
    valueKey: "departmentReceived",
    bgClass: "bg-[#eafaf6]",
    borderClass: "border-[#d6eee8]",
    iconBgClass: "bg-[#d8f3eb]",
    iconColorClass: "text-[#159879]",
  },
  {
    key: "resultPendingClicked",
    name: "Result Pending",
    icon: Activity,
    valueKey: "resultPending",
    bgClass: "bg-[#fdf2f8]",
    borderClass: "border-[#fbcfe8]",
    iconBgClass: "bg-[#fce7f3]",
    iconColorClass: "text-pink-600",
  },
  {
    key: "reportApprovalPendingClicked",
    name: "Report Approval Pending",
    icon: FileText,
    valueKey: "reportApprovalPending",
    bgClass: "bg-[#f0fdfa]",
    borderClass: "border-[#ccfbf1]",
    iconBgClass: "bg-[#ccfbf1]",
    iconColorClass: "text-teal-600",
  },
  {
    key: "holdClicked",
    name: "Hold",
    icon: PauseCircle,
    valueKey: "hold",
    bgClass: "bg-[#fffbeb]",
    borderClass: "border-[#fde68a]",
    iconBgClass: "bg-[#fef3c7]",
    iconColorClass: "text-amber-500",
  },
  {
    key: "approvedClicked",
    name: "Approved",
    icon: CheckCircle,
    valueKey: "approved",
    bgClass: "bg-[#ecfdf5]",
    borderClass: "border-[#a7f3d0]",
    iconBgClass: "bg-[#d1fae5]",
    iconColorClass: "text-emerald-600",
  },
  {
    key: "dispatchedClicked",
    name: "Dispatched",
    icon: Send,
    valueKey: "dispatched",
    bgClass: "bg-[#f5f3ff]",
    borderClass: "border-[#ddd6fe]",
    iconBgClass: "bg-[#ede9fe]",
    iconColorClass: "text-emerald-700",
  },
  {
    key: "printedClicked",
    name: "Printed",
    icon: Printer,
    valueKey: "printed",
    bgClass: "bg-[#f0f9ff]",
    borderClass: "border-[#bae6fd]",
    iconBgClass: "bg-[#e0f2fe]",
    iconColorClass: "text-blue-600",
  },
  {
    key: "urgentClicked",
    name: "Urgent",
    icon: Zap,
    valueKey: "urgent",
    bgClass: "bg-[#fff1f2]",
    borderClass: "border-[#fecdd3]",
    iconBgClass: "bg-[#fee2e2]",
    iconColorClass: "text-rose-600",
  },
  {
    key: "abnormalClicked",
    name: "Abnormal",
    icon: AlertCircle,
    valueKey: "abnormal",
    bgClass: "bg-[#fff7ed]",
    borderClass: "border-[#ffedd5]",
    iconBgClass: "bg-[#fed7aa]",
    iconColorClass: "text-orange-600",
  },
];

interface FilterBarProps {
  statsValue: StateValueProps;
  onCardClick?: (_buttonType: string) => void;
  storageKey?: string;
}

const DEFAULT_STORAGE_KEY = "departmentReceiveFavoriteCards";

export default function FilterBar({
  statsValue,
  onCardClick,
  storageKey = DEFAULT_STORAGE_KEY,
}: FilterBarProps) {
  // Favorite cards (persisted in localStorage, up to 5 allowed)
  const [favoriteCards, setFavoriteCards] = useState<string[]>(() => {
    try {
      const stored =
        localStorage.getItem(storageKey) ||
        localStorage.getItem("labSampleManagementFavoriteCards") ||
        localStorage.getItem(DEFAULT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 5);
        }
      }
    } catch {
      // fallback to empty
    }
    return [];
  });

  // Favorite card click handler (toggle favorite, max 5 with FIFO replacement)
  const favCardClickHandler = (e: MouseEvent, key: string) => {
    e.stopPropagation();

    setFavoriteCards(prev => {
      let updated: string[];
      if (prev.includes(key)) {
        updated = prev.filter(k => k !== key);
      } else {
        if (prev.length >= 5) {
          // Remove the 5th favorite and add the new one
          updated = [...prev.slice(0, 4), key];
        } else {
          updated = [...prev, key];
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  // Ordered cards: favorite cards appear first, followed by remaining cards
  const orderedCards = useMemo(() => {
    const favSet = new Set(favoriteCards);
    const favList = favoriteCards
      .map(key =>
        CARDS_CONFIG.find(
          c => c.key === key || (key === "departmentReceivedClicked" && c.key === "departmentReceiveClicked")
        )
      )
      .filter((c): c is CardConfig => Boolean(c));

    const regularList = CARDS_CONFIG.filter(c => {
      if (favSet.has(c.key)) return false;
      if (c.key === "departmentReceiveClicked" && favSet.has("departmentReceivedClicked")) return false;
      return true;
    });

    return [...favList, ...regularList];
  }, [favoriteCards]);

  return (
    <div className="card">
      <div className="flex flex-row overflow-x-auto gap-3 px-3 py-2 hide-scrollbar">
        {orderedCards.map(card => {
          const IconComponent = card.icon;
          const count = statsValue?.[card.valueKey] ?? 0;
          const isFav =
            favoriteCards.includes(card.key) ||
            (card.key === "departmentReceiveClicked" &&
              favoriteCards.includes("departmentReceivedClicked"));

          return (
            <div
              key={card.key}
              onClick={() => onCardClick?.(card.key)}
              className={`h-[80px] min-w-[220px] ${card.bgClass} border ${card.borderClass} rounded-lg px-3 py-2.5 flex items-center justify-between shrink-0 overflow-hidden relative ${
                onCardClick
                  ? "cursor-pointer transition-transform active:scale-95 hover:shadow-xs"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-[50px] h-[50px] rounded-md ${card.iconBgClass} flex items-center justify-center shrink-0`}
                >
                  <IconComponent size={28} strokeWidth={2.2} className={card.iconColorClass} />
                </div>

                <div className="min-w-0 flex flex-col pl-2 flex-1">
                  <div className="text-[13px] font-bold text-gray-500 truncate" title={card.name}>
                    {card.name}
                  </div>
                  <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                    {count}
                  </div>
                </div>
              </div>

              {/* Star Favorite Button */}
              <button
                type="button"
                onClick={e => favCardClickHandler(e, card.key)}
                className="cursor-pointer p-1 transition-transform hover:scale-110 active:scale-95 shrink-0 self-start -mt-1 -mr-1"
                title={isFav ? "Remove from favorites" : "Mark as favorite"}
              >
                <Star
                  size={16}
                  className={
                    isFav
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 hover:text-yellow-400"
                  }
                  fill={isFav ? "currentColor" : "none"}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
