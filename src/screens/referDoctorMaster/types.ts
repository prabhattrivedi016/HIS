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

type LabelAction = GridButtonSection;

interface ReferDoctorMasterGridItem {
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

interface ListColumn {
  label: string;
  keyFromApi: string;

  value: string | number | null;

  isSortable?: boolean;
  isSearchable?: boolean;
  allowColumnFilter?: boolean;
  isMasked?: boolean;
}

interface ReferDoctorMasterListItem {
  type: "referDoctorMaster";
  cardType: "referDoctorMasterList";
  cardViewType: "list";

  id: number;

  listLeftButton: LabelAction[];

  columns: ListColumn[];
}

type ReferDoctorMasterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  referDoctorId?: number | null | undefined;
  onCloseDrawer: () => void;
};

type TitleItem = {
  value: string;
  key: string;
};
type ProNameItem = {
  proId: number;
  name: string;
  contactNo: string;
  isActive: number;
};

type ProNamePopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  proId?: number | null;
  refreshProName: () => Promise<void>;
};

export type {
  ProNameItem,
  ProNamePopUpProps,
  ReferDoctorMasterDrawerProps,
  ReferDoctorMasterGridItem,
  ReferDoctorMasterListItem,
  TitleItem,
};
