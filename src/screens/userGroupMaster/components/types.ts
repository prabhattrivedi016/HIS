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

interface UserGroupItem{

    isGranted: number,
    groupId: number,
    userId: number,
    groupName: string,
    userName:string
}

export type {
  FormSubmitProps,
  MapToUserDrawerProps,
  SearchHandlerProps,
  updateUserGroupStatusProps,
  UserGroupDrawerProps,
  UserGroupItem
};




{
    "isGranted": 1,
    "groupId": 12,
    "userId": 5,
    "groupName": "Front Office",
    "userName": "abc   (admin)"
}