import React, { useState } from "react";
import { MoreVertical } from "lucide-react";

const ListView = (data) => {
  if (!data || !data?.data || data?.data?.length === 0) {
    return <p className="text-gray-500 text-center">No data available</p>;
  }

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [hiddenColumns, setHiddenColumns] = useState([]);

  const tableData = data?.data;
  const first = tableData[0];

  tableData.map((item) =>
    console.log("list card right top is", item?.listCardRightTop)
  );

  // Extract headers dynamically
  const headers = [
    { Key: "listCardRightTop", label: "Action" },
    { key: "cardId", label: first?.cardId?.label || "ID" },
    { key: "cardTitle", label: first?.cardTitle?.label || "Title" },
    { key: "cardLeftTop", label: first?.cardLeftTop?.label || "Status" },
    ...(first?.cardFooterSection?.map((f, index) => ({
      key: `footer_${index}`,
      label: f.label,
    })) || []),
  ];

  // --- Sorting logic ---
  const handleSort = (key, event) => {
    // Alt + Click hides column
    if (event.altKey) {
      toggleColumnVisibility(key);
      return;
    }

    // Regular click sorts column
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const toggleColumnVisibility = (key) => {
    setHiddenColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  const resetColumns = () => setHiddenColumns([]);

  // --- Sorting ---
  const sortedData = [...tableData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = "",
      bValue = "";

    switch (true) {
      case sortConfig.key === "cardId":
        aValue = a?.cardId?.value;
        bValue = b?.cardId?.value;
        break;
      case sortConfig.key === "cardTitle":
        aValue = a?.cardTitle?.value;
        bValue = b?.cardTitle?.value;
        break;
      case sortConfig.key === "cardLeftTop":
        aValue = a?.cardLeftTop?.value;
        bValue = b?.cardLeftTop?.value;
        break;
      case sortConfig.key.startsWith("footer_"):
        const index = parseInt(sortConfig.key.split("_")[1]);
        aValue = a.cardFooterSection[index]?.value;
        bValue = b.cardFooterSection[index]?.value;
        break;
      default:
        break;
    }

    aValue = aValue || "";
    bValue = bValue || "";

    if (!isNaN(aValue) && !isNaN(bValue)) {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return sortConfig.direction === "asc"
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  // --- Icons ---
  const getSortIcon = (headerKey) => {
    if (sortConfig.key !== headerKey) return "fa-sort text-gray-400";
    return sortConfig.direction === "asc"
      ? "fa-sort-up text-blue-600"
      : "fa-sort-down text-blue-600";
  };

  return (
    <div className="p-6">
      {/* Reset Columns Button */}
      {hiddenColumns.length > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={resetColumns}
            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
          >
            Reset Columns
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="min-w-full border-collapse text-sm text-gray-700">
          {/* Table Head */}
          <thead className="bg-linear-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <tr>
              {headers
                .filter((header) => !hiddenColumns.includes(header.key))
                .map((header) => (
                  <th
                    key={header.key}
                    onClick={(e) => handleSort(header.key, e)}
                    title="Click to sort • Alt + Click to hide"
                    className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <i className={`fa ${getSortIcon(header.key)} text-xs`} />
                      <span>{header.label}</span>
                    </div>
                  </th>
                ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-blue-50 transition duration-150 ease-in-out border-b border-gray-100"
              >
                {/* Action Icon */}
                {!hiddenColumns.includes("listCardRightTop") && (
                  <td className="px-4 py-3 text-left align-middle">
                    <button className="p-1.5 hover:bg-gray-100 rounded-md transition">
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
                  </td>
                )}

                {/* ID */}
                {!hiddenColumns.includes("cardId") && (
                  <td className="px-4 py-3 text-left font-medium text-gray-600 align-middle">
                    {item?.cardId?.value || "-"}
                  </td>
                )}

                {/* Title + Icon */}
                {!hiddenColumns.includes("cardTitle") && (
                  <td className="px-4 py-3 text-left align-middle">
                    <div className="flex items-center justify-start gap-2">
                      {item?.cardAvatar && (
                        <i
                          className={`fa ${item?.cardAvatar} text-gray-600 text-base leading-none`}
                          style={{
                            lineHeight: "1",
                            verticalAlign: "middle",
                          }}
                        ></i>
                      )}
                      <span className="font-medium text-gray-700 leading-none">
                        {item?.cardTitle?.value || "-"}
                      </span>
                    </div>
                  </td>
                )}

                {/* Status */}
                {!hiddenColumns.includes("cardLeftTop") && (
                  <td className="px-4 py-3 text-left align-middle">
                    {item?.cardLeftTop?.value === 1 ? (
                      <span className="inline-block rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-red-100 text-red-700 text-xs font-semibold px-3 py-1">
                        Inactive
                      </span>
                    )}
                  </td>
                )}

                {/* Footer */}
                {item?.cardFooterSection?.map((footer, fIndex) => {
                  const footerKey = `footer_${fIndex}`;
                  if (hiddenColumns.includes(footerKey)) return null;

                  return (
                    <td
                      key={fIndex}
                      className="px-4 py-3 text-left text-gray-500 align-middle"
                    >
                      {footer?.value || "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
