import { showError, showSuccess } from "@/utils/alert";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { chunkArray } from "../../../utils/chunkApiData";
import { BedMappingItem, ChildProps } from "../types";

const RoomMapping = ({ branchId, typeId, userId }: ChildProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [filteredData, setFilteredData] = useState<BedMappingItem[]>([]);
  const [roomData, setRoomData] = useState<BedMappingItem[]>([]);
  const [activeButton, setActiveButton] = useState<string>("");

  // user bed mapping handler
  const userBedMappingHandler = async () => {
    setActiveButton("all");
    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_BED_MAPPING,
      {},
      { params: { branchId, typeId, userId } }
    );

    setFilteredData(response?.data ?? []);
    setRoomData(response?.data ?? []);
  };

  useEffect(() => {
    userBedMappingHandler();
  }, [branchId, typeId, userId]);

  //search handler
  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredRole = roomData?.filter((u: BedMappingItem) =>
      u?.name?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredData(filteredRole);
  };

  //toggle single handler
  const toggleSingleHandler = (id: number) => {
    setRoomData(prev =>
      prev.map(item =>
        item.serviceItemId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );

    setFilteredData(prev =>
      prev.map(item =>
        item.serviceItemId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );
  };

  //toggle all handler
  const toggleAllHandler = () => {
    const allGranted = roomData.length > 0 && roomData.every(item => item.isGranted === 1);

    const updated = roomData.map(item => ({
      ...item,
      isGranted: allGranted ? 0 : 1,
    }));

    setRoomData(updated);
    setFilteredData(updated);
  };

  //All handler
  const filterAllHandler = () => {
    setActiveButton("all");

    setFilteredData(roomData ?? []);
  };

  // remaining handler
  const remainingHandler = () => {
    setActiveButton("remaining");

    const remaining = roomData?.filter((r: BedMappingItem) => r?.isGranted === 0) ?? [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    setActiveButton("granted");

    const granted = roomData.filter(item => item.isGranted === 1) ?? [];
    setFilteredData(granted);
  };

  //submit handler

  const saveRoomDataHandler = useCallback(async () => {
    if (!roomData || roomData.length === 0) return;

    const grantedBeds = roomData
      .filter((u: BedMappingItem) => u.isGranted === 1)
      .map((u: BedMappingItem) => ({
        branchId,
        typeId,
        userId,
        serviceItemId: u.serviceItemId,
      }));

    if (grantedBeds.length === 0) return;

    const chunks = chunkArray(grantedBeds, 50);

    for (let i = 0; i < chunks.length; i++) {
      const resp = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_BED_MAPPING, {
        branchId,
        typeId,
        userId,
        isFirst: i === 0 ? 1 : 0,
        userBeds: chunks[i],
      });
      if (!resp?.result) {
        showError(error?.message);
        return;
      }
      showSuccess(resp?.message);
    }
  }, [roomData, branchId, typeId, userId]);

  return (
    <div className="card">
      {/* Header buttons */}
      <div className="flex justify-between flex-wrap -mt-3">
        <div className="flex gap-1">
          <button
            className={`text-sm table-header-button ${activeButton === "all" ? "save-btn" : "cursor-pointer"}`}
            onClick={filterAllHandler}
          >
            All
          </button>

          <button
            className={`text-sm table-header-button ${activeButton === "remaining" ? "save-btn" : "cursor-pointer"}`}
            onClick={remainingHandler}
          >
            Remaining
          </button>

          <button
            className={`text-sm table-header-button ${activeButton === "granted" ? "save-btn" : "cursor-pointer"}`}
            onClick={grantedHandler}
          >
            Granted
          </button>
        </div>

        <button className="table-header-button save-btn" onClick={saveRoomDataHandler}>
          Save
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          {/* TABLE HEADER */}
          <thead className="table-header">
            <tr>
              <th className="table-index-header">#</th>

              <th className="table-name-header">
                <div className="table-header-content">
                  <span className="table-title">Room Name</span>

                  <input
                    className="table-search-input input-field"
                    placeholder="search room name"
                    onChange={onSearchHandler}
                  />
                </div>
              </th>

              {/* TOGGLE ALL */}
              <th className="table-action-header">
                <ToggleButton
                  disabled={filteredData?.length === 0}
                  checked={
                    filteredData?.length > 0 && filteredData?.every(item => item?.isGranted === 1)
                  }
                  onClick={toggleAllHandler}
                />
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody>
            {!!filteredData && filteredData.length > 0 ? (
              filteredData.map((item: BedMappingItem, idx) => (
                <tr
                  key={item?.serviceItemId}
                  className="table-row"
                  onClick={() => toggleSingleHandler(item?.serviceItemId)}
                >
                  <td className="table-cell">{idx + 1}</td>

                  <td className="table-cell">
                    <span
                      className={`status-badge ${
                        item?.isGranted === 1 ? "status-success" : "status-inactive"
                      }`}
                    >
                      {item?.name}
                    </span>
                  </td>

                  <td className="table-action-cell">
                    <div onClick={e => e.stopPropagation()}>
                      <ToggleButton
                        checked={item?.isGranted === 1}
                        onClick={() => toggleSingleHandler(item?.serviceItemId)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="table-empty">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!!loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default React.memo(RoomMapping);
