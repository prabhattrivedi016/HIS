type GroupTypeItem = {
  GroupTypeId: number;
  GroupTypeName: string;
  IsActive: number;
};

type RoomTypeItem = {
  serviceItemId: number;
  name: string;
};

type TabMasterItem = {
  GroupTypeId: number;
  GroupTypeName: string | null;
  TabId: number;
  TabName: string;
  TabViewURL: string;
  SequenceNo: number;
  TabTypeId: number;
  TabType: string;
  RoomTypeId: number | null;
  RoomType: string;
  FaIconId: number | null;
  IconClass: string | null;
  IsActive: number;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
};

type RoleTabItem = {
  isGranted: number;
  TabId: number;
  TabName: string;
  TabTypeId: number;
  TabType: string;
};

type IconListItem = {
  id: number;
  iconClass: string;
  iconName: string;
};

type ActiveRoleItem = {
  roleId: number;
  roleName: string;
  isActive: number;
};

type AddNewTabProps = {
  isOpen: boolean;
  onClose: () => void;
  data: TabMasterItem | null;
  onSuccess?: () => void;
};

type TabMappingProps = {
  isOpen: boolean;
  onClose: () => void;
};

type CreateUpdateGroupTypeProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupTypeId: number) => void;
};

export type {
  ActiveRoleItem,
  AddNewTabProps,
  CreateUpdateGroupTypeProps,
  GroupTypeItem,
  IconListItem,
  RoleTabItem,
  RoomTypeItem,
  TabMappingProps,
  TabMasterItem,
};
