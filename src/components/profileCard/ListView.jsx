import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useSortTableData } from "../../hooks/useSortTableData";

const ListView = ({ data = [], onStatusChange, openDrawer }) => {
  const [openListMenu, setOpenListMenu] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);

  const { sortedItems, sortConfig, onSort } = useSortTableData(data);
  const tableData = sortedItems ?? data;

  const firstData = tableData[0] || {};

  // headers form columns
  const headers = [
    { key: "listLeftButton", label: firstData?.listLeftButton[0]?.label || "Action" },
    ...(firstData?.columns?.map((f, index) => ({
      key: `column_${index}`,
      label: f.label,
    })) || []),
  ];

  // column value
  const getColumnValue = (rowData, key) => {
    const index = Number(key.replace("column_", ""));
    const col = rowData?.columns?.[index];

    if (!col) return "-";

    // status column
    if (col.keyFromApi === "isActive") {
      const isActive = col.value === 1;

      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    }
    return col.value ?? "-";
  };

  // Open Popup
  const handleListLeftButton = (e, rowData) => {
    e.stopPropagation();
    setOpenListMenu(prev => (prev?.id === rowData?.id ? null : rowData));
  };

  // Close Popup
  useEffect(() => {
    const closeMenu = () => setOpenListMenu(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  // isActive value
  const getIsActiveValue = rowData =>
    rowData.columns?.find(c => c.keyFromApi === "isActive")?.value;

  //  status change
  const handleStatusChange = rowData => {
    const currentStatus = getIsActiveValue(rowData); // 1 or 0
    const newStatus = currentStatus === 1 ? 0 : 1;

    const type = rowData?.type?.toLowerCase();

    const payload = {
      isActive: newStatus,
      ...(type === "rolemaster"
        ? { roleId: rowData.id }
        : type === "usermaster"
        ? { userId: rowData.id }
        : {}),
    };

    onStatusChange(payload);
  };

  // open drawer
  const openDrawerHandler = rowData => {
    rowData?.type?.toLowerCase();
    setOpenListMenu(null);
    openDrawer(rowData?.id);
  };

  // hiding column
  const handleHeaderClick = (key, e) => {
    if (e.altKey) {
      setHiddenColumns(prev =>
        prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
      );
    } else if (key !== "listLeftButton") {
      onSort(key, getSortValue);
    }
  };

  //  Restore Hidden Columns Button
  const restoreHiddenColumns = () => setHiddenColumns([]);

  // Sorting table
  const getSortValue = (rowData, key) => {
    if (key === "listLeftButton") return "";
    const index = Number(key.replace("column_", ""));
    const col = rowData?.columns?.[index];

    if (!col) return "";

    const value = col.value;

    return typeof value === "string" ? value?.toLowerCase() : value;
  };

  // action menu
  const renderActionMenu = (rowData, isActive) => (
    <ul className="text-sm">
      <li>
        <button
          className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-700"
          onClick={() => openDrawerHandler(rowData)}
        >
          Edit
        </button>
      </li>
      <li>
        <button
          className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-700"
          onClick={() => handleStatusChange(rowData)}
        >
          {isActive ? "Inactive" : "Active"}
        </button>
      </li>
    </ul>
  );

  return (
    <div className="w-full px-3 py-4 sm:px-6 md:px-8">
      <div className="w-full overflow-x-auto rounded-lg shadow bg-white">
        {hiddenColumns.length > 0 && (
          <button
            className="m-3 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            onClick={restoreHiddenColumns}
          >
            Restore Columns ({hiddenColumns.length})
          </button>
        )}
        <table className="w-full border-collapse text-sm text-gray-700">
          <thead className="bg-blue-50 border-b border-blue-200 ">
            <tr>
              {headers.map(({ key, label }) =>
                hiddenColumns.includes(key) ? null : (
                  <th
                    key={key}
                    className={`px-2 py-2 font-semibold text-sm ${
                      key !== "listLeftButton" ? "cursor-pointer" : ""
                    }`}
                    onClick={e => handleHeaderClick(key, e)}
                  >
                    <div className="flex items-center justify-between">
                      {label}
                      {sortConfig?.key === key && (sortConfig.direction === "asc" ? "🔺" : "🔻")}
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {tableData.map((rowData, idx) => {
              const isActive = getIsActiveValue(rowData) === 1;

              return (
                <tr key={idx}>
                  {headers.map(header =>
                    hiddenColumns.includes(header.key) ? null : (
                      <td key={header.key} className="px-2 py-3 align-top whitespace-nowrap ">
                        {header.key === "listLeftButton" ? (
                          <div className="relative">
                            <button
                              className="p-1 hover:bg-gray-200 rounded"
                              onClick={e => handleListLeftButton(e, rowData)}
                            >
                              <MoreVertical size={18} className="text-gray-600" />
                            </button>
                            {/* toggle button popup */}
                            {openListMenu?.id === rowData?.id && (
                              <div className="absolute left-0 top-full mt-1 w-32 bg-white rounded-lg shadow z-50">
                                {renderActionMenu(rowData, isActive)}
                              </div>
                            )}
                          </div>
                        ) : (
                          getColumnValue(rowData, header.key)
                        )}
                      </td>
                    )
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
