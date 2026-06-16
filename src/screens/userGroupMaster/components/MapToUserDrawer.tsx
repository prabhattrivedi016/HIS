import { ArrowRightLeftIcon } from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { Spinner } from "../../../../assets/svgIcons";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader/index";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText/index";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { UserItem } from "../type";
import { MapToUserDrawerProps, UserGroupItem } from "./types";

const MapToUserDrawer = ({ isOpen, onClose, groupId }: MapToUserDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [userGroupList, setUserGroupList] = useState<UserGroupItem[]>([]);
  const [grantedUsers, setGrantedUsers] = useState<UserGroupItem[]>([]);
  const [notGrantedUsers, setNotGrantedUsers] = useState<UserGroupItem[]>([]);
  const [draggedUser, setDraggedUser] = useState<UserItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [pendingUsers, setPendingUsers] = useState<UserGroupItem[]>([]);
  const [mappedUsers, setMappedUsers] = useState<UserGroupItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  //  double-tap handler (for mobile & desktop touch)
  const lastTapRef = useRef(0);
  const handleDoubleTap = (callback: () => void) => {
    const now = Date.now();
    const timeSince = now - lastTapRef.current;

    if (timeSince > 0 && timeSince < 300) {
      callback();
    }

    lastTapRef.current = now;
  };

  // Fetch user group member list
  const getUserGroupMemberList = async () => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.USER_GROUP_MEMBER_LIST,
      {},
      { params: { groupId } }
    );

    setUserGroupList(response?.data ?? []);
  };

  useEffect(() => {
    if (groupId) getUserGroupMemberList();
  }, [groupId]);

  // Filter granted / not granted users
  useEffect(() => {
    const granted = userGroupList.filter(u => u.isGranted === 1);
    const notGranted = userGroupList.filter(u => u.isGranted === 0);

    setGrantedUsers(granted);
    setNotGrantedUsers(notGranted);

    setMappedUsers(granted);
    setPendingUsers(notGranted);
  }, [userGroupList]);

  // drag handler
  const onDragStart = (user: UserItem) => {
    setDraggedUser(user);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const onDropGranted = () => {
    if (!draggedUser) return;

    setGrantedUsers(prev => [...prev, draggedUser]);
    setNotGrantedUsers(prev => prev.filter(u => u.userId !== draggedUser.userId));

    setMappedUsers(prev => [...prev, draggedUser]);
    setPendingUsers(prev => prev.filter(u => u.userId !== draggedUser.userId));

    setDraggedUser(null);
  };

  const onDropNotGranted = () => {
    if (!draggedUser) return;

    setNotGrantedUsers(prev => [...prev, draggedUser]);
    setGrantedUsers(prev => prev.filter(u => u.userId !== draggedUser.userId));

    setPendingUsers(prev => [...prev, draggedUser]);
    setMappedUsers(prev => prev.filter(u => u.userId !== draggedUser.userId));

    setDraggedUser(null);
  };

  // double click / double tap handler
  const onUserDoubleClick = (user: UserItem, isGranted: boolean) => {
    if (isGranted) {
      setNotGrantedUsers(prev => [...prev, user]);
      setGrantedUsers(prev => prev.filter(u => u.userId !== user.userId));

      setPendingUsers(prev => [...prev, user]);
      setMappedUsers(prev => prev.filter(u => u.userId !== user.userId));
    } else {
      setGrantedUsers(prev => [...prev, user]);
      setNotGrantedUsers(prev => prev.filter(u => u.userId !== user.userId));

      setMappedUsers(prev => [...prev, user]);
      setPendingUsers(prev => prev.filter(u => u.userId !== user.userId));
    }
  };

  // save handler
  const handleSave = async () => {
    const payload = {
      groupId,
      userIds: grantedUsers.map(user => user.userId),
    };
    const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_USER_GROUP_MEMBER, payload);
    if (!response) return;
    setSuccessMessage(response?.message);
    timerRef.current = setTimeout(() => {
      onClose();
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // search filter
  const filterUsers = (value: string, users: UserItem[]) => {
    return users.filter(user => user?.userName?.toLowerCase().includes(value));
  };

  // mapped search
  const onChangeMappedUser = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();

    if (!value) {
      setMappedUsers(grantedUsers);
      return;
    }

    setMappedUsers(filterUsers(value, grantedUsers));
  };

  // pending search
  const onChangePendingUser = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();

    if (!value) {
      setPendingUsers(notGrantedUsers);
      return;
    }

    setPendingUsers(filterUsers(value, notGrantedUsers));
  };

  const moveAll = () => {
    // move pending → mapped
    if (pendingUsers.length > 0) {
      setGrantedUsers(prev => [...prev, ...pendingUsers]);
      setMappedUsers(prev => [...prev, ...pendingUsers]);

      setNotGrantedUsers([]);
      setPendingUsers([]);
      return;
    }

    // move mapped → pending
    if (mappedUsers.length > 0) {
      setNotGrantedUsers(prev => [...prev, ...mappedUsers]);
      setPendingUsers(prev => [...prev, ...mappedUsers]);

      setGrantedUsers([]);
      setMappedUsers([]);
    }
  };

  return (
    <div className="drawer-container">
      <div
        className={`drawer-bg-fade
        ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      />

      <div
        className={`drawer-layout drawer-bg   
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <button onClick={onClose} className="drawer-close-btn">
          ×
        </button>

        {successMessage ? <SuccessMessage text={successMessage} /> : <></>}
        {error ? <ErrorMessage text={error} /> : <></>}

        <div className="h-full flex flex-col pt-4">
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* pending users */}
              <div className="box-border" onDragOver={onDragOver} onDrop={onDropNotGranted}>
                <InputField>
                  <input
                    type="text"
                    placeholder="search pending users"
                    onChange={onChangePendingUser}
                    className="input-field mb-2"
                  />
                </InputField>

                <h3 className="heading-text">Pending Users</h3>

                {pendingUsers.length === 0 && <p className="no-user-text">No users</p>}

                {pendingUsers.map(item => (
                  <div
                    key={item.userId}
                    draggable
                    onDragStart={() => onDragStart(item)}
                    // desktop double-click
                    onDoubleClick={() => onUserDoubleClick(item, false)}
                    // mobile + desktop touch → double tap
                    onTouchEnd={() => handleDoubleTap(() => onUserDoubleClick(item, false))}
                    className="item-border"
                  >
                    {item?.userName}
                  </div>
                ))}
              </div>

              {/* single button to move all */}
              <div className="flex flex-col justify-center items-center gap-1 ">
                <button
                  className="save-btn"
                  onClick={moveAll}
                  disabled={pendingUsers.length === 0 && mappedUsers.length === 0}
                >
                  <ArrowRightLeftIcon size={20} />
                </button>
              </div>

              {/* granted users */}
              <div className="box-border" onDragOver={onDragOver} onDrop={onDropGranted}>
                <InputField>
                  <input
                    type="text"
                    onChange={onChangeMappedUser}
                    placeholder="search mapped users"
                    className="input-field mb-2"
                  />
                </InputField>

                <h3 className="heading-text">Mapped Users</h3>

                {mappedUsers.length === 0 && <p className="no-user-text">No users</p>}

                {mappedUsers.map(item => (
                  <div
                    key={item.userId}
                    draggable
                    onDragStart={() => onDragStart(item)}
                    // desktop double-click
                    onDoubleClick={() => onUserDoubleClick(item, true)}
                    // mobile double tap
                    onTouchEnd={() => handleDoubleTap(() => onUserDoubleClick(item, true))}
                    className="item-border"
                  >
                    {item?.userName}
                  </div>
                ))}
              </div>
            </div>

            <div className=" p-3">
              <button className="w-full save-btn" onClick={handleSave}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default MapToUserDrawer;
