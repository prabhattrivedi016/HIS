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

  // user bed mapping handler
  const userBedMappingHandler = async () => {
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
    setFilteredData(roomData || []);
  };

  // remaining handler
  const remainingHandler = () => {
    const remaining = roomData?.filter((r: BedMappingItem) => r?.isGranted === 0) || [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    const granted = roomData.filter(item => item.isGranted === 1) || [];
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
      await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_BED_MAPPING, {
        branchId,
        typeId,
        userId,
        isFirst: i === 0 ? 1 : 0,
        userBeds: chunks[i],
      });
    }
  }, [roomData, branchId, typeId, userId]);

  return (
    <div className="bg-white rounded-2xl shadow-md mt-2 p-2">
      {/* Header buttons */}
      <div className="flex justify-between flex-wrap gap-3 mb-2">
        <div className="flex gap-1">
          <button className="table-header-button" onClick={filterAllHandler}>
            All
          </button>
          <button className="table-header-button" onClick={remainingHandler}>
            Remaining
          </button>
          <button className="table-header-button" onClick={grantedHandler}>
            Granted
          </button>
        </div>

        <button
          className="table-header-button text-white bg-[#0b5394]"
          onClick={saveRoomDataHandler}
        >
          Save
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-300 overflow-y-auto rounded-lg min-h-[300px] max-h-[400px]">
        <table className="min-w-full table-fixed border-collapse">
          {/* TABLE HEADER */}
          <thead className="bg-blue-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-16">#</th>

              {/* Role Name + small search */}
              <th className="px-5 py-3 font-semibold text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="block whitespace-nowrap overflow-hidden text-ellipsis ">
                    Room Name
                  </span>
                  <input
                    className="input-field h-10 max-w-[250px] text-sm ml-20 "
                    placeholder="search..."
                    onChange={onSearchHandler}
                  />
                </div>
              </th>

              {/* Toggle All */}
              <th className="px-4 py-3 text-center font-semibold text-gray-700 w-32">
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
              filteredData?.map((item: BedMappingItem, idx) => (
                <tr key={item?.serviceItemId} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>

                  <td className="px-4 py-3 text-gray-800">{item?.name}</td>

                  <td className="px-4 py-3 text-center">
                    <ToggleButton
                      checked={item.isGranted === 1}
                      onClick={() => toggleSingleHandler(item?.serviceItemId)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500 italic">
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
