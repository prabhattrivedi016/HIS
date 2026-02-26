import { ReferDoctorMasterGridItem } from "@/screens/referDoctorMaster/types";
import { GridItem, ListItem } from "@/types";

export type FilteredDataProps<G extends GridItem = GridItem, L extends ListItem = ListItem> = {
  value: string;
  selectedValue: string;
  listData?: L[];
  gridData: G[] | ReferDoctorMasterGridItem[];

  setListFilteredData: React.Dispatch<React.SetStateAction<L[]>>;
  setGridFilteredData: React.Dispatch<React.SetStateAction<G[]>>;
};

// filter function
export const filteredData = <G extends GridItem = GridItem, L extends ListItem = ListItem>({
  value,
  selectedValue,
  listData,
  gridData,
  setListFilteredData,
  setGridFilteredData,
}: FilteredDataProps<G, L>): { filteredList: L[]; filteredGrid: G[] } => {
  const searchValue = value.trim().toLowerCase();

  // Reset when no search and no column selection
  if (!searchValue && !selectedValue) {
    setListFilteredData(listData || []);
    setGridFilteredData(gridData);

    return {
      filteredList: listData || [],
      filteredGrid: gridData,
    };
  }

  // list data
  const filteredList = (listData || []).filter(item => {
    if (selectedValue) {
      const col = item.columns.find(c => c.label === selectedValue);
      if (!col) return false;

      if (selectedValue === "Status") {
        const statusText = col.value === 1 ? "active" : "inactive";
        return col.value?.toString().includes(searchValue) || statusText.includes(searchValue);
      }

      return col.value?.toString().toLowerCase().includes(searchValue);
    }

    // Search across all columns when no specific column is selected
    return item.columns.some(col => {
      if (col.label === "Status") {
        const statusText = col.value === 1 ? "active" : "inactive";
        return col.value?.toString().includes(searchValue) || statusText.includes(searchValue);
      }
      return col.value?.toString().toLowerCase().includes(searchValue);
    });
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
