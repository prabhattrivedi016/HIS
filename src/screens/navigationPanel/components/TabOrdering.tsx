import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { tabDropdownItem } from "../types";

const TabOrdering = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();

  const [orderedTabs, setOrderedTabs] = useState<tabDropdownItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<tabDropdownItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const getNavigationTab = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_NAVIGATION_TAB_MASTER,
      {},
      {},
      { component: "TabOrdering" }
    );

    return resp?.data ?? [];
  };

  const { data: navigationTabList = [] } = useQuery({
    queryKey: ["navigation-tab-list"],
    queryFn: getNavigationTab,
    enabled: isOpen,
  });

  // Sync React Query data to local state
  useEffect(() => {
    if (navigationTabList) {
      setOrderedTabs(navigationTabList);
    }
  }, [navigationTabList]);

  // Reset local state when popup is closed
  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage("");
      setErrorMessage("");
      setDraggedItem(null);
    }
  }, [isOpen]);

  /* ── Drag & drop handlers ── */
  const handleDragStart = (item: tabDropdownItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (!draggedItem) return;
    const draggedIndex = orderedTabs.findIndex(item => item.tabId === draggedItem.tabId);
    if (draggedIndex === index) return;

    const newItems = [...orderedTabs];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setOrderedTabs(newItems);
    setDraggedItem(null);
  };

  /* ── Save Order Handler ── */
  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      tabs: orderedTabs.map((item, idx) => ({
        tabId: item.tabId,
        sequenceNo: idx,
      })),
    };

    const response = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_NAVIGATION_TAB_SEQUENCE_NO,
      payload,
      {},
      { component: "TabOrdering" }
    );

    setSaving(false);

    if (!response?.result) {
      setErrorMessage(response?.message ?? "Failed to save tab sequence");
      return;
    }

    setSuccessMessage(response?.message ?? "Tab sequence updated successfully");
    queryClient.invalidateQueries({ queryKey: ["navigation-tab-list"] });

    setTimeout(() => {
      onClose();
      setSuccessMessage("");
    }, 1000);
  };

  return (
    <CentralPopup title="Tab Ordering" isOpen={isOpen} onClose={onClose} className="lg:min-w-150">
      <div className="space-y-4">
        {successMessage && <SuccessMessage text={successMessage} />}
        {errorMessage && <ErrorMessage text={errorMessage} />}

        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-90 lg:max-h-90">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    <th className="table-th text-center w-16">Seq No</th>
                    <th className="table-th ml-10">Tab Name</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orderedTabs?.length === 0 && (
                    <tr>
                      <td colSpan={3} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {orderedTabs.map((item: tabDropdownItem, idx: number) => (
                    <tr
                      key={item?.tabId}
                      className="table-row"
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      style={{
                        opacity: draggedItem?.tabId === item?.tabId ? 0.5 : 1,
                        cursor: "move",
                      }}
                    >
                      <td className="table-td text-center font-semibold">{idx + 1}</td>
                      <td className="table-td">{item?.tabName || "-"}</td>
                      <td
                        className={`table-td ${
                          Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-1">
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default TabOrdering;
