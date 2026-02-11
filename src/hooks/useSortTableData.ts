import { useState } from "react";

export const useSortTableData = (items = []) => {
  const [sortConfig, setSortConfig] = useState(null);

  const sortedItems = (() => {
    if (!sortConfig) return items;

    const sorted = [...items].sort((a, b) => {
      const aVal = sortConfig.getValue(a, sortConfig.key);
      const bVal = sortConfig.getValue(b, sortConfig.key);

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  })();

  const onSort = (key, getValue) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === "asc" ? "desc" : "asc",
      getValue,
    }));
  };

  return { sortedItems, sortConfig, onSort };
};
