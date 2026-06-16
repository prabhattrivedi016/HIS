import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { ArrowRightLeftIcon } from "lucide-react";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ActiveRoleItem, RoleTabItem, TabMappingProps } from "../types";

type DragPayload = {
  items: RoleTabItem[];
  fromGranted: boolean;
};

const TabMapping = ({ isOpen, onClose }: TabMappingProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<number>(0);

  const [roleId, setRoleId] = useState<number | null>(null);
  const [activeRoles, setActiveRoles] = useState<ActiveRoleItem[]>([]);
  const [grantedTabs, setGrantedTabs] = useState<RoleTabItem[]>([]);
  const [pendingTabs, setPendingTabs] = useState<RoleTabItem[]>([]);
  const [pendingTabsFilter, setPendingTabsFilter] = useState<RoleTabItem[]>([]);
  const [grantedTabsFilter, setGrantedTabsFilter] = useState<RoleTabItem[]>([]);
  const [dragItem, setDragItem] = useState<DragPayload | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useScrollLock(isOpen);

  const getRoleMasterList = async () => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.ROLE_MASTER_LIST,
      {},
      {},
      {
        component: "TabMapping",
      }
    );
    if (!response) return;
    setActiveRoles(response?.data?.filter((role: ActiveRoleItem) => role.isActive === 1) || []);
  };

  useEffect(() => {
    if (isOpen) {
      getRoleMasterList();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setRoleId(null);
      setGrantedTabs([]);
      setPendingTabs([]);
      setGrantedTabsFilter([]);
      setPendingTabsFilter([]);
      setSelectedItems([]);
      setSuccessMessage("");
      setDragItem(null);
    }
  }, [isOpen]);

  const selectRoleHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    if (!val) {
      setRoleId(null);
      setGrantedTabs([]);
      setPendingTabs([]);
      setGrantedTabsFilter([]);
      setPendingTabsFilter([]);
      setSelectedItems([]);
      return;
    }

    setRoleId(val);

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_ROLE_WISE_IPD_TAB_LIST_MASTER,
      {},
      { params: { roleId: val } },
      { component: "TabMapping" }
    );

    const arr = (response?.data ?? []) as RoleTabItem[];
    const grantedValue = arr.filter(item => Number(item.isGranted) === 1);
    const pendingValue = arr.filter(item => Number(item.isGranted) !== 1);

    setGrantedTabs(grantedValue);
    setGrantedTabsFilter(grantedValue);
    setPendingTabs(pendingValue);
    setPendingTabsFilter(pendingValue);
    setSelectedItems([]);
  };

  const onChangePendingTabs = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (!value) {
      setPendingTabsFilter(pendingTabs);
      return;
    }
    setPendingTabsFilter(pendingTabs.filter(item => item.TabName?.toLowerCase().includes(value)));
  };

  const onChangeGrantedTabs = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (!value) {
      setGrantedTabsFilter(grantedTabs);
      return;
    }
    setGrantedTabsFilter(grantedTabs.filter(item => item.TabName?.toLowerCase().includes(value)));
  };

  const onDoubleTap = (callback: () => void) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      callback();
    }
    lastTapRef.current = now;
  };

  const onDragStart = (item: RoleTabItem, fromGranted: boolean) => {
    const sideSelectedItems =
      selectedItems.length > 0
        ? fromGranted
          ? grantedTabs.filter(tab => selectedItems.includes(tab.TabId))
          : pendingTabs.filter(tab => selectedItems.includes(tab.TabId))
        : [];

    const itemsToDrag = sideSelectedItems.length > 0 ? sideSelectedItems : [item];
    setDragItem({ items: itemsToDrag, fromGranted });
  };

  const onDropToPending = () => {
    if (!dragItem?.fromGranted) return;

    const grantedIds = new Set(dragItem.items.map(item => item.TabId));
    const updatedGranted = grantedTabs.filter(tab => !grantedIds.has(tab.TabId));
    const updatedPending = [...pendingTabs, ...dragItem.items];

    setGrantedTabs(updatedGranted);
    setGrantedTabsFilter(updatedGranted);
    setPendingTabs(updatedPending);
    setPendingTabsFilter(updatedPending);
    setDragItem(null);
    setSelectedItems([]);
  };

  const onDropToGranted = () => {
    if (!dragItem || dragItem.fromGranted) return;

    const pendingIds = new Set(dragItem.items.map(item => item.TabId));
    const updatedPending = pendingTabs.filter(tab => !pendingIds.has(tab.TabId));
    const updatedGranted = [...grantedTabs, ...dragItem.items];

    setPendingTabs(updatedPending);
    setPendingTabsFilter(updatedPending);
    setGrantedTabs(updatedGranted);
    setGrantedTabsFilter(updatedGranted);
    setDragItem(null);
    setSelectedItems([]);
  };

  const moveToGranted = (item: RoleTabItem) => {
    const updatedPending = pendingTabs.filter(tab => tab.TabId !== item.TabId);
    const updatedGranted = [...grantedTabs, item];

    setPendingTabs(updatedPending);
    setPendingTabsFilter(updatedPending);
    setGrantedTabs(updatedGranted);
    setGrantedTabsFilter(updatedGranted);
    setSelectedItems(prev => prev.filter(id => id !== item.TabId));
  };

  const moveToPending = (item: RoleTabItem) => {
    const updatedGranted = grantedTabs.filter(tab => tab.TabId !== item.TabId);
    const updatedPending = [...pendingTabs, item];

    setGrantedTabs(updatedGranted);
    setGrantedTabsFilter(updatedGranted);
    setPendingTabs(updatedPending);
    setPendingTabsFilter(updatedPending);
    setSelectedItems(prev => prev.filter(id => id !== item.TabId));
  };

  const moveAll = () => {
    if (pendingTabs.length > 0) {
      const updatedGranted = [...grantedTabs, ...pendingTabs];
      setGrantedTabs(updatedGranted);
      setGrantedTabsFilter(updatedGranted);
      setPendingTabs([]);
      setPendingTabsFilter([]);
      setSelectedItems([]);
      return;
    }

    if (grantedTabs.length > 0) {
      const updatedPending = [...pendingTabs, ...grantedTabs];
      setPendingTabs(updatedPending);
      setPendingTabsFilter(updatedPending);
      setGrantedTabs([]);
      setGrantedTabsFilter([]);
      setSelectedItems([]);
    }
  };

  const handleSubmit = async () => {
    if (!roleId) return;

    const payload = {
      roleId: Number(roleId),
      tabMappings: grantedTabs.map(item => ({
        tabId: item.TabId,
      })),
    };

    const response = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_UPDATE_ROLE_WISE_IPD_TAB_MAPPING,
      payload,
      {},
      { component: "TabMapping" }
    );

    if (!response?.result) return;

    setSuccessMessage(response?.message || "Tab mapping saved successfully");
    timerRef.current = setTimeout(() => {
      onClose();
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const onItemClick = (e: MouseEvent, item: RoleTabItem) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (!isCtrl) return;

    setSelectedItems(prev => {
      if (prev.includes(item.TabId)) {
        return prev.filter(id => id !== item.TabId);
      }
      return [...prev, item.TabId];
    });
  };

  const itemClass = (item: RoleTabItem) =>
    `item-border cursor-pointer select-none p-2 rounded mb-1 ${
      selectedItems.includes(item.TabId) ? "text-blue-600 font-medium" : ""
    }`;

  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div className={`drawer-layout drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-start justify-between p-4 gap-4">
          <button type="button" onClick={onClose} className="drawer-close-btn">
            ×
          </button>

          <div className="flex flex-row gap-4 flex-1">
            <InputField label="Select Role" className="w-65">
              <select className="input-field" onChange={selectRoleHandler} value={roleId ?? ""}>
                <option value="">Select</option>
                {activeRoles.map(role => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </InputField>
          </div>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error.message} />}

        <div className="h-full flex flex-col pt-4">
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div
                className="box-border min-h-[300px] flex-1"
                onDragOver={e => e.preventDefault()}
                onDrop={onDropToPending}
              >
                <InputField>
                  <input
                    type="text"
                    placeholder="Search pending tabs"
                    onChange={onChangePendingTabs}
                    className="input-field mb-2"
                  />
                </InputField>

                <h3 className="heading-text text-center">Pending Tab Mapping</h3>

                {pendingTabsFilter.length === 0 && (
                  <p className="no-user-text text-center">No data found</p>
                )}

                {pendingTabsFilter.map(item => (
                  <div
                    key={item.TabId}
                    className={itemClass(item)}
                    draggable
                    onDragStart={() => onDragStart(item, false)}
                    onDoubleClick={() => moveToGranted(item)}
                    onTouchEnd={() => onDoubleTap(() => moveToGranted(item))}
                    onClick={e => onItemClick(e, item)}
                  >
                    {item.TabName}
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-center items-center gap-1 m-1">
                <button
                  type="button"
                  className="save-btn"
                  onClick={moveAll}
                  disabled={pendingTabs.length === 0 && grantedTabs.length === 0}
                >
                  <ArrowRightLeftIcon size={20} />
                </button>
              </div>

              <div
                className="box-border min-h-[300px] flex-1"
                onDragOver={e => e.preventDefault()}
                onDrop={onDropToGranted}
              >
                <InputField>
                  <input
                    type="text"
                    placeholder="Search mapped tabs"
                    onChange={onChangeGrantedTabs}
                    className="input-field mb-2"
                  />
                </InputField>

                <h3 className="heading-text text-center">Mapped Tab Mapping</h3>

                {grantedTabsFilter.length === 0 && (
                  <p className="no-user-text text-center">No data found</p>
                )}

                {grantedTabsFilter.map(item => (
                  <div
                    key={item.TabId}
                    className={itemClass(item)}
                    draggable
                    onDragStart={() => onDragStart(item, true)}
                    onDoubleClick={() => moveToPending(item)}
                    onTouchEnd={() => onDoubleTap(() => moveToPending(item))}
                    onClick={e => onItemClick(e, item)}
                  >
                    {item.TabName}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3">
              <button type="button" className="save-btn w-full" onClick={handleSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default TabMapping;
