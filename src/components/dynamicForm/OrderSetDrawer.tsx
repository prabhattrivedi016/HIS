import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TableOrderSetConfig } from "./types";

interface SearchItem {
  label: string;
  value: string;
}

export interface OrderSetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** which column key the bulk-added rows' name value goes into, e.g. "Service Name" */
  nameKey: string;
  doctorId?: number;
  /** open already filtered to favourites, e.g. when launched from the "Favourite Order Set" icon */
  initialFavouritesOnly?: boolean;
  config: TableOrderSetConfig;
  onApply: (rows: Record<string, unknown>[]) => void;
}

/**
 * Reusable "order set" drawer for any table-type EMR control — lets a doctor group several
 * items under one name (e.g. an investigation panel) and bulk-add every item as a new row
 * in one click. Also doubles as the "Favourite Order Set" picker via initialFavouritesOnly.
 */
const OrderSetDrawer = ({
  isOpen,
  onClose,
  title,
  nameKey,
  doctorId,
  initialFavouritesOnly,
  config,
  onApply,
}: OrderSetDrawerProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [orderSets, setOrderSets] = useState<Record<string, unknown>[]>([]);
  const [favouritesOnly, setFavouritesOnly] = useState(Boolean(initialFavouritesOnly));

  const [newSetName, setNewSetName] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [itemResults, setItemResults] = useState<SearchItem[]>([]);
  const [itemSearchLoading, setItemSearchLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const loadOrderSets = async () => {
    const resp = await fetchApi(
      "GET",
      config.listEndpoint,
      {},
      { params: { doctorId } },
      { component: "OrderSetDrawer", silent: true }
    );
    setOrderSets(Array.isArray(resp?.data) ? resp.data : []);
  };

  useEffect(() => {
    if (!isOpen) return;
    setFavouritesOnly(Boolean(initialFavouritesOnly));
    setNewSetName("");
    setItemQuery("");
    setItemResults([]);
    setSelectedItems([]);
    loadOrderSets();
  }, [isOpen]);

  useEffect(() => {
    const q = itemQuery.trim();
    if (!isOpen || q.length < 2) {
      setItemResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setItemSearchLoading(true);
      try {
        const resp = await fetchApi(
          "GET",
          config.itemSearchEndpoint,
          {},
          { params: { ...config.itemSearchParams, serviceName: q } },
          { component: "OrderSetDrawer", silent: true }
        );
        const raw: any[] = Array.isArray(resp?.data) ? resp.data : [];
        setItemResults(
          raw.map(item => ({
            value: item?.shortName || item?.name || "",
            label: item?.shortName ? `${item.shortName} (${item.name})` : (item?.name ?? ""),
          }))
        );
      } finally {
        setItemSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [itemQuery, isOpen]);

  const addSelectedItem = (value: string) => {
    if (!selectedItems.includes(value)) setSelectedItems(prev => [...prev, value]);
    setItemQuery("");
    setItemResults([]);
  };
  const removeSelectedItem = (value: string) =>
    setSelectedItems(prev => prev.filter(v => v !== value));

  const handleCreateSet = async () => {
    if (!newSetName.trim() || selectedItems.length === 0) return;

    const resp = await fetchApi(
      "POST",
      config.saveEndpoint,
      {
        [config.idField]: 0,
        [config.nameField]: newSetName.trim(),
        [config.itemsField]: selectedItems,
        isFavourite: false,
      },
      {},
      { component: "OrderSetDrawer" }
    );

    if (!resp?.result) {
      showError(resp?.message || "Failed to save order set");
      return;
    }

    showSuccess(resp?.message ?? "Order set saved");
    setNewSetName("");
    setSelectedItems([]);
    loadOrderSets();
  };

  const handleToggleFavourite = async (orderSet: Record<string, unknown>) => {
    await fetchApi(
      "POST",
      config.saveEndpoint,
      { ...orderSet, isFavourite: !orderSet.isFavourite },
      {},
      { component: "OrderSetDrawer", silent: true }
    );
    loadOrderSets();
  };

  const handleUseSet = (orderSet: Record<string, unknown>) => {
    const items = Array.isArray(orderSet[config.itemsField])
      ? (orderSet[config.itemsField] as string[])
      : [];
    onApply(items.map(item => ({ [nameKey]: item })));
    onClose();
  };

  if (!isOpen) return null;

  const visibleSets = favouritesOnly ? orderSets.filter(s => s.isFavourite) : orderSets;

  return createPortal(
    <>
      <div className="drawer-bg-fade opacity-100 visible" onClick={onClose} />

      <div className="drawer-layout drawer-bg translate-x-0 sm:w-[440px]">
        <div className="drawer-title-border">
          <h2 className="drawer-title">{title}</h2>
          <button onClick={onClose} className="drawer-close-btn">
            ×
          </button>
        </div>

        <div className="p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFavouritesOnly(false)}
              className={!favouritesOnly ? "save-btn !px-3 !py-1.5 !text-xs" : "cancel-button !px-3 !py-1.5 !text-xs"}
            >
              All sets
            </button>
            <button
              type="button"
              onClick={() => setFavouritesOnly(true)}
              className={favouritesOnly ? "save-btn !px-3 !py-1.5 !text-xs" : "cancel-button !px-3 !py-1.5 !text-xs"}
            >
              Favourites
            </button>
          </div>

          <div className="table-scroll-wrapper">
            <div className="table-size lg:max-h-64">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Order Set</th>
                    <th className="table-th">Items</th>
                    <th className="table-th text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSets.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="table-empty">
                        {favouritesOnly ? "No favourite order sets yet" : "No order sets yet"}
                      </td>
                    </tr>
                  ) : (
                    visibleSets.map((set, i) => {
                      const items = Array.isArray(set[config.itemsField])
                        ? (set[config.itemsField] as string[])
                        : [];
                      return (
                        <tr key={i} className="table-row">
                          <td className="table-td font-medium text-gray-800">
                            {String(set[config.nameField] ?? "")}
                          </td>
                          <td className="table-td text-xs text-gray-500">{items.length} item(s)</td>
                          <td className="table-action text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button type="button" onClick={() => handleToggleFavourite(set)}>
                                <Star
                                  size={14}
                                  className={
                                    set.isFavourite
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300 hover:text-amber-400"
                                  }
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUseSet(set)}
                                className="text-blue-500 hover:text-blue-700 text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50"
                              >
                                Use
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Create Order Set
            </h4>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="input-field !mb-0"
                placeholder="Order set name"
                value={newSetName}
                onChange={e => setNewSetName(e.target.value)}
              />

              <div className="relative">
                <input
                  type="text"
                  className="input-field !mb-0"
                  placeholder="Search and add items…"
                  value={itemQuery}
                  onChange={e => setItemQuery(e.target.value)}
                />
                {(itemResults.length > 0 || itemSearchLoading) && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {itemSearchLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
                    ) : (
                      itemResults.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => addSelectedItem(item.value)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                        >
                          {item.label}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedItems.map(item => (
                    <span
                      key={item}
                      className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-full pl-2.5 pr-1 py-1"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeSelectedItem(item)}
                        className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-100"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                className={
                  newSetName.trim() && selectedItems.length > 0 && !loading
                    ? "save-btn"
                    : "disabled-btn"
                }
                disabled={!newSetName.trim() || selectedItems.length === 0 || loading}
                onClick={handleCreateSet}
              >
                {loading ? "Saving…" : "Save Order Set"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default OrderSetDrawer;
