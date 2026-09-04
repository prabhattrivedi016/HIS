import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Dispatch, SetStateAction, useMemo } from "react";

type BaseTableProps<T extends object> = {
  /** Standard MRT column definitions */
  columns: MRT_ColumnDef<T>[];
  /** Array of row data */
  data: T[];
  /** Show row number as first column (default: true) */
  showIndex?: boolean;

  /** Enable group by functionality */
  enableGrouping?: boolean;

  /** Controlled grouping state (column IDs to group by) */
  groupBy?: string[];

  /** Callback when grouping changes */
  onGroupingChange?: Dispatch<SetStateAction<string[]>>;

  /**
   * Double-click table header to group/ungroup dynamically (default: true when enableGrouping is true)
   */
  enableGroupingOnHeaderDoubleClick?: boolean;

  /** Backward-compatible alias for header double click grouping */
  enableGroupingOnHeaderClick?: boolean;
};

/**
 * Reusable table powered by MaterialReactTable with the project's native theme.
 *
 * Features:
 *  - Sorting: single-click on header
 *  - Dynamic grouping: double-click on header to add/remove from group
 *  - Column reordering: drag & drop header
 *  - Row numbers: auto-index `#` column
 */
const BaseTable = <T extends object>({
  columns,
  data,
  showIndex = true,
  enableGrouping = false,
  groupBy,
  onGroupingChange,
  enableGroupingOnHeaderDoubleClick,
  enableGroupingOnHeaderClick,
}: BaseTableProps<T>) => {
  const allowDoubleClickGroup =
    enableGrouping && (enableGroupingOnHeaderDoubleClick ?? enableGroupingOnHeaderClick ?? true);

  const sanitizedGroupBy = useMemo(
    () => (groupBy ? groupBy.filter(id => Boolean(id && String(id).trim() !== "")) : undefined),
    [groupBy]
  );

  const table = useMaterialReactTable<T>({
    columns,
    data,

    // ── Basic features ──────────────────────────────────────────────
    enableSorting: true,
    enableColumnOrdering: true,
    enableColumnDragging: true,
    enablePagination: false,
    enableRowNumbers: showIndex,

    // ── Grouping ───────────────────────────────────────────────────
    enableGrouping,
    ...(sanitizedGroupBy !== undefined ? { state: { grouping: sanitizedGroupBy } } : {}),
    onGroupingChange,
    enableTopToolbar: enableGrouping,

    // ── Disabled features ──────────────────────────────────────────
    enableColumnActions: false,
    enableColumnFilters: false,
    enableColumnResizing: false,
    enableColumnPinning: false,
    enableHiding: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableBottomToolbar: false,
    enableStickyHeader: true,
    enableRowSelection: false,

    enableToolbarInternalActions: false,

    initialState: {
      density: "compact",
      expanded: true,
    },

    displayColumnDefOptions: {
      "mrt-row-numbers": {
        size: 10,
        grow: false,
        header: "#",
      },
    },

    // ── Header cells with double-click grouping ────────────────────
    muiTableHeadCellProps: ({ column }) => {
      const canGroup = enableGrouping && column.getCanGroup();
      const isGrouped = column.getIsGrouped() || (groupBy?.includes(column.id) ?? false);

      return {
        onDoubleClick: (e: React.MouseEvent) => {
          if (!allowDoubleClickGroup || !canGroup) return;

          e.preventDefault();
          e.stopPropagation();

          const columnId = column.id;

          if (onGroupingChange) {
            onGroupingChange(prev => {
              const current = Array.isArray(prev) ? prev : [];
              if (current.includes(columnId)) {
                return current.filter(id => id !== columnId);
              }
              return [...current, columnId];
            });
          } else if (typeof column.toggleGrouping === "function") {
            column.toggleGrouping();
          }
        },

        title: canGroup
          ? isGrouped
            ? "Double-click to ungroup"
            : "Double-click to group by this column"
          : undefined,

        sx: {
          backgroundColor: isGrouped ? "#BFDBFE" : "#DBEAFE",
          borderBottom: "1px solid #BFDBFE",
          color: "#1E3A8A",
          fontWeight: 600,
          fontSize: "13px",
          py: "10px",
          px: "4px",
          whiteSpace: "normal",
          userSelect: "none",
          cursor: canGroup ? "pointer" : "default",

          "& .MuiTableSortLabel-icon, & .MuiSvgIcon-root": {
            color: "#2563EB !important",
            fontSize: "16px",
          },

          "& .MuiIconButton-root": {
            color: "#2563EB",
            padding: "2px",
          },

          "&:hover": {
            backgroundColor: isGrouped ? "#93C5FD" : canGroup ? "#BFDBFE" : "#DBEAFE",
          },
        },
      };
    },

    // ── Table container & Paper ────────────────────────────────────
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        backgroundColor: "#fff",
      },
    },

    muiTopToolbarProps: ({ table }) => {
      const isGrouped = (table.getState().grouping?.length ?? 0) > 0;
      if (!isGrouped) {
        return {
          sx: {
            display: "none !important",
            height: "0 !important",
            minHeight: "0 !important",
            p: "0 !important",
            m: "0 !important",
            border: "none !important",
          },
        };
      }

      return {
        sx: {
          backgroundColor: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          minHeight: "36px",
          px: "6px",
          py: "2px",
          "& .MuiToolbar-root": {
            minHeight: "36px",
            padding: "0 4px",
          },
          "& .MuiBox-root": {
            minHeight: "unset",
            alignItems: "center",
          },
          "& .MuiChip-root": {
            height: "24px",
            fontSize: "12px",
          },
          "& .MuiTypography-root": {
            fontSize: "13px",
            fontWeight: 500,
          },
        },
      };
    },

    muiTableContainerProps: {
      sx: {
        maxHeight: "50vh",
      },
    },

    muiTableHeadProps: {
      sx: {
        backgroundColor: "#DBEAFE",
      },
    },

    muiTableBodyCellProps: {
      sx: {
        fontSize: "13px",
        color: "#374151",
        borderBottom: "1px solid #F3F4F6",
        py: "2px",
        px: "2px",
        whiteSpace: "normal",
      },
    },

    muiTableBodyRowProps: {
      hover: true,
      sx: {
        transition: "background-color 0.12s",
        "&:hover td": {
          backgroundColor: "#F3F4F6",
        },
      },
    },

    renderEmptyRowsFallback: () => (
      <div
        style={{
          padding: "24px 0",
          textAlign: "center",
          color: "#6B7280",
          fontSize: 13,
        }}
      >
        No records found
      </div>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default BaseTable;
