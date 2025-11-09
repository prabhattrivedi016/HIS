import React from "react";

const ListView = (data) => {
  if (!data || !data.data || data.data.length === 0) {
    return <p className="text-gray-500 text-center">No data available</p>;
  }

  const tableData = data.data;
  const first = tableData[0];

  // Extract table headers dynamically
  const header = [
    first?.cardId?.label,
    first?.cardTitle?.label,
    first?.cardLeftTop?.label,
    ...first?.cardFooterSection.map((f) => f.label),
  ];

  return (
    <div className="p-6">
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="min-w-full border-collapse text-sm text-gray-700">
          {/* Table Head */}
          <thead className="bg-linear-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <tr>
              {header.map((head, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-center font-semibold text-gray-700 uppercase tracking-wide"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {tableData.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-blue-50 transition duration-150 ease-in-out border-b border-gray-100"
              >
                {/* ID */}
                <td className="px-4 py-3 text-center font-medium text-gray-600">
                  {item?.cardId?.value || "-"}
                </td>

                {/* Icon + Role Name */}
                <td className="px-4 py-3 text-left flex items-center justify-center gap-2">
                  <span className="text-blue-600 text-xl">
                    <i className={`fa ${item.cardAvatar}`}></i>
                  </span>
                  <span className="font-medium text-gray-700">
                    {item?.cardTitle?.value || "-"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
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

                {/* Footer Data */}
                {item?.cardFooterSection.map((footer, fIndex) => (
                  <td
                    key={fIndex}
                    className="px-4 py-3 text-center text-gray-500"
                  >
                    {footer?.value || "-"}
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
