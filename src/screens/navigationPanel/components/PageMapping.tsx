import { ArrowRightLeftIcon } from "lucide-react";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGetBranchList from "../../../hooks/useGetBranchList";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { chunkArray } from "../../../utils/chunkApiData";
import { ActiveRoleItem, PageMappingProps, RoleItem } from "../types";

type DragPayload = {
  items: RoleItem[];
  fromGranted: boolean;
};

const PageMapping = ({ isOpen, onClose }: PageMappingProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { branchList } = useGetBranchList();
  const [roleId, setRoleId] = useState<number | null>(null);

  const [activeRoles, setActiveRoles] = useState<ActiveRoleItem[]>([]);
  const [grantedRole, setGrantedRole] = useState<RoleItem[]>([]);
  const [pendingRole, setPendingRole] = useState<RoleItem[]>([]);
  const [pendingRoleFilter, setPendingRoleFilter] = useState<RoleItem[]>([]);
  const [grantedRoleFilter, setGrantedRoleFilter] = useState<RoleItem[]>([]);
  const [dragItem, setDragItem] = useState<DragPayload | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastTapRef = useRef<number>(0);

  // role master list
  const getRoleMasterList = async () => {
    const response = await fetchApi("GET", ENDPOINTS.ROLE_MASTER_LIST);
    if (!response) return;
    setActiveRoles(response?.data?.filter((role: any) => role.isActive === 1) || []);
  };

  useEffect(() => {
    getRoleMasterList();
  }, []);

  const selectedBranchId = Number(branchList?.data?.[0]?.branchId);

  // select role handler
  const selectRoleHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setRoleId(val);

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_ROLE_WISE_MENU_MAPPING,
      {},
      {
        params: {
          branchId: 1,
          roleId: val,
        },
      }
    );

    const arr = response?.data || [];
    const grantedValue = arr.filter((g: any) => g?.isGranted === 1);
    const pendingValue = arr.filter((g: any) => g?.isGranted === 0);

    setGrantedRole(grantedValue);
    setGrantedRoleFilter(grantedValue);
    setPendingRole(pendingValue);
    setPendingRoleFilter(pendingValue);

    // clear selection on role change
    setSelectedItems([]);
  };

  // pending role search
  const onChangePendingRoles = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (!value) return setPendingRoleFilter(pendingRole);
    setPendingRoleFilter(pendingRole.filter(r => r?.subMenuName?.toLowerCase().includes(value)));
  };

  // granted role search
  const onChangeGrantedRole = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (!value) return setGrantedRoleFilter(grantedRole);
    setGrantedRoleFilter(grantedRole.filter(r => r?.subMenuName?.toLowerCase().includes(value)));
  };

  // double-tap helper using ref (persists across renders)
  const onDoubleTap = (callback: () => void) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      callback();
    }
    lastTapRef.current = now;
  };

  const onDragStart = (item: RoleItem, fromGranted: boolean) => {
    const sideSelectedItems =
      selectedItems.length > 0
        ? fromGranted
          ? grantedRole.filter(x => selectedItems.includes(x.subMenuId))
          : pendingRole.filter(x => selectedItems.includes(x.subMenuId))
        : [];

    const itemsToDrag = sideSelectedItems.length > 0 ? sideSelectedItems : [item];

    setDragItem({ items: itemsToDrag, fromGranted });
  };

  const onDropToPending = () => {
    if (!dragItem) return;

    if (dragItem.fromGranted) {
      const grantedIds = new Set(dragItem.items.map(i => i.subMenuId));
      const updatedGranted = grantedRole.filter(x => !grantedIds.has(x.subMenuId));
      const updatedPending = [...pendingRole, ...dragItem.items];

      setGrantedRole(updatedGranted);
      setGrantedRoleFilter(updatedGranted);

      setPendingRole(updatedPending);
      setPendingRoleFilter(updatedPending);
    }
    setDragItem(null);
    setSelectedItems([]);
  };

  const onDropToGranted = () => {
    if (!dragItem) return;

    if (!dragItem.fromGranted) {
      const pendingIds = new Set(dragItem.items.map(i => i.subMenuId));
      const updatedPending = pendingRole.filter(x => !pendingIds.has(x.subMenuId));
      const updatedGranted = [...grantedRole, ...dragItem.items];

      setPendingRole(updatedPending);
      setPendingRoleFilter(updatedPending);

      setGrantedRole(updatedGranted);
      setGrantedRoleFilter(updatedGranted);
    }
    setDragItem(null);
    setSelectedItems([]);
  };

  // move single item helpers (used by double-tap)
  const moveToGranted = (item: RoleItem) => {
    const updatedPending = pendingRole.filter(x => x.subMenuId !== item.subMenuId);
    const updatedGranted = [...grantedRole, item];

    setPendingRole(updatedPending);
    setPendingRoleFilter(updatedPending);

    setGrantedRole(updatedGranted);
    setGrantedRoleFilter(updatedGranted);

    setSelectedItems(prev => prev.filter(id => id !== item.subMenuId));
  };

  const moveToPending = (item: RoleItem) => {
    const updatedGranted = grantedRole.filter(x => x.subMenuId !== item.subMenuId);
    const updatedPending = [...pendingRole, item];

    setGrantedRole(updatedGranted);
    setGrantedRoleFilter(updatedGranted);

    setPendingRole(updatedPending);
    setPendingRoleFilter(updatedPending);

    setSelectedItems(prev => prev.filter(id => id !== item.subMenuId));
  };

  // move in one button
  const moveAll = () => {
    if (pendingRole.length > 0) {
      const updatedGranted = [...grantedRole, ...pendingRole];

      setGrantedRole(updatedGranted);
      setGrantedRoleFilter(updatedGranted);

      setPendingRole([]);
      setPendingRoleFilter([]);
      setSelectedItems([]);
      return;
    }

    if (grantedRole.length > 0) {
      const updatedPending = [...pendingRole, ...grantedRole];

      setPendingRole(updatedPending);
      setPendingRoleFilter(updatedPending);

      setGrantedRole([]);
      setGrantedRoleFilter([]);
      setSelectedItems([]);
    }
  };

  // submit handler
  const handleSubmit = async () => {
    if (!roleId || !selectedBranchId) return;

    const menuMapping = grantedRole.map(item => ({
      roleId: Number(roleId),
      branchId: Number(selectedBranchId),
      subMenuId: item.subMenuId,
    }));

    const chunks = chunkArray(menuMapping, 50);

    for (let i = 0; i < chunks.length; i++) {
      const payload = {
        branchId: Number(selectedBranchId),
        roleId: Number(roleId),
        isFirst: i === 0 ? 1 : 0,
        menuMappings: chunks[i],
      };

      const response = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_UPDATE_ROLE_WISE_MENU_MAPPING,
        payload
      );
      if (!response) return;

      setSuccessMessage(response?.message || "Saved successfully");
      timerRef.current = setTimeout(() => onClose(), 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const onItemClick = (e: MouseEvent, item: RoleItem) => {
    const isCtrl = (e as any).ctrlKey || (e as any).metaKey;
    if (!isCtrl) {
      return;
    }

    setSelectedItems(prev => {
      if (prev.includes(item.subMenuId)) {
        return prev.filter(id => id !== item.subMenuId);
      } else {
        return [...prev, item.subMenuId];
      }
    });
  };

  const itemClass = (item: RoleItem) =>
    `item-border cursor-pointer select-none p-2 rounded mb-1 ${
      selectedItems.includes(item.subMenuId) ? "text-blue-600 font-medium" : ""
    }`;

  return (
    <div className={`fixed inset-0 z-999 overflow-hidden`}>
      <div
        className={`drawer-bg-fade ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      />

      <div
        className={`drawer-layout drawer-bg 
        w-full sm:w-[380px] md:w-[450px] lg:w-[520px]
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-start justify-between p-4 gap-4">
          <button onClick={onClose} className="drawer-close-btn">
            ×
          </button>

          <div className="flex flex-row gap-4 flex-1">
            <InputField label="Select Role" className="w-65">
              <select className="input-field" onChange={selectRoleHandler} value={roleId ?? ""}>
                <option value="">Select</option>
                {activeRoles?.map(role => (
                  <option key={role.roleId} value={role?.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </InputField>
          </div>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error} />}

        <div className="h-full flex flex-col pt-4">
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* pending users */}
              <div
                className="box-border min-h-[300px] flex-1"
                onDragOver={e => e.preventDefault()}
                onDrop={onDropToPending}
              >
                <InputField>
                  <input
                    type="text"
                    placeholder="search pending users"
                    onChange={onChangePendingRoles}
                    className="input-field mb-2"
                  />
                </InputField>

                <h3 className="heading-text text-center">Pending Menu</h3>

                {pendingRoleFilter.length === 0 && (
                  <p className="no-user-text text-center">No data found</p>
                )}

                {pendingRoleFilter.map(item => (
                  <div
                    key={item.subMenuId}
                    className={itemClass(item)}
                    draggable
                    onDragStart={() => onDragStart(item, false)}
                    onDoubleClick={() => moveToGranted(item)}
                    onTouchEnd={() => onDoubleTap(() => moveToGranted(item))}
                    onClick={(e: MouseEvent) => onItemClick(e, item)}
                  >
                    {item.subMenuName}
                  </div>
                ))}
              </div>

              {/* single button to move all */}
              <div className="flex flex-col justify-center items-center gap-1 m-1">
                <button
                  className="submit-btn px-4 py-2"
                  onClick={moveAll}
                  disabled={pendingRole.length === 0 && grantedRole.length === 0}
                >
                  <ArrowRightLeftIcon size={20} />
                </button>
              </div>

              {/* granted users */}
              <div
                className="box-border min-h-[300px] flex-1"
                onDragOver={e => e.preventDefault()}
                onDrop={onDropToGranted}
              >
                <InputField>
                  <input
                    type="text"
                    placeholder="search mapped users"
                    onChange={onChangeGrantedRole}
                    className="input-field mb-2"
                  />
                </InputField>

                <h3 className="heading-text text-center">Mapped Menu</h3>

                {grantedRoleFilter.length === 0 && (
                  <p className="no-user-text text-center">No data found</p>
                )}

                {grantedRoleFilter.map(item => (
                  <div
                    key={item.subMenuId}
                    className={itemClass(item)}
                    draggable
                    onDragStart={() => onDragStart(item, true)}
                    onDoubleClick={() => moveToPending(item)}
                    onTouchEnd={() => onDoubleTap(() => moveToPending(item))}
                    onClick={(e: MouseEvent) => onItemClick(e, item)}
                  >
                    {item.subMenuName}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3">
              <button type="submit" className="submit-btn" onClick={handleSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default PageMapping;
