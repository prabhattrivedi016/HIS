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

type UserItem = {
  isGranted: number;
  groupId: number;
  userId: number;
  groupName: string;
  userName: string;
};

export type {
  FormSubmitProps,
  SearchHandlerProps,
  updateUserGroupStatusProps,
  UserGroupDrawerProps,
  UserItem,
};
