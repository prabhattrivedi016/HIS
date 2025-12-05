import { useEffect, useRef, useState } from "react";
import { Spinner } from "../../../../assets/svgIcons";
import Button from "../../../components/customButton";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader/index";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText/index";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { MapToUserDrawerProps } from "./types";

const MapToUserDrawer = ({ isOpen, onClose, groupId }: MapToUserDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [userGroupList, setUserGroupList] = useState([]);
  const [grantedUsers, setGrantedUsers] = useState([]);
  const [notGrantedUsers, setNotGrantedUsers] = useState([]);
  const [draggedUser, setDraggedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [mappedUsers, setMappedUsers] = useState([]);
  const timerRef = useRef(null);

  //  double-tap handler (for mobile & desktop touch)
  const lastTapRef = useRef(0);
  const handleDoubleTap = callback => {
    const now = Date.now();
    const timeSince = now - lastTapRef.current;

    if (timeSince > 0 && timeSince < 300) {
      callback(); // double tap detected
    }

    lastTapRef.current = now;
  };

  // Fetch user group member list
  const getUserGroupMemberList = async () => {
    try {
      const response = await fetchApi(
        "GET",
        ENDPOINTS.USER_GROUP_MEMBER_LIST,
        {},
        { params: { groupId } }
      );

      setUserGroupList(response?.data || []);
    } catch (error) {
      console.error("Error fetching user group member list");
    }
  };

  useEffect(() => {
    if (groupId) getUserGroupMemberList();
  }, []);

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
  const onDragStart = user => {
    setDraggedUser(user);
  };

  const onDragOver = e => e.preventDefault();

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
  const onUserDoubleClick = (user, isGranted) => {
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
    try {
      const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_USER_GROUP_MEMBER, payload);
      if (!response) return;
      setSuccessMessage(response?.message);
      timerRef.current = setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      setSuccessMessage("");
      console.error("Error while updating the user group member", error);
    }
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  // search filter
  const filterUsers = (value, users) => {
    return users.filter(user => user?.userName?.toLowerCase().includes(value));
  };

  // mapped search
  const onChangeMappedUser = e => {
    const value = e.target.value.trim().toLowerCase();

    if (!value) {
      setMappedUsers(grantedUsers);
      return;
    }

    setMappedUsers(filterUsers(value, grantedUsers));
  };

  // pending search
  const onChangePendingUser = e => {
    const value = e.target.value.trim().toLowerCase();

    if (!value) {
      setPendingUsers(notGrantedUsers);
      return;
    }

    setPendingUsers(filterUsers(value, notGrantedUsers));
  };

  return (
    <div className={`fixed inset-0 z-999 overflow-hidden`}>
      <div
        className={`drawer-bg-fade
        ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      />

      <div
        className={`drawer-layout drawer-bg
          w-full sm:w-[380px] md:w-[450px] lg:w-[520px]
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

                {pendingUsers.map((item, idx) => (
                  <div
                    key={idx}
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

                {mappedUsers.map((item, idx) => (
                  <div
                    key={idx}
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
              <Button variant="primary" className="w-full" onClick={handleSave}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default MapToUserDrawer;
