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
      await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_CORPORATE_MAPPING, {
        branchId: branchId,
        typeId: typeId,
        userId: userId,
        isFirst: i === 0 ? 1 : 0,
        userCorporates: chunks[i],
      });
    }
  }, [corporateData, branchId, typeId, userId]);

  return (
    <div className="card">
      {/* Header buttons */}
      <div className="flex justify-between flex-wrap  -mt-3">
        <div className="flex gap-1">
          <button
            className={`table-header-button ${activeButton === "all" ? "bg-[#0b5394] text-white" : ""}`}
            onClick={filterAllHandler}
          >
            All
          </button>

          <button
            className={`table-header-button ${activeButton === "remaining" ? "bg-[#0b5394] text-white" : ""}`}
            onClick={remainingHandler}
          >
            Remaining
          </button>

          <button
            className={`table-header-button ${activeButton === "granted" ? "bg-[#0b5394] text-white" : ""}`}
            onClick={grantedHandler}
          >
            Granted
          </button>
        </div>

        <button
          className="table-header-button text-white bg-[#0b5394]"
          onClick={saveCorporateMappingHandler}
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
              <th className="px-5 py-2 font-semibold text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="block whitespace-nowrap overflow-hidden text-ellipsis ">
                    Corporate Name
                  </span>
                  <input
                    className="input-field h-10 max-w-[250px] text-sm ml-20 "
                    placeholder="search corporate name"
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
              filteredData?.map((item: CorporateMappingItem, idx) => (
                <tr
                  key={item?.corporateId}
                  className={`border-t border-gray-200 hover:bg-gray-50 cursor-pointer `}
                  onClick={() => toggleSingleHandler(item?.corporateId)}
                >
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>

                  <td className="px-4 py-3 text-gray-800">{item?.corporateName}</td>

                  <td className="px-4 py-3 text-center">
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

export default React.memo(CorporateMapping);
