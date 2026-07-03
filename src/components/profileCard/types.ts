import React from "react";

export type OnStatusChange = (payload: {
  isActive: number;
  userId?: number;
  roleId?: number;
  id?: number;
  doctorId?: number;
  referDoctorId?: number;
  corporateId?: number;
}) => Promise<void> | void;

export type HandleButtonClickProps = {
  btnAction: string;
  onStatusChange?: OnStatusChange;
  cardLeftTop: { label?: string; value?: string | number | null }[];
  buttonTitle?: (title: string) => void;
  drawerTitle?: (title: string) => void;
  openDrawer?: (id: number | null) => void;
  id: number;
  mapToUser?: (id: number) => void;
  onCustomButtonClick?: (action: string, id: number) => void;
};

export type ValueItem = {
  label?: string;
  value?: string | number | null;
  keyFromApi?: string;
};

export type GridViewData = {
  cardLeftTop: { label?: string; value?: string | number | null }[];
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

export interface GridViewProps {
  data: GridViewData;
  onStatusChange?: OnStatusChange;
  openDrawer?: (id: number | null) => void;
  buttonTitle?: (title: string) => void;
  drawerTitle?: (title: string) => void;
  cardRightTopBtn?: (id: number, rect: DOMRect) => void;
  mapToUser?: (id: number) => void;
  gridRightBtnRef?: React.RefObject<HTMLButtonElement>;
  onCustomButtonClick?: (action: string, id: number) => void;
  shouldShowButton?: (action: string, id: number) => boolean;
  getCustomButtonLabel?: (label: string, action: string, id: number) => string;
}

export type ListColumn = {
  label: string;
  keyFromApi?: string;
  value: string | number | null;
  allowColumnFilter?: boolean;
  isMasked?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
};

export type ListLeftButton = {
  label: string;
  action: string;
};

export type ListViewData = {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  columns: ListColumn[];
  listLeftButton: ListLeftButton[];
};

export interface ListViewProps {
  data?: ListViewData[];
  onStatusChange?: (payload: { isActive: number; doctorId?: number }) => void;
  openDrawer?: (id: number) => void;
  columnVisibility?: Record<string, boolean>;
  renderRowActionMenu?: (rowData: ListViewData, closeMenu: () => void) => React.ReactNode;
}
