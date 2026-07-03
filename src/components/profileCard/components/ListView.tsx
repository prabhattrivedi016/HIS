import { MoreVertical } from "lucide-react";
import {
  type FC,
  lazy,
  Suspense,
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import { useSortTableData } from "../../../hooks/useSortTableData";

const Pagination = lazy(() => import("./Pagination"));

import { formatDisplayDate } from "@/utils/dateConvertHandler";
import { ListViewData, ListViewProps } from "../types";

const ListView: FC<ListViewProps> = ({
  data = [],
  onStatusChange,
  openDrawer,
  columnVisibility = {},
  renderRowActionMenu,
}) => {
  const isDateFormat = (val: string) => /^\d{2}-\d{2}-\d{4}$/.test(val);

  const [openListMenu, setOpenListMenu] = useState<ListViewData | null>(null);
  const [pageData, setPageData] = useState(10);
  const [activePage, setActivePage] = useState(1);

  const { sortedItems, sortConfig, onSort } = useSortTableData<ListViewData>(data);
  const tableData = sortedItems ?? data;

  const firstData = tableData[0] || ({} as ListViewData);

  const start = (activePage - 1) * pageData;
  const end = start + pageData;

  const paginatedData = tableData.slice(start, end);

  const headers = [
    { key: "listLeftButton", label: firstData?.listLeftButton?.[0]?.label || "Action" },
    ...(firstData?.columns?.map((f, index) => ({
      key: `column_${index}`,
      label: f.label,
    })) || []),
  ];

  const getColumnValue = (rowData: ListViewData, key: string) => {
    const index = Number(key.replace("column_", ""));
    const col = rowData?.columns?.[index];

    if (!col) return "-";

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
    const value = col.value;

    if (typeof value === "string" && isDateFormat(value)) {
      return formatDisplayDate(value);
    }

    return value ?? "-";
  };

  const handleListLeftButton = (e: MouseEvent<HTMLButtonElement>, rowData: ListViewData) => {
    e.stopPropagation();
    setOpenListMenu(prev => (prev?.id === rowData?.id ? null : rowData));
  };

  useEffect(() => {
    const closeMenu = () => setOpenListMenu(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const getIsActiveValue = (rowData: ListViewData) =>
    rowData.columns?.find(c => c.keyFromApi === "isActive")?.value;

  const handleStatusChange = (rowData: ListViewData) => {
    if (!onStatusChange) return;

    const currentStatus = getIsActiveValue(rowData);
    const newStatus = currentStatus === 1 ? 0 : 1;

    const type = rowData?.type?.toLowerCase();

    const payload = {
      isActive: newStatus,
      ...(type === "rolemaster"
        ? { roleId: rowData.id }
        : type === "usermaster"
          ? { userId: rowData.id }
          : type === "usergroupmaster"
            ? { id: rowData.id }
            : type === "userdepartment"
              ? { id: rowData.id }
              : type === "doctormaster"
                ? { doctorId: rowData.id }
                : type === "referdoctormaster"
                  ? { referDoctorId: rowData.id }
                  : type === "corporatemaster"
                    ? { corporateId: rowData.id }
                    : {}),
    };

    onStatusChange(payload);
  };

  const openDrawerHandler = (rowData: ListViewData) => {
    setOpenListMenu(null);
    openDrawer?.(rowData?.id);
  };

  const getSortValue = (rowData: ListViewData, key: string) => {
    if (key === "listLeftButton") return "";
    const index = Number(key.replace("column_", ""));
    const col = rowData?.columns?.[index];

    if (!col) return "";

    const value = col.value;

    return typeof value === "string" ? value.toLowerCase() : value;
  };

  const handleHeaderClick = (key: string) => {
    if (key !== "listLeftButton") {
      onSort(key, getSortValue);
    }
  };

  const renderActionMenu = (rowData: ListViewData, isActive: boolean) => {
    if (renderRowActionMenu) {
      return renderRowActionMenu(rowData, () => setOpenListMenu(null));
    }

    switch (rowData?.type) {
      case "branchMaster": {
        return (
          <ul className="text-sm">
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-700"
                onClick={() => openDrawerHandler(rowData)}
              >
                Edit
              </button>
            </li>
          </ul>
        );
      }

      default: {
        return (
          <ul className="text-sm">
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-700"
                onClick={() => openDrawerHandler(rowData)}
              >
                Edit
              </button>
            </li>
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-700"
                onClick={() => handleStatusChange(rowData)}
              >
                {isActive ? "Inactive" : "Active"}
              </button>
            </li>
          </ul>
        );
      }
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="table-container m-2">
        <div className="table-scroll-wrapper lg:min-h-140 lg:max-h-140">
          <table className="base-table">
            <thead className="table-head">
              <tr>
                {headers.map(({ key, label }) =>
                  columnVisibility?.[label] === false ? null : (
                    <th
                      key={key}
                      className={`table-th
                      ${key !== "listLeftButton" ? "cursor-pointer" : ""}`}
                      onClick={() => handleHeaderClick(key)}
                    >
                      <div className="flex items-center gap-2">
                        {label}
                        {sortConfig?.key === key &&
                          sortConfig?.direction === "asc"
                          ? "🔺"
                          : sortConfig?.key === key
                            ? "🔻"
                            : null}
                      </div>
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((rowData, idx) => {
                const isActive = getIsActiveValue(rowData) === 1;

                return (
                  <tr key={idx} className="table-row">
                    {headers.map(header =>
                      columnVisibility?.[header.label] === false ? null : (
                        <td key={header.key} className=" table-td">
                          {header.key === "listLeftButton" ? (
                            <div className="relative">
                              <button
                                type="button"
                                className="p-2 hover:bg-gray-200 rounded"
                                onClick={e => handleListLeftButton(e, rowData)}
                              >
                                <MoreVertical size={18} className="text-gray-600" />
                              </button>
                              {openListMenu?.id === rowData?.id && (
                                <div className="absolute left-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg z-50">
                                  {renderActionMenu(rowData, isActive)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="block truncate max-w-40 sm:max-w-none">
                              {getColumnValue(rowData, header.key)}
                            </span>
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
      {tableData?.length > 20 ? (
        <Suspense fallback={<div>Loading pagination...</div>}>
          <Pagination
            totalItem={tableData.length}
            pageData={pageData}
            setPageData={setPageData}
            activePage={activePage}
            setActivePage={setActivePage}
          />
        </Suspense>
      ) : null}
    </div>
  );
};

export default ListView;
