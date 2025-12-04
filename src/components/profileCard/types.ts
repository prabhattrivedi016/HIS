type OnStatusChange = (payload: {
  isActive: number;
  userId?: number;
  roleId?: number;
  id?: number;
}) => Promise<any>;

type HandleButtonClickProps = {
  btnAction: string;
  onStatusChange: OnStatusChange;
  cardLeftTop: { value?: number }[];
  buttonTitle: (title: string) => void;
  drawerTitle: (title: string) => void;
  openDrawer: (id: number | null) => void;
  id: number;
  mapToUser?: (id: number) => void;
};

type ValueItem = {
  label?: string;
  value?: string | number;
  keyFromApi?: string;
};

type GridViewData = {
  cardLeftTop: { value?: number }[];
  cardRightTop: ValueItem[];
  cardAvatar?: string | null;
  cardId: ValueItem[];
  cardTitle: ValueItem[];
  cardFooter: ValueItem[];
  buttonSection: {
    label: string;
    action: string;
    color?: string;
  }[];
  id: number;
};

interface GridViewProps {
  data: GridViewData;
  onStatusChange: OnStatusChange;
  openDrawer: (id: number | null) => void;
  buttonTitle: (title: string) => void;
  drawerTitle: (title: string) => void;
  cardRightTopBtn: (id: number, rect: DOMRect) => void;
  mapToUser?: (id: number) => void;
  gridRightBtnRef?: React.RefObject<HTMLButtonElement>;
}

type ListColumn = {
  label: string;
  keyFromApi?: string;
  value: string | number | null;
  allowColumnFilter?: boolean;
  isMasked?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
};

type ListLeftButton = {
  label: string;
  action: string;
};

type ListViewData = {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  columns: ListColumn[];
  listLeftButton: ListLeftButton[];
};

type ListViewProps = {
  data: ListViewData;
  onStatusChange: OnStatusChange;
  openDrawer: (id: number | null) => void;
  columnVisibility: (id: number | null) => Promise<any>;
};

export type { GridViewData, GridViewProps, HandleButtonClickProps, ListViewProps };
