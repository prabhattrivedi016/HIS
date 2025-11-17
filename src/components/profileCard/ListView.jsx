import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";

const ListView = ({ data = [], onStatusChange }) => {
  const [openListMenu, setOpenListMenu] = useState(null);

  const tableData = data;
  const firstData = tableData[0] || {};

  const cardTitleValue = value =>
    value === "roleMaster" ? "Role Name" : value === "userMaster" ? "User Name" : "Name";

  const cardTitleName = cardTitleValue(firstData?.type);

  const headers = [
    { key: "listLeftButton", label: firstData?.listLeftButton?.[0]?.label || "Action" },
    { key: "cardId", label: firstData?.cardId?.[0]?.label || "ID" },
    { key: "cardTitle", label: cardTitleName || "Title" },
    { key: "status", label: firstData?.listStatus?.[0]?.label || "Status" },
    ...(firstData?.listGroupSection?.map((f, index) => ({
      key: `footer_${index}`,
      label: f.label,
    })) || []),
  ];

  const handleListLeftButton = (e, rowData) => {
    e.stopPropagation();
    setOpenListMenu(prev => (prev?.id === rowData?.id ? null : rowData));
  };

  useEffect(() => {
    const closeMenu = () => setOpenListMenu(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const extractValue = (rowData, key) => {
    const isActive = rowData?.listStatus?.[0]?.value === 1;
    switch (key) {
      case "listLeftButton":
        return (
          <div className="relative inline-block">
            <button
              className="cursor-pointer p-1 hover:bg-gray-100 rounded transition-colors"
              onClick={e => handleListLeftButton(e, rowData)}
            >
              <MoreVertical size={18} className="text-gray-600" />
            </button>
            {openListMenu?.id === rowData?.id && (
              <div
                className="absolute left-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
                onClick={e => e.stopPropagation()}
              >
                <ul className="text-sm">
                  <li
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 transition-colors"
                    onClick={() => console.log("Edit clicked", rowData)}
                  >
                    Edit
                  </li>
                  <li
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 transition-colors"
                    onClick={() =>
                      onStatusChange({ isActive: isActive ? 0 : 1, userId: rowData?.id })
                    }
                  >
                    {isActive ? "Inactive" : "Active"}
                  </li>
                </ul>
              </div>
            )}
          </div>
        );
      case "cardId":
        return rowData?.cardId?.[0]?.value || "-";
      case "cardTitle":
        return rowData?.cardTitle?.map(t => t?.value).join(" ") || "Unknown";
      case "status":
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      default:
        return key.startsWith("footer_")
          ? rowData?.listGroupSection?.[Number(key.split("_")[1])]?.value || "-"
          : "-";
    }
  };

  return (
    <div className="w-full px-3 py-2 sm:px-6 sm:py-4 md:px-8 md:py-6">
      <div className="w-full overflow-x-auto rounded-lg shadow-lg bg-white">
        <table className="w-full min-w-max border-collapse text-xs sm:text-sm md:text-base text-gray-700">
          <thead className="bg-blue-50 border-b border-blue-200">
            <tr>
              {headers.map(header => (
                <th
                  key={header.key}
                  className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((rowData, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-100 transition duration-150 ease-in-out border-b border-gray-200"
              >
                {headers.map(header => (
                  <td key={header.key} className="px-3 sm:px-4 py-2 whitespace-nowrap align-middle">
                    {extractValue(rowData, header.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
