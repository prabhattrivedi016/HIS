import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useSortTableData } from "../../hooks/useSortTableData";

const ListView = ({ data = [], onStatusChange, openDrawer, buttonTitle, drawerTitle }) => {
  const [openListMenu, setOpenListMenu] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);

  const { sortedItems, sortConfig, onSort } = useSortTableData(data);
  const tableData = sortedItems ?? data;
  const firstData = tableData[0] || {};

  // 1 Column Definitions
  const headers = [
    { key: "listLeftButton", label: firstData?.listLeftButton?.[0]?.label || "Action" },
    { key: "cardId", label: firstData?.cardId?.[0]?.label || "ID" },
    { key: "cardTitle", label: firstData?.type === "roleMaster" ? "Role Name" : "Name" },
    { key: "status", label: firstData?.listStatus?.[0]?.label || "Status" },
    ...(firstData?.listGroupSection?.map((f, index) => ({
      key: `footer_${index}`,
      label: f.label,
    })) || []),
  ];

  // 2️ Helper to Open Popup and Track Row
  const handleListLeftButton = (e, rowData) => {
    e.stopPropagation();
    setOpenListMenu(prev => (prev?.id === rowData?.id ? null : rowData));
  };

  // Auto-Close Popup when Clicking Outside
  useEffect(() => {
    const closeMenu = () => setOpenListMenu(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  // 4️Helper to Toggle Status
  const handleStatusChange = rowData => {
    const type = rowData?.type?.toLowerCase();
    const payload = {
      isActive: rowData?.listStatus[0]?.value === 1 ? 0 : 1,
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
    const type = rowData?.type?.toLowerCase();
    buttonTitle(type === "rolemaster" ? "Update Existing Role" : "Update Existing User");
    drawerTitle(type === "rolemaster" ? "Update Role" : "Update User");
    setOpenListMenu(null);
    openDrawer();
  };

  // hiding column
  const handleHeaderClick = (key, e) => {
    if (e.altKey) {
      setHiddenColumns(prev =>
        prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
      );
    } else if (key !== "listLeftButton") {
      onSort(key, rd => getSortValue(rd, key));
    }
  };

  // 7 Restore Hidden Columns Button
  const restoreHiddenColumns = () => setHiddenColumns([]);

  // Sorting handler
  const getSortValue = (rowData, key) => {
    if (key === "cardId") return rowData?.cardId?.[0]?.value ?? "";
    if (key === "cardTitle") return rowData?.cardTitle?.[0]?.value?.toLowerCase?.() ?? "";
    if (key === "status") return rowData?.listStatus?.[0]?.value === 1 ? "active" : "inactive";
    if (key.startsWith("footer_")) {
      const val = rowData?.listGroupSection?.[Number(key.split("_")[1])]?.value;
      return val?.toString()?.toLowerCase?.() ?? "";
    }
    return "";
  };

  // 🔹 Popup Helper Renderer
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
        <table className="w-full border-collapse text-sm text-gray-700">
          <thead className="bg-blue-50 border-b border-blue-200">
            <tr>
              {headers.map(({ key, label }) =>
                hiddenColumns.includes(key) ? null : (
                  <th
                    key={key}
                    className={`px-3 py-2 font-semibold text-sm ${
                      key !== "listLeftButton" ? "cursor-pointer" : ""
                    }`}
                    onClick={e => handleHeaderClick(key, e)}
                  >
                    <div className="flex items-center justify-between">
                      {label}
                      {sortConfig?.key === key && (sortConfig.direction === "asc" ? "🔼" : "🔽")}
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {tableData.map((rowData, idx) => {
              const isActive = rowData?.listStatus?.[0]?.value === 1;
              return (
                <tr key={idx}>
                  {headers.map(header =>
                    hiddenColumns.includes(header.key) ? null : (
                      <td key={header.key} className="px-3 py-3 align-top ">
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
                        ) : header.key === "cardId" ? (
                          rowData?.cardId?.[0]?.value || "-"
                        ) : header.key === "status" ? (
                          <span
                            className={`px-2 py-2 text-xs font-semibold rounded ${
                              isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        ) : header.key.startsWith("footer_") ? (
                          rowData?.listGroupSection?.[Number(header.key.split("_")[1])]?.value ||
                          "-"
                        ) : (
                          rowData?.cardTitle?.map(t => t?.value).join(" ") || "Unknown"
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

      {hiddenColumns.length > 0 && (
        <button
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          onClick={restoreHiddenColumns}
        >
          Restore Columns ({hiddenColumns.length})
        </button>
      )}
    </div>
  );
};

export default ListView;
