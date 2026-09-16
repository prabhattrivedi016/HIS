import { showError, showSuccess } from "@/utils/alert";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { chunkArray } from "../../../utils/chunkApiData";
import { ChildProps, CorporateMappingItem } from "../types";

const CorporateMapping = ({ branchId, typeId, userId }: ChildProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [filteredData, setFilteredData] = useState<CorporateMappingItem[]>([]);
  const [corporateData, setCorporateData] = useState<CorporateMappingItem[]>([]);
  const [activeButton, setActiveButton] = useState<string>("");

  // corporate mapping handler
  const corporateMappingHandler = async () => {
    if (!branchId || !typeId || !userId) return;
    setActiveButton("all");

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_CORPORATE_MAPPING,
      {},
      { params: { branchId, typeId, userId } }
    );

    setFilteredData(response?.data ?? []);
    setCorporateData(response?.data ?? []);
  };

  useEffect(() => {
    corporateMappingHandler();
  }, [branchId, typeId, userId]);

  //search handler
  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredRole = corporateData?.filter((u: CorporateMappingItem) =>
      u?.corporateName?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredData(filteredRole);
  };

  //toggle single handler
  const toggleSingleHandler = (id: number) => {
    setCorporateData(prev =>
      prev.map(item =>
        item?.corporateId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );

    setFilteredData(prev =>
      prev.map(item =>
        item?.corporateId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );
  };

  //toggle all handler
  const toggleAllHandler = () => {
    const allGranted =
      corporateData.length > 0 && corporateData.every(item => item.isGranted === 1);

    const updated = corporateData.map(item => ({
      ...item,
      isGranted: allGranted ? 0 : 1,
    }));

    setCorporateData(updated);
    setFilteredData(updated);
  };

  //All handler
  const filterAllHandler = () => {
    setActiveButton("all");
    setFilteredData(corporateData ?? []);
  };

  // remaining handler
  const remainingHandler = () => {
    setActiveButton("remaining");

    const remaining = corporateData?.filter((r: CorporateMappingItem) => r?.isGranted === 0) ?? [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    setActiveButton("granted");

    const granted = corporateData.filter(item => item.isGranted === 1) ?? [];
    setFilteredData(granted);
  };

  //submit handle

  const saveCorporateMappingHandler = useCallback(async () => {
    if (!corporateData || corporateData?.length === 0) return;

    const corporates = corporateData
      ?.filter((u: CorporateMappingItem) => u.isGranted === 1)
      .map((u: CorporateMappingItem) => ({
        branchId: branchId,
        typeId: typeId,
        userId: userId,
        corporateId: u.corporateId,
      }));

    if (corporates.length === 0) return;

    const chunks = chunkArray(corporates, 50);

    for (let i = 0; i < chunks.length; i++) {
      const resp = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_CORPORATE_MAPPING, {
        branchId: branchId,
        typeId: typeId,
        userId: userId,
        isFirst: i === 0 ? 1 : 0,
        userCorporates: chunks[i],
      });
      if (!resp?.result) {
        showError(error?.message);
        return;
      }
      showSuccess(resp?.message);
    }
  }, [corporateData, branchId, typeId, userId]);

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

              <th className="table-name-header">
                <div className="table-header-content">
                  <span className="table-title">Corporate Name</span>

                  <input
                    className="table-search-input input-field"
                    placeholder="search corporate name"
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
              filteredData.map((item: CorporateMappingItem, idx) => (
                <tr
                  key={item?.corporateId}
                  className="table-row"
                  onClick={() => toggleSingleHandler(item?.corporateId)}
                >
                  <td className="table-cell">{idx + 1}</td>

                  <td className="table-cell">
                    <span
                      className={`status-badge ${
                        item?.isGranted === 1 ? "status-success" : "status-inactive"
                      }`}
                    >
                      {item?.corporateName}
                    </span>
                  </td>

                  <td className="table-action-cell">
                    <div onClick={e => e.stopPropagation()}>
                      <ToggleButton
                        checked={item.isGranted === 1}
                        onClick={() => toggleSingleHandler(item?.corporateId)}
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

export default React.memo(CorporateMapping);
