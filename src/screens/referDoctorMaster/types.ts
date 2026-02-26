type ValueItem = {
  label?: string;
  value?: string | number;
  keyFromApi?: string;
};

type LabelAction = {
  label: string;
  action: string;
};

interface ReferDoctorMasterGridItem {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  cardLeftTop: { label: string; value?: number | null }[];
  cardRightTop: ValueItem[];
  cardAvatar?: string | null;
  cardId: ValueItem[];
  cardTitle: ValueItem[];
  cardFooter: ValueItem[];
  cardButton: {
    label: string;
    action: string;
  }[];
  buttonSection: {
    label: string;
    action: string;
    color?: string;
  }[];
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
