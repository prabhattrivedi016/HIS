import { showError, showSuccess } from "@/utils/alert";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { chunkArray } from "../../../utils/chunkApiData";
import { ChildProps, DischargeProcessItem } from "../types";

const DischargeProcessMapping = ({ branchId, typeId, userId }: ChildProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [filteredData, setFilteredData] = useState<DischargeProcessItem[]>([]);
  const [dischargeProcessData, setDischargeProcessData] = useState<DischargeProcessItem[]>([]);
  const [activeButton, setActiveButton] = useState<string>("");

  // corporate mapping handler
  const dischargeProcessMappingHandler = async () => {
    if (!branchId || !typeId || !userId) return;
    setActiveButton("all");

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_DISCHARGE_PROCESS_MAPPING,
      {},
      { params: { branchId, typeId, userId } }
    );

    setFilteredData(response?.data ?? []);
    setDischargeProcessData(response?.data ?? []);
  };

  useEffect(() => {
    dischargeProcessMappingHandler();
  }, [branchId, typeId, userId]);

  //search handler
  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredRole = dischargeProcessData?.filter((u: DischargeProcessItem) =>
      u?.ProcessName?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredData(filteredRole);
  };

  //toggle single handler
  const toggleSingleHandler = (id: number) => {
    setDischargeProcessData(prev =>
      prev.map(item =>
        item?.DischargeProcessId === id
          ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 }
          : item
      )
    );

    setFilteredData(prev =>
      prev.map(item =>
        item?.DischargeProcessId === id
          ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 }
          : item
      )
    );
  };

  //toggle all handler
  const toggleAllHandler = () => {
    const allGranted =
      dischargeProcessData.length > 0 && dischargeProcessData.every(item => item.isGranted === 1);

    const updated = dischargeProcessData.map(item => ({
      ...item,
      isGranted: allGranted ? 0 : 1,
    }));

    setDischargeProcessData(updated);
    setFilteredData(updated);
  };

  //All handler
  const filterAllHandler = () => {
    setActiveButton("all");
    setFilteredData(dischargeProcessData ?? []);
  };

  // remaining handler
  const remainingHandler = () => {
    setActiveButton("remaining");

    const remaining =
      dischargeProcessData?.filter((r: DischargeProcessItem) => r?.isGranted === 0) ?? [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    setActiveButton("granted");

    const granted = dischargeProcessData.filter(item => item.isGranted === 1) ?? [];
    setFilteredData(granted);
  };

  //submit handle

  const saveCorporateMappingHandler = useCallback(async () => {
    if (!dischargeProcessData || dischargeProcessData?.length === 0) return;

    const dischargeProcess = dischargeProcessData
      ?.filter((u: DischargeProcessItem) => u.isGranted === 1)
      .map((u: DischargeProcessItem) => ({
        branchId: branchId,
        typeId: typeId,
        userId: userId,
        DischargeProcessId: u?.DischargeProcessId,
      }));

    if (dischargeProcess.length === 0) return;

    const chunks = chunkArray(dischargeProcess, 50);

    for (let i = 0; i < chunks.length; i++) {
      const resp = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_DISCHARGE_PROCESS_MAPPING, {
        branchId: branchId,
        typeId: typeId,
        userId: userId,
        isFirst: i === 0 ? 1 : 0,
        userDischargeProcessMappings: chunks[i],
      });
      if (!resp?.result) {
        showError(error?.message ?? "Failed to update discharge process mapping");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      await dischargeProcessMappingHandler?.();
    }
  }, [dischargeProcessData, branchId, typeId, userId]);

  return (
    <div className="card">
      {/* Header buttons */}
      <div className="flex justify-between flex-wrap  -mt-3">
        <div className="flex gap-1">
          <button
            className={`table-header-button ${activeButton === "all" ? "save-btn" : "cursor-pointer"}`}
            onClick={filterAllHandler}
          >
            All
          </button>

          <button
            className={`table-header-button ${activeButton === "remaining" ? "save-btn" : "cursor-pointer"}`}
            onClick={remainingHandler}
          >
            Remaining
          </button>

          <button
            className={`table-header-button ${activeButton === "granted" ? "save-btn" : "cursor-pointer"}`}
            onClick={grantedHandler}
          >
            Granted
          </button>
        </div>

        <button className="table-header-button save-btn" onClick={saveCorporateMappingHandler}>
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

              <th className="table-name-header">Discharge Process Name</th>

              <th className="table-name-header">Discharge Process Key</th>

              {/* SEARCH */}
              <th className="table-search-header">
                <input
                  className="table-search-input input-field mt-2"
                  placeholder="Search discharge process"
                  onChange={onSearchHandler}
                />
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
            {filteredData?.length > 0 ? (
              filteredData.map((item: DischargeProcessItem, idx) => (
                <tr
                  key={item?.DischargeProcessId}
                  className="table-row"
                  onClick={() => toggleSingleHandler(item?.DischargeProcessId)}
                >
                  {/* INDEX */}
                  <td className="table-cell">{idx + 1}</td>

                  {/* PROCESS NAME */}
                  <td className="table-cell">
                    <span
                      className={`status-badge ${
                        item?.isGranted === 1 ? "status-success" : "status-inactive"
                      }`}
                    >
                      {item?.ProcessName}
                    </span>
                  </td>

                  {/* PROCESS KEY */}
                  <td className="table-cell table-text-truncate">{item?.ProcessKey}</td>

                  {/* SEARCH COLUMN / SPACER */}
                  <td className="table-cell" />

                  {/* TOGGLE */}
                  <td className="table-action-cell">
                    <div onClick={e => e.stopPropagation()}>
                      <ToggleButton
                        checked={item?.isGranted === 1}
                        onClick={() => toggleSingleHandler(item?.DischargeProcessId)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="table-empty">
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

export default React.memo(DischargeProcessMapping);
