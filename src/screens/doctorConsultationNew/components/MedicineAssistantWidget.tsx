import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess } from "@/utils/alert";
import { Bot, Copy, Globe, Loader2, MessageCircle, Pill, Search, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { EmrSectionAnswerEntry } from "../types";

interface MedicineAssistantWidgetProps {
  emrSectionsData: EmrSectionAnswerEntry[];
}

interface MedicineItem {
  id: number;
  name: string;
}

interface ChatMessage {
  id: string;
  from: "bot" | "user";
  text?: string;
  medicines?: MedicineItem[];
  googleQuery?: string;
}

const openGoogleSearch = (query: string) => {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const width = 720;
  const height = 820;
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
  window.open(
    url,
    "medicineAssistantGoogleSearch",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,noopener,noreferrer`
  );
};

interface SymptomHint {
  keywords: string[];
  searchTerm: string;
  label: string;
}

const SYMPTOM_HINTS: SymptomHint[] = [
  { keywords: ["fever", "pyrexia", "temperature"], searchTerm: "paracetamol", label: "Fever" },
  {
    keywords: ["pain", "ache", "headache", "migraine"],
    searchTerm: "paracetamol",
    label: "Pain relief",
  },
  { keywords: ["cough"], searchTerm: "cough", label: "Cough" },
  {
    keywords: ["cold", "flu", "runny nose", "sneeze"],
    searchTerm: "cetirizine",
    label: "Cold / Allergy",
  },
  { keywords: ["allerg"], searchTerm: "cetirizine", label: "Allergy" },
  { keywords: ["infection", "bacterial"], searchTerm: "amoxicillin", label: "Infection" },
  {
    keywords: ["acid", "gastritis", "heartburn", "reflux"],
    searchTerm: "pantoprazole",
    label: "Acidity",
  },
  { keywords: ["vomit", "nausea"], searchTerm: "ondansetron", label: "Nausea" },
  { keywords: ["diarrhea", "loose motion", "dehydrat"], searchTerm: "ors", label: "Diarrhea" },
  {
    keywords: ["hypertension", "blood pressure"],
    searchTerm: "amlodipine",
    label: "Hypertension",
  },
  { keywords: ["diabetes", "sugar"], searchTerm: "metformin", label: "Diabetes" },
];

const CONTEXT_SECTION_KEYWORDS = ["diagnos", "complaint", "symptom"];

const findSectionContext = (emrSectionsData: EmrSectionAnswerEntry[]) => {
  const relevant = emrSectionsData.filter(e =>
    CONTEXT_SECTION_KEYWORDS.some(k => e.sectionName.toLowerCase().includes(k))
  );
  const text = relevant
    .map(e => (typeof e.value === "string" ? e.value : JSON.stringify(e.value)))
    .join(" ")
    .toLowerCase();
  return { relevant, text };
};

const MedicineAssistantWidget = ({ emrSectionsData }: MedicineAssistantWidgetProps) => {
  const { fetchApi } = useGlobalApi();
  const fetchApiRef = useRef(fetchApi);
  fetchApiRef.current = fetchApi;
  const emrSectionsDataRef = useRef(emrSectionsData);
  emrSectionsDataRef.current = emrSectionsData;

  const [isOpen, setIsOpen] = useState(false);
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
  const [hasFetchedMedicines, setHasFetchedMedicines] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || hasFetchedMedicines) return;
    setHasFetchedMedicines(true);
    setIsLoadingMedicines(true);

    fetchApiRef
      .current<{
        data?: { serviceItemId: number; name: string }[];
      }>(
        "GET",
        ENDPOINTS.GET_SERVICE_ITEM_LIST,
        {},
        { params: { categoryTypeId: 6, serviceName: "medicine", isActive: 1 } },
        { component: "MedicineAssistantWidget", silent: true }
      )
      .then(res => {
        const rows = res?.data ?? [];
        const list = rows.map(r => ({ id: r.serviceItemId, name: r.name }));
        setMedicines(list);
        setIsLoadingMedicines(false);

        const { relevant, text } = findSectionContext(emrSectionsDataRef.current);
        const matchedHints = SYMPTOM_HINTS.filter(hint =>
          hint.keywords.some(k => text.includes(k))
        ).slice(0, 3);

        const greeting: ChatMessage = {
          id: "greet",
          from: "bot",
          text:
            relevant.length > 0
              ? "Hi! I've read this visit's Diagnosis / Chief Complaints. Here's a quick medicine search based on that — always verify against clinical guidelines before prescribing."
              : "Hi! Type a medicine name below to search. Once Diagnosis or Chief Complaints are filled in for this visit, I'll suggest a starting point here too.",
        };

        const suggestionMessages: ChatMessage[] = matchedHints.map(hint => ({
          id: `hint-${hint.label}`,
          from: "bot",
          text: `Suggested for "${hint.label}":`,
          medicines: list.filter(m => m.name.toLowerCase().includes(hint.searchTerm)).slice(0, 5),
        }));

        setMessages([greeting, ...suggestionMessages]);
      });
  }, [isOpen, hasFetchedMedicines]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const matches = medicines
      .filter(m => m.name.toLowerCase().includes(trimmed.toLowerCase()))
      .slice(0, 8);

    setMessages(prev => [
      ...prev,
      { id: `q-${Date.now()}`, from: "user", text: trimmed },
      {
        id: `r-${Date.now()}`,
        from: "bot",
        text:
          matches.length > 0
            ? `Found ${matches.length} match(es) in this hospital's list:`
            : `No medicine found matching "${trimmed}" in this hospital's list.`,
        medicines: matches,
        googleQuery: trimmed,
      },
    ]);
    setQuery("");
  };

  const handleCopy = (medicine: MedicineItem) => {
    navigator.clipboard.writeText(medicine.name).then(() => {
      setCopiedId(medicine.id);
      showSuccess(`Copied "${medicine.name}"`);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        title="Medicine Assistant"
        className="fixed bottom-5 right-5 z-[85] flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#0B5394] to-[#1C7EC2] shadow-lg hover:scale-105 active:scale-95 transition-transform"
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-[84px] right-5 z-[85] w-[92vw] max-w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 shrink-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B5394] to-[#1C7EC2] shadow-sm">
              <Bot size={15} className="text-white" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-slate-700 truncate">Medicine Assistant</h3>
              <p className="text-[10px] text-slate-400 truncate">
                Keyword search, not a clinical recommendation
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5 bg-slate-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12.5px] ${
                    msg.from === "user"
                      ? "bg-[#0B5394] text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  {msg.text && <p>{msg.text}</p>}
                  {msg.medicines && msg.medicines.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1.5">
                      {msg.medicines.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleCopy(m)}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-left transition-colors"
                        >
                          <span className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                            <Pill size={11} className="text-[#0B5394] shrink-0" />
                            <span className="truncate">{m.name}</span>
                          </span>
                          <Copy
                            size={11}
                            className={
                              copiedId === m.id
                                ? "text-emerald-500 shrink-0"
                                : "text-slate-400 shrink-0"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.googleQuery && (
                    <button
                      type="button"
                      onClick={() => openGoogleSearch(`${msg.googleQuery} medicine`)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11.5px] font-medium mt-1.5 transition-colors w-full"
                    >
                      <Globe size={11} className="shrink-0" />
                      Search &quot;{msg.googleQuery}&quot; on Google
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoadingMedicines && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                <Loader2 size={12} className="animate-spin" />
                Loading medicine list…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 px-3 py-2.5 border-t border-slate-100 bg-white shrink-0"
          >
            <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-[#0B5394] transition-colors">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search medicine…"
                className="flex-1 bg-transparent text-[12.5px] outline-none min-w-0"
              />
            </div>
            <button
              type="button"
              onClick={() => query.trim() && openGoogleSearch(`${query.trim()} medicine`)}
              disabled={!query.trim()}
              title="Search on Google"
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            >
              <Globe size={15} />
            </button>
            <button
              type="submit"
              disabled={!query.trim()}
              className="save-btn !py-1.5 !px-3 !text-xs disabled:opacity-40"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default MedicineAssistantWidget;
