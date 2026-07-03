import { useState } from "react";

type SortConfig<T> = {
  key: string;
  direction: "asc" | "desc";
  getValue: (item: T, key: string) => unknown;
};

export const useSortTableData = <T>(items: T[] = []) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const sortedItems = (() => {
    if (!sortConfig) return items;

    const sorted = [...items].sort((a, b) => {
      const aVal = sortConfig.getValue(a, sortConfig.key);
      const bVal = sortConfig.getValue(b, sortConfig.key);

      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  })();

  const onSort = (key: string, getValue: (item: T, key: string) => unknown) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === "asc" ? "desc" : "asc",
      getValue,
    }));
  };

  return { sortedItems, sortConfig, onSort };
};
