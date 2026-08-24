import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { SubMenuItem } from "../types";

const SubMenuOrdering = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();

  const [orderedSubMenus, setOrderedSubMenus] = useState<SubMenuItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<SubMenuItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const getSubMenuList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_NAVIGATION_SUB_MENU_MASTER,
      {},
      {},
      { component: "SubMenuOrdering" }
    );

    return resp?.data ?? [];
  };

  const { data: subMenuList = [] } = useQuery({
    queryKey: ["sub-menu-list"],
    queryFn: getSubMenuList,
    enabled: isOpen,
  });

  // Sync React Query data to local state
  useEffect(() => {
    if (subMenuList) {
      setOrderedSubMenus(subMenuList);
    }
  }, [subMenuList]);

  // Reset local state when popup is closed
  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage("");
      setErrorMessage("");
      setDraggedItem(null);
    }
  }, [isOpen]);

  /* ── Drag & drop handlers ── */
  const handleDragStart = (item: SubMenuItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (!draggedItem) return;
    const draggedIndex = orderedSubMenus.findIndex(
      item => item.subMenuId === draggedItem.subMenuId
    );
    if (draggedIndex === index) return;

    const newItems = [...orderedSubMenus];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setOrderedSubMenus(newItems);
    setDraggedItem(null);
  };

  /* ── Save Order Handler ── */
  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      subMenus: orderedSubMenus.map((item, idx) => ({
        subMenuId: item.subMenuId,
        sequenceNo: idx,
      })),
    };

    const response = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_NAVIGATION_SEB_MENU_SEQUENCE_NUMBER,
      payload,
      {},
      { component: "SubMenuOrdering" }
    );

    setSaving(false);

    if (!response?.result) {
      setErrorMessage(response?.message ?? "Failed to save sub menu sequence");
      return;
    }

    setSuccessMessage(response?.message ?? "Sub menu sequence updated successfully");
    queryClient.invalidateQueries({ queryKey: ["sub-menu-list"] });
    onSuccess?.();

    setTimeout(() => {
      onClose();
      setSuccessMessage("");
    }, 1000);
  };

  return (
    <CentralPopup
      title="Sub Menu Ordering"
      isOpen={isOpen}
      onClose={onClose}
      className="w-[95vw] lg:min-w-210 "
    >
      <div className="space-y-4">
        {successMessage && <SuccessMessage text={successMessage} />}
        {errorMessage && <ErrorMessage text={errorMessage} />}

        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-80 lg:max-h-80">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    <th className="table-th text-center w-16">Seq No</th>
                    <th className="table-th ml-10">Tab Name</th>
                    <th className="table-th">SubMenu Name</th>
                    <th className="table-th">URL</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orderedSubMenus?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {orderedSubMenus.map((item, idx: number) => (
                    <tr
                      key={item?.subMenuId}
                      className="table-row"
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      style={{
                        opacity: draggedItem?.subMenuId === item?.subMenuId ? 0.5 : 1,
                        cursor: "move",
                      }}
                    >
                      <td className="table-td text-center font-semibold">{idx + 1}</td>
                      <td className="table-td">{item?.tabName || "-"}</td>
                      <td className="table-td">{item?.subMenuName || "-"}</td>
                      <td className="table-td">{item?.url || "-"}</td>
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

export default SubMenuOrdering;
