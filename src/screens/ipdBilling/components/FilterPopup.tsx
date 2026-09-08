import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import { showWarning } from "@/utils/alert";
import { useEffect, useMemo, useState } from "react";
import { IpdSummaryBillingTableList } from "../types";

type FilterPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  dataList: IpdSummaryBillingTableList[];
  selectedFilteredData: IpdSummaryBillingTableList[];
  setSelectedFilteredData: React.Dispatch<React.SetStateAction<IpdSummaryBillingTableList[]>>;
};

const FilterPopup = ({
  isOpen,
  onClose,
  dataList,
  selectedFilteredData,
  setSelectedFilteredData,
}: FilterPopupProps) => {
  const [allDataLists, setAllDataLists] = useState<IpdSummaryBillingTableList[]>(dataList);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [selectedUser, setSelectedUser] = useState<string>("");

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");

  // Update data when parent data changes
  useEffect(() => {
    setAllDataLists(dataList);
    setSelectedRows([]);
  }, [dataList]);

  // Unique Users
  const uniqueUsers = [
    ...new Set(allDataLists.map((item: IpdSummaryBillingTableList) => item?.UserName)),
  ].filter(Boolean);

  // Unique Sub Categories
  const uniqueSubCategories = [
    ...new Set(allDataLists.map((item: IpdSummaryBillingTableList) => item?.SubCategoryName)),
  ].filter(Boolean);

  // Automatically filter popup table based on dropdowns
  const filteredData = useMemo(() => {
    return allDataLists.filter(item => {
      const userMatch = selectedUser ? item?.UserName === selectedUser : true;

      const subCategoryMatch = selectedSubCategory
        ? item?.SubCategoryName === selectedSubCategory
        : true;

      return userMatch && subCategoryMatch;
    });
  }, [allDataLists, selectedUser, selectedSubCategory]);

  // User Select Handler
  const userSelectHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(event.target.value.trim());

    // Clear current checkbox selection
    setSelectedRows([]);
  };

  // Sub Category Select Handler
  const subCategorySelectHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubCategory(event.target.value.trim());

    // Clear current checkbox selection
    setSelectedRows([]);
  };

  // Individual Row Checkbox
  const handleRowCheckbox = (index: number) => {
    setSelectedRows(prev => {
      if (prev.includes(index)) {
        return prev.filter(id => id !== index);
      }

      return [...prev, index];
    });
  };

  // Select / Unselect All
  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
      return;
    }

    setSelectedRows(filteredData.map((_, index) => index));
  };

  // Header checkbox
  const isAllSelected = filteredData.length > 0 && selectedRows.length === filteredData.length;

  // Filter Button
  const handleFilter = () => {
    if (selectedRows.length === 0) {
      showWarning("Please select at least one row.");
      return;
    }

    const selectedData = filteredData.filter((_, index) => selectedRows.includes(index));

    setSelectedFilteredData(selectedData);

    onClose();
  };

  // Reset popup
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser("");
      setSelectedSubCategory("");
      setSelectedRows([]);
    }
  }, [isOpen]);

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Set Filter" className="lg:min-w-150">
      <>
        <div className="flex items-end gap-4 w-full">
          {/* User */}
          <div className="flex-1">
            <InputField label="User">
              <select
                className="input-field w-full"
                value={selectedUser}
                onChange={userSelectHandler}
              >
                <option value="">All Users</option>

                {uniqueUsers.map(user => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </InputField>
          </div>

          {/* Sub Category */}
          <div className="flex-1">
            <InputField label="Sub Category">
              <select
                className="input-field w-full"
                value={selectedSubCategory}
                onChange={subCategorySelectHandler}
              >
                <option value="">-- All Sub Category --</option>

                {uniqueSubCategories.map(subCategory => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            </InputField>
          </div>

          {/* Filter Button */}
          <div className="flex items-end mb-3">
            <button type="button" className="save-btn" onClick={handleFilter}>
              Filter
            </button>
          </div>
        </div>

        {/* table */}
        <div className="table-container mt-4">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {/* Select All */}
                    <th className="table-th">
                      <input
                        type="checkbox"
                        className="input-checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        disabled={filteredData.length === 0}
                      />
                    </th>

                    {/* Index */}
                    <th className="table-th">#</th>

                    {/* Service */}
                    <th className="table-th p-2">Service Name</th>

                    {/* Doctor */}
                    <th className="table-th">Doctor Name</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredData.map((item, idx) => {
                    const isSelected = selectedRows.includes(idx);

                    return (
                      <tr key={idx} className="table-row">
                        {/* Checkbox */}
                        <td className="table-td">
                          <input
                            type="checkbox"
                            className="input-checkbox"
                            checked={isSelected}
                            onChange={() => handleRowCheckbox(idx)}
                          />
                        </td>

                        {/* Index */}
                        <td className="table-td">{idx + 1}</td>

                        {/* Service */}
                        <td className="table-td">{item?.ServiceName || "-"}</td>

                        {/* Doctor */}
                        <td className="table-td">{item?.DoctorName || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    </CentralPopup>
  );
};

export default FilterPopup;
