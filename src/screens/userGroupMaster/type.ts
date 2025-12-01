// user group drawer types

type UserGroupDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  drawerTitle: string;
  buttonTitle: string;
  onCloseDrawer?: () => void;
  id?: number | null;
};

type FormSubmitProps = {
  id: number;
  isActive: boolean;
  groupName: string;
};

// user master group types
type updateUserGroupStatusProps = {
  isActive: boolean;
  id: number;
};

type SearchHandlerProps = {
  keyInput: string;
  selectedValue: string;
};

export type {
  FormSubmitProps,
  SearchHandlerProps,
  updateUserGroupStatusProps,
  UserGroupDrawerProps,
};
