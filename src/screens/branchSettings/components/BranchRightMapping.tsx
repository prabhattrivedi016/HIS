import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import ToggleButton from "@/components/toggleButton";
import { ENDPOINTS } from "@/config/defaults";
import { BranchRightMappingTableHeader } from "@/constants/tableHeaders";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { BranchItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAssignBranchRight } from "../../../store/useAssignBranchRight";
import { BranchTableItem } from "../types";

const BranchRightMapping = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [selectedBranch, setSelectedBranch] = useState<number>(1);
  const { refetchAssignBranchRight } = useAssignBranchRight();
  const branches = useGetBranchList()?.branchList?.data ?? [];
  const [updatedTable, setUpdatedTable] = useState<BranchTableItem[]>([]);

  const branchSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedBranch(value);
  };

  // branch right mapping
  const getBranchMapping = async (branchId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BRANCH_RIGHT_MAPPING,
      {},
      { params: { branchId } },
      { component: "BranchRightMapping" }
    );
    return resp?.data ?? [];
  };

  const { data: branchTableData = [], refetch } = useQuery({
    queryKey: ["getBranchMapping", selectedBranch],
    queryFn: () => getBranchMapping(selectedBranch),
  });

  useEffect(() => {
    setUpdatedTable(branchTableData);
  }, [branchTableData]);

  // single toggle handler
  const singleToggleHandler = (item: BranchTableItem) => {
    setUpdatedTable(prev =>
      prev.map(row =>
        row.BranchRightId === item.BranchRightId
          ? {
              ...row,
              isGranted: row.isGranted === 1 ? 0 : 1,
            }
          : row
      )
    );
  };

  // save branch right mapping
  const saveBranchRightMappingHandler = async (e: FormEvent<HTMLFormEvent>) => {
    e.preventDefault();
    if (!selectedBranch) return;
    const payload = {
      branchId: selectedBranch,
      branchRightIds: updatedTable
        .filter((u: BranchTableItem) => u?.isGranted === 1)
        .map((b: BranchTableItem) => b?.BranchRightId),
    };
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_BRANCH_RIGHT_MAPPING,
      payload,
      {},
      { component: "BranchRightMapping" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to save data");
      return;
    }
    showSuccess("Data saved successfully");
    await Promise.allSettled([refetch?.(), refetchAssignBranchRight?.()]);
  };

  return (
    <div className="mt-1">
      <div className="card form-grid-4">
        <InputField label="Branch Name">
          <select className="input-field" value={selectedBranch} onChange={branchSelectHandler}>
            <option value={0}>--Select--</option>
            {branches.map((b: BranchItem) => (
              <option key={b?.branchId} value={b?.branchId}>
                {b?.branchName}
              </option>
            ))}
          </select>
        </InputField>
      </div>
      {/* table */}
      <div className="table-container -mt-2">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-70 lg:max-h-60">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {BranchRightMappingTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {updatedTable?.length === 0 && (
                  <tr>
                    <td colSpan={BranchRightMappingTableHeader.length} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {updatedTable.map((item: BranchTableItem, idx: number) => (
                  <tr key={idx} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.BranchRightName || "-"}</td>

                    <td className="table-td">{item?.Description || "-"}</td>
                    <td className="table-td">
                      {
                        <ToggleButton
                          checked={!!item?.isGranted}
                          onClick={() => singleToggleHandler(item)}
                        />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="form-actions-responsive -mt-40 ">
          <button type="submit" className="save-btn" onClick={saveBranchRightMappingHandler}>
            Update
          </button>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default BranchRightMapping;
