import { useEffect, useRef, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
const GridRightTopButtonMenu = ({ position, userGroupId, onClose, onRefresh }) => {
  const { loading, fetchApi } = useGlobalApi();

  const [isActive, setIsActive] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // fetch user by id
  const getUserGroupMaster = async (userGroupId: number) => {
    try {
      const response = await fetchApi(
        "GET",
        ENDPOINTS.USER_GROUP_LIST,
        {},

        {
          params: { id: userGroupId },
        }
      );
      setIsActive(response?.data[0]?.isActive);
    } catch (error) {
      console.error("Error while updating the user group status");
    }
  };
  useEffect(() => {
    setIsActive(null);
    getUserGroupMaster(userGroupId);
  }, [userGroupId]);

  // active handler
  const activeHandler = async () => {
    try {
      setUpdateLoading(true);
      const response = await fetchApi(
        "PATCH",
        ENDPOINTS.UPDATE_USER_GROUP_STATUS,
        {},
        {
          params: {
            id: userGroupId,
            isActive: isActive === 1 ? 0 : 1,
          },
        }
      );
      if (!response) return;
      onRefresh();
      await getUserGroupMaster(userGroupId);
    } catch (error) {
      console.error("Error changing status", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div
      ref={popupRef}
      className="btn-popup"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
    >
      <button onClick={activeHandler} className="data-downlaod-popup-btn">
        {isActive ? (isActive === 1 ? "Inactive" : "Active") : ""}
      </button>

      {loading ? <CustomLoader isLoading={updateLoading} /> : <></>}
    </div>
  );
};

export default GridRightTopButtonMenu;
