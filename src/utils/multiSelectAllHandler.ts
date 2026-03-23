export interface SelectItem {
  label: string;
  value: number | string;
}

interface MultiSelectAllResult {
  selectedOptions: SelectItem[];
  selectedIds: Array<number | string>;
  cleared: boolean;
}

export function handleMultiSelectWithAll(
  options: readonly SelectItem[] | null,
  prevSelected: SelectItem[],
  allOptions: readonly SelectItem[],
  allValue = 0
): MultiSelectAllResult {
  const selected = options ?? [];

  const allOption = allOptions.find(o => o.value === allValue);
  const realOptions = allOptions.filter(o => o.value !== allValue);

  const hasAll = selected.some(o => o.value === allValue);
  const hadAllBefore = prevSelected.some(o => o.value === allValue);

  if (!hasAll && hadAllBefore) {
    return {
      selectedOptions: [],
      selectedIds: [],
      cleared: true,
    };
  }

  if (hasAll && !hadAllBefore && allOption) {
    return {
      selectedOptions: [allOption, ...realOptions],
      selectedIds: realOptions.map(o => o.value),
      cleared: false,
    };
  }

  const filtered = selected.filter(o => o.value !== allValue);

  return {
    selectedOptions: filtered,
    selectedIds: filtered.map(o => o.value),
    cleared: false,
  };
}
