export type UpdateRoleMasterStatusProps = {
  isActive?: boolean | number;
  roleId?: number;
};

export type CardType = "GRID" | "LIST";

type RoleMasterProps = {
  isOpen: boolean;
  onClose: () => void;
  drawerTitle: string;
  buttonTitle: string;
  onCloseDrawer?: () => void;
  roleId: number;
};

type IconOptionsItem = {
  value: number;
  label: string;
  iconPath: string;
};

export type { IconOptionsItem, RoleMasterProps };
