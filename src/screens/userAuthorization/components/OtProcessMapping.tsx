import { showError, showSuccess } from "@/utils/alert";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { chunkArray } from "../../../utils/chunkApiData";
import { ChildProps, OtPrcoessMappingTableItem } from "../types";

const OtProcessMapping = ({ branchId, typeId, userId }: ChildProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [filteredData, setFilteredData] = useState<OtPrcoessMappingTableItem[]>([]);
  const [otProcessData, setOtProcessData] = useState<OtPrcoessMappingTableItem[]>([]);
  const [activeButton, setActiveButton] = useState<string>("");

  // corporate mapping handler
  const otProcessMappingHandler = async () => {
    if (!branchId || !typeId || !userId) return;
    setActiveButton("all");

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_OTP_PROCESS_MAPPING,
      {},
      { params: { branchId, typeId, userId } }
    );

    setFilteredData(response?.data ?? []);
    setOtProcessData(response?.data ?? []);
  };

  useEffect(() => {
    otProcessMappingHandler();
  }, [branchId, typeId, userId]);

  //search handler
  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredRole = otProcessData?.filter((u: OtPrcoessMappingTableItem) =>
      u?.ProcessName?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredData(filteredRole);
  };

  //toggle single handler
  const toggleSingleHandler = (id: number) => {
    setOtProcessData(prev =>
      prev.map(item =>
        item?.OTProcessId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );

    setFilteredData(prev =>
      prev.map(item =>
        item?.OTProcessId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );
  };

  //toggle all handler
  const toggleAllHandler = () => {
    const allGranted =
      otProcessData.length > 0 && otProcessData.every(item => item.isGranted === 1);

    const updated = otProcessData.map(item => ({
      ...item,
      isGranted: allGranted ? 0 : 1,
    }));

    setOtProcessData(updated);
    setFilteredData(updated);
  };

  //All handler
  const filterAllHandler = () => {
    setActiveButton("all");
    setFilteredData(otProcessData ?? []);
  };

  // remaining handler
  const remainingHandler = () => {
    setActiveButton("remaining");

    const remaining =
      otProcessData?.filter((r: OtPrcoessMappingTableItem) => r?.isGranted === 0) ?? [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    setActiveButton("granted");

    const granted = otProcessData.filter(item => item.isGranted === 1) ?? [];
    setFilteredData(granted);
  };

  //submit handle

  const saveCorporateMappingHandler = useCallback(async () => {
    const otProcess = otProcessData
      ?.filter((u: OtPrcoessMappingTableItem) => u.isGranted === 1)
      .map((u: OtPrcoessMappingTableItem) => ({
        branchId: branchId,
        typeId: typeId,
        userId: userId,
        otProcessId: u?.OTProcessId,
      }));

    const chunks = otProcess.length > 0 ? chunkArray(otProcess, 50) : [[]];

    for (let i = 0; i < chunks.length; i++) {
      const resp = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_OT_PROCESS_MAPPING, {
        branchId: branchId,
        typeId: typeId,
        userId: userId,
        isFirst: i === 0 ? 1 : 0,
        userOTProcessMappings: chunks[i],
      });
      if (!resp?.result) {
        showError(error?.message ?? "Failed to update discharge process mapping");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      await otProcessMappingHandler?.();
    }
  }, [otProcessData, branchId, typeId, userId]);

  return (
    <div className="card">
      {/* Header buttons */}
      <div className="flex justify-between flex-wrap  -mt-3">
        <div className="flex gap-1">
          <button
            className={` text-sm table-header-button ${activeButton === "all" ? "save-btn" : "cursor-pointer"}`}
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
            className={` text-sm table-header-button ${activeButton === "granted" ? "save-btn" : "cursor-pointer"}`}
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

              <th className="table-name-header">OT Process Key</th>

              <th className="table-name-header">OT Process Name</th>

              {/* SEARCH */}
              <th className="table-search-header">
                <input
                  className="table-search-input input-field mt-2"
                  placeholder="Search OT process"
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
              filteredData.map((item: OtPrcoessMappingTableItem, idx) => (
                <tr
                  key={item?.OTProcessId}
                  className="table-row"
                  onClick={() => toggleSingleHandler(item?.OTProcessId)}
                >
                  {/* INDEX */}
                  <td className="table-cell">{idx + 1}</td>

                  {/* PROCESS KEY */}
                  <td className="table-cell table-text-truncate">{item?.ProcessKey}</td>

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

                  {/* SEARCH COLUMN / SPACER */}
                  <td className="table-cell" />

                  {/* TOGGLE */}
                  <td className="table-action-cell">
                    <div onClick={e => e.stopPropagation()}>
                      <ToggleButton
                        checked={item?.isGranted === 1}
                        onClick={() => toggleSingleHandler(item?.OTProcessId)}
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

export default React.memo(OtProcessMapping);
