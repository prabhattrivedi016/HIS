type ListColumn = {
  label: string;
  value: any;
  keyFromApi?: string;
};

export type ListItem = {
  columns: ListColumn[];
};

export type GridTitleItem = {
  value: string | number;
};

export type GridItem = {
  cardTitle: GridTitleItem[];
};

export type FilteredDataProps = {
  value: string;
  selectedValue: string;
  listData: ListItem[];
  gridData: GridItem[];

  setListFilteredData: React.Dispatch<React.SetStateAction<ListItem[]>>;
  setGridFilteredData: React.Dispatch<React.SetStateAction<GridItem[]>>;
};

// filter function
export const filteredData = ({
  value,
  selectedValue,
  listData,
  gridData,
  setListFilteredData,
  setGridFilteredData,
}: FilteredDataProps): { filteredList: ListItem[]; filteredGrid: GridItem[] } => {
  const searchValue = value.trim().toLowerCase();

  // Reset when no search and no column selection
  if (!searchValue && !selectedValue) {
    setListFilteredData(listData);
    setGridFilteredData(gridData);

    return {
      filteredList: listData,
      filteredGrid: gridData,
    };
  }

  // list data
  const filteredList = listData.filter(item => {
    if (selectedValue) {
      const col = item.columns.find(c => c.label === selectedValue);
      if (!col) return false;

      if (selectedValue === "Status") {
        const statusText = col.value === 1 ? "active" : "inactive";

        return col.value?.toString().includes(searchValue) || statusText.includes(searchValue);
      }

      return col.value?.toString().toLowerCase().includes(searchValue);
    }
  });

  // grid data
  const filteredGrid = gridData.filter(item =>
    item.cardTitle?.some(titleObj => titleObj.value?.toString().toLowerCase().includes(searchValue))
  );

  setListFilteredData(filteredList);
  setGridFilteredData(filteredGrid);

  return {
    filteredList,
    filteredGrid,
  };
};
