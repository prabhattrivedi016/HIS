import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { BedMasterTableHeader } from "@/constants/tableHeaders";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { BranchItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import AddNewBedMaster from "./components/AddNewBedMaster";
import { BedMasterTableItem, FloorItem, TypeItem, WardItem } from "./types";

const BedMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchList = useGetBranchList()?.branchList?.data ?? [];

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [queryValue, setQueryValue] = useState<Record<string, string>>({});

  const [openAddNewBed, setOpenAddNewBed] = useState<boolean>(false);
  const [renderAddNewBed, setRenderAddNewBed] = useState<boolean>(false);
  const [editableData, setEditableData] = useState<BedMasterTableItem | null>(null);

  //   type list
  const getTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryId: 10, isActive: Status?.ACTIVE } },
      { component: "BedMaster" }
    );
    return resp?.data;
  };

  const { data: TypeList = [] } = useQuery({
    queryKey: ["getTypeList"],
    queryFn: getTypeList,
  });

  // floor list
  const getFloorList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_FLOOR_LIST,
      {},
      {},
      { component: "BedMaster" }
    );
    return resp?.data;
  };

  const { data: FloorList = [] } = useQuery({
    queryKey: ["getFloorList"],
    queryFn: getFloorList,
  });

  // floor list
  const getWardList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_WARD_NAME_MASTER,
      {},
      {},
      { component: "BedMaster" }
    );
    return resp?.data;
  };

  const { data: wardList = [] } = useQuery({
    queryKey: ["getWardList"],
    queryFn: getWardList,
  });

  const createQueryValue = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "branchId": {
        setQueryValue(prev => ({
          ...prev,
          [name]: value,
        }));
        return;
      }
      case "typeId": {
        setQueryValue(prev => ({
          ...prev,
          [name]: value,
        }));
        return;
      }
      case "floorId": {
        setQueryValue(prev => ({
          ...prev,
          [name]: value,
        }));
        return;
      }
      case "wardNameId": {
        setQueryValue(prev => ({
          ...prev,
          [name]: value,
        }));
        return;
      }
      default:
        return {};
    }
  };

  // bed master table list
  const getBedMasterList = async (queryValue: Record<string, string>) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_BED_LIST,
      {},
      {
        params: queryValue,
      },
      { component: "BedMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: bedMasterLists = [] } = useQuery({
    queryKey: ["getBedMasterList", queryValue],
    queryFn: () => getBedMasterList(queryValue),
  });

  // close handler
  const closeDrawerHandler = useCallback(() => {
    setOpenAddNewBed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setRenderAddNewBed(false);
    }, 100);
  }, []);

  // edit handler
  const editHandler = (item: BedMasterTableItem | null) => {
    if (item === null) {
      setOpenAddNewBed(true);
      setRenderAddNewBed(true);
      setEditableData(null);
      return;
    }
    setOpenAddNewBed(true);
    setRenderAddNewBed(true);
    setEditableData(item);
  };

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-1">
        <div>
          <h1 className="page-heading">Bed Master</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Bed Master</span>
          </nav>
        </div>
        <button className="save-btn whitespace-nowrap" onClick={() => editHandler(null)}>
          Add New Bed
        </button>
      </div>

      <div className="card">
        <form>
          <div className="form-grid-4">
            <InputField label="Branch Name">
              <select className="input-field" name="branchId" onChange={createQueryValue}>
                <option value="">Select branch</option>
                {branchList?.map((b: BranchItem) => (
                  <option key={b?.branchId} value={b?.branchId}>
                    {b?.branchName}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Type">
              <select className="input-field" name="typeId" onChange={createQueryValue}>
                <option value="">Select type</option>
                {TypeList?.map((t: TypeItem) => (
                  <option key={t?.serviceItemId} value={t?.serviceItemId}>
                    {t?.name}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Floor">
              <select className="input-field" name="floorId" onChange={createQueryValue}>
                <option value="">Select floor</option>
                {FloorList?.map((f: FloorItem) => (
                  <option key={f?.floorId} value={f?.floorName}>
                    {f?.floorName}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Ward Name / No">
              <select className="input-field" name="wardNameId" onChange={createQueryValue}>
                <option value="">Select ward</option>
                {wardList.map((w: WardItem) => (
                  <option key={w?.WardNameId} value={w?.WardNameId}>
                    {w?.WardName}
                  </option>
                ))}
              </select>
            </InputField>
          </div>
        </form>
      </div>

      {/* table */}

      <div className="table-container mt-1 ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-110 lg:max-h-110">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {BedMasterTableHeader.map((header, index) => (
                    <th key={index} className="table-th ">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {bedMasterLists.length === 0 ? (
                  <tr>
                    <td colSpan={BedMasterTableHeader.length} className="table-empty">
                      No records found
                    </td>
                  </tr>
                ) : (
                  bedMasterLists.map((item: BedMasterTableItem, idx: number) => (
                    <tr key={item?.BedId} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.BranchName ?? "-"}</td>
                      <td className="table-td">{item?.Type ?? "-"}</td>
                      <td className="table-td">{item?.WardName ?? "-"}</td>

                      <td className="table-td">{item?.BedNo ?? "-"}</td>
                      <td
                        className={`table-td ${
                          Number(item?.IsActive) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item.IsActive) === 1 ? "Active" : "Inactive"}
                      </td>

                      <td className="table-td">
                        <button type="button" onClick={() => editHandler(item)}>
                          <i className="fa-solid fa-edit icon-color-button" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* drawer */}
      {!!renderAddNewBed && (
        <AddNewBedMaster isOpen={openAddNewBed} onClose={closeDrawerHandler} data={editableData} />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};
export default BedMaster;
