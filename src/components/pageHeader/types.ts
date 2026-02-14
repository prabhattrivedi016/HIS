export interface PageHeaderProps {
  title: string;
  view: ;
  onCardView: (view: VIEWTYPE) => void;
  buttonTitle: string;
  onRefresh: () => Promise<void>;
  onSearch?: (keyInput: string, selectedValue?: string) => void;
  onAddNew: (id: number | null) => void;
  onDownload?: () => void;
  onFilter?: any[];
  hideShowBtnRef?: React.RefObject<HTMLElement>;
  onToggleColumnModal?: () => void;
  downloadBtnRef?: React.RefObject<HTMLElement>;
  unitButton?: string;
  onAddUnit?: () => void;
}
