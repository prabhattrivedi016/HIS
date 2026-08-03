import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import InputField from "../../components/customInputField";
import { SelectStyles } from "../../components/customSelect";
import { ENDPOINTS } from "../../config/defaults";
import useGlobalApi from "../../hooks/useGlobalApi";
import MrdPopUp from "./components/MrdPopup";
import { RackItem, RoomItem, ShelfItem } from "./types";

const MrdLocationMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [roomId, setRoomId] = useState<number | null>(null);
  const [rackId, setRackId] = useState<number | null>(null);
  const [shelfId, setShelfId] = useState<number | null>(null);

  const [popUpOpen, setPopUpOpen] = useState<boolean>(false);
  const [popupType, setPopupType] = useState<"room" | "rack" | "shelf" | null>(null);
  const [popupData, setPopupData] = useState<RoomItem | RackItem | ShelfItem | null>(null);
  const [roomLists, setRoomLists] = useState<RoomItem[]>([]);
  const [rackLists, setRackLists] = useState<RackItem[]>([]);
  const [shelfList, setShelfList] = useState<ShelfItem[]>([]);

  /*-----------------------------room master----------------------- */
  const getRooms = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_MRD_ROOM_MASTER,
      {},
      {
        params: { roomId: 0, activeFlag: 0 },
      }
    );
    setRoomLists(resp?.data ?? []);
  };

  const roomSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedRoomId = Number(e.target.value);

    setRoomId(selectedRoomId);
    setRackId(null);
    setRackLists([]);
    setShelfId(null);
    setShelfList([]);

    if (selectedRoomId) {
      getRacks(selectedRoomId);
    }
  };

  /*---------------rack master----------------------------*/
  const getRacks = async (id: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_MRD_RACK_MASTER,
      {},
      {
        params: { roomId: id, rackId: 0, activeFlag: 0 },
      }
    );

    setRackLists(resp?.data ?? []);
  };

  const rackSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedRackId = Number(e.target.value);

    setRackId(selectedRackId);
    setShelfId(null);
    setShelfList([]);

    if (selectedRackId) {
      getShelves(selectedRackId);
    }
  };
  /*---------------shelf master----------------------------*/
  const getShelves = async (id: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_MRD_SHELF_MASTER,
      {},
      {
        params: { roomId, rackId: id, shelfId: 0, activeFlag: 0 },
      }
    );
    setShelfList(resp?.data ?? []);
  };

  const shelfSelectOption = useMemo(
    () =>
      shelfList.map(i => ({
        label: i.name,
        value: i.shelfId,
      })),
    [shelfList]
  );

  const shelfSelectHandler = (selectedOption: { value: number; label: string } | null) => {
    const selectedShelfId = selectedOption?.value || null;
    setShelfId(selectedShelfId);
  };

  useEffect(() => {
    getRooms();
  }, []);

  const popupHandler = (type: "room" | "rack" | "shelf") => {
    let data: RoomItem | RackItem | ShelfItem | null = null;

    if (type === "room" && roomId) {
      data = roomLists.find(r => r.roomId === roomId) || null;
    } else if (type === "rack" && rackId) {
      data = rackLists.find(r => r.rackId === rackId) || null;
    } else if (type === "shelf" && shelfId) {
      data = shelfList.find(s => s.shelfId === shelfId) || null;
    }

    setPopupType(type);
    setPopupData(data);
    setPopUpOpen(true);
  };

  const closePopup = () => {
    setPopUpOpen(false);
    setPopupType(null);
    setPopupData(null);
  };

  const refreshData = async () => {
    await getRooms();
    if (roomId) {
      await getRacks(roomId);
      if (rackId) {
        await getShelves(rackId);
      }
    }
  };
  return (
    <div className="page-container">
      <h1 className="page-heading">MRD Location</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>MRD Location</span>
      </nav>
      <div className="card">
        <h2 className="card-title ">Location Details</h2>

        <div className="form-grid-4">
          <InputField label="Room">
            <div className="flex gap-2 items-center">
              <select className="input-field" value={roomId || ""} onChange={roomSelectHandler}>
                <option value="">Select</option>
                {roomLists?.map(i => (
                  <option key={i?.roomId} value={i?.roomId}>
                    {i?.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => popupHandler("room")}
                className="hover:opacity-70 transition-opacity"
              >
                <i className="fa-solid fa-circle-plus fa-xl"></i>
              </button>
            </div>
          </InputField>

          <InputField label="Rack">
            <div className="flex gap-2 items-center">
              <select className="input-field" value={rackId || ""} onChange={rackSelectHandler}>
                <option value="">Select</option>
                {rackLists?.map(i => (
                  <option key={i?.rackId} value={i?.rackId}>
                    {i?.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => popupHandler("rack")}
                className="hover:opacity-70 transition-opacity"
              >
                <i className="fa-solid fa-circle-plus fa-xl"></i>
              </button>
            </div>
          </InputField>

          <InputField label="Shelf">
            <div className="flex gap-2 items-center">
              <Select
                value={shelfId ? shelfSelectOption.find(opt => opt.value === shelfId) : null}
                options={shelfSelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={shelfSelectHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button
                onClick={() => popupHandler("shelf")}
                className="hover:opacity-70 transition-opacity"
              >
                <i className="fa-solid fa-circle-plus fa-xl"></i>
              </button>
            </div>
          </InputField>
        </div>
      </div>

      {popUpOpen && popupType && (
        <MrdPopUp
          isOpenTab={popUpOpen}
          headerName={
            popupData
              ? `Update ${popupType.charAt(0).toUpperCase() + popupType.slice(1)}`
              : `Create ${popupType.charAt(0).toUpperCase() + popupType.slice(1)}`
          }
          onCloseTab={closePopup}
          type={popupType}
          data={popupData}
          roomId={roomId}
          rackId={rackId}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
};

export default MrdLocationMaster;
