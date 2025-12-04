type ColumnVisibilityMap = Record<string, boolean>;

type PositionMap = {
  top: number;
  left: number;
};

type HideShowColumnProps = {
  columnNames: string[];
  onClose: () => void;
  columnVisibility: Record<string, boolean>;
  position: PositionMap;
  anchorRef: React.RefObject<HTMLElement>;
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibilityMap>>;
};

type DownloadPopupProps = {
  anchorRef: React.RefObject<HTMLElement>;
  position: PositionMap;
  onClose: () => void;
  onDownloadPdf: () => void;
  onDownloadExcel: () => void;
};

export type { ColumnVisibilityMap, DownloadPopupProps, HideShowColumnProps };
