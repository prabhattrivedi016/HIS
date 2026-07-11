import { VIEWTYPE } from "../../constants/constants";

export interface PageHeaderProps {
  title: string;
  view: string;
  onCardView: (view: string) => void;
  buttonTitle: string;
  onRefresh: () => Promise<void>;
  onSearch?: (keyInput: string, selectedValue?: string) => void;
  onAddNew: (id: number | null) => void;
  onDownload?: () => void;
  onFilter?: { label: string; keyFromApi?: string }[];
  hideShowBtnRef?: React.RefObject<HTMLElement>;
  onToggleColumnModal?: () => void;
  downloadBtnRef?: React.RefObject<HTMLElement>;
  unitButton?: string;
  onAddUnit?: () => void;
  showAddButton?: boolean;
  onFilterDiscountApproval?: () => void;
}
