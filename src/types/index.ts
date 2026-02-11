interface GridLeftTop {
  label: string;
  value: number | string | null;
}
interface GridRightTop {
  label: string;
  action: string;
}

interface GridId {
  label: string;
  value: number | string;
}

interface GridTitle {
  label: string;
  value: string;
}

interface GridFooterItem {
  label: string;
  value: string;
}

interface GridButtonSection {
  label: string;
  action: string;
}

interface GridItem {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;

  cardLeftTop: GridLeftTop[];
  cardRightTop: GridRightTop[];
  cardAvatar: string | null;
  cardId: GridId[];
  cardTitle: GridTitle[];
  cardFooter: GridFooterItem[];
  cardButton: GridButtonSection[];
}

// list view
interface ListLeftButton {
  label: string;
  action: string;
}

interface ColumnItem {
  isSortable?: boolean;
  isSearchable?: boolean;
  allowColumnFilter?: boolean;
  isMasked?: boolean;

  label: string;
  keyFromApi: string;
  value: string | number | null;
}

interface ListItem {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;

  listLeftButton: ListLeftButton[];
  columns: ColumnItem[];
}

type ColumnVisibility = Record<string, boolean>;

export type { ColumnVisibility, GridItem, ListItem };
