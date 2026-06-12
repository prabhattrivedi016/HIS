import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash/debounce";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

type SnomedItem = {
  conceptId: string;
  term: string;
  fsn?: {
    term: string;
  };
};

const SnomedPopup = ({
  isOpen,
  onClose,
  setData,
}: {
  isOpen: boolean;
  onClose: () => void;
  setData: Dispatch<SetStateAction<SnomedItem | null>>;
}) => {
  const [searchKey, setSearchKey] = useState("");
  const [debouncedSearchKey, setDebouncedSearchKey] = useState("");

  const [selectedSemantic, setSelectedSemantic] = useState("finding");

  const [selectedSnomed, setSelectedSnomed] = useState<SnomedItem | null>(null);

  // debounce search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchKey(value);
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // search input handler
  const searchKeyChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearchKey(value);

    if (value.trim().length >= 3) {
      debouncedSearch(value);
    } else {
      setDebouncedSearchKey("");
    }

    if (!value.trim()) {
      setSelectedSnomed(null);
    }
  };

  // API
  const getSnomedCode = async (): Promise<SnomedItem[]> => {
    try {
      const resp = await axios.get("http://localhost:8080/csnoserv/api/search/search", {
        params: {
          term: debouncedSearchKey,
          state: "active",
          semantictag: selectedSemantic,
          acceptability: "preferred",
          returnlimit: 10,
        },
        headers: {
          Accept: "application/json",
        },
      });

      return resp?.data ?? [];
    } catch (error) {
      console.error("Failed to fetch SNOMED data", error);

      return [];
    }
  };

  const {
    data: snomedCode = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["getSnomedCode", debouncedSearchKey, selectedSemantic],
    queryFn: getSnomedCode,
    enabled: debouncedSearchKey.length >= 3,
  });

  //   snomed select handler
  const snomedSelectHandler = (item: SnomedItem) => {
    if (!item) {
      setData(null);
      return;
    }
    setData(item);
    onClose?.();
  };

  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-h-80 ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">Snomed Code</h2>

          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        <div className="form-grid-1">
          {/* Search */}
          <div className="relative">
            <InputField label="Search Snomed">
              <input
                type="text"
                className="input-field"
                value={searchKey}
                onChange={searchKeyChangeHandler}
                placeholder="Enter minimum 3 characters"
              />
            </InputField>

            {!selectedSnomed && searchKey.length >= 3 && (
              <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-sm max-h-55 overflow-auto">
                {!isLoading && !isFetching && snomedCode.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">No records found</div>
                )}

                {snomedCode.map((item: SnomedItem) => (
                  <div
                    key={item.conceptId}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => snomedSelectHandler(item)}
                  >
                    <div className="font-medium text-sm">{item.term}</div>

                    <div className="text-xs text-gray-500">Concept Id: {item.conceptId}</div>

                    {item.fsn?.term && <div className="text-xs text-gray-400">{item.fsn.term}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Semantic Type */}
          <InputField label="Semantic Type">
            <select
              className="input-field"
              value={selectedSemantic}
              onChange={e => setSelectedSemantic(e.target.value)}
            >
              <option value="finding">Finding</option>
              <option value="disorder">Disorder</option>
              <option value="procedure">Procedure</option>
              <option value="organism">Organism</option>
              <option value="substance">Substance</option>
            </select>
          </InputField>
        </div>
      </div>
      {!!(isLoading || isFetching) && <CustomLoader isLoading={true} />}
    </div>,
    document.body
  );
};

export default React.memo(SnomedPopup);
