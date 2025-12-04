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
  isActive: number;
  groupName: string;
};

// user master group types
type updateUserGroupStatusProps = {
  isActive: number;
  id: number;
};

type SearchHandlerProps = {
  keyInput: string;
  selectedValue: string;
};

type MapToUserDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  groupId: number | null;
};

export type {
  FormSubmitProps,
  MapToUserDrawerProps,
  SearchHandlerProps,
  updateUserGroupStatusProps,
  UserGroupDrawerProps,
};
