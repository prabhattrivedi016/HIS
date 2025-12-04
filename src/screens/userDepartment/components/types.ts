type UserDeptDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  buttonTitle: string;
  drawerTitle: string;
  deptId?: number;
};

type Payload = {
  id: string | null;
  departmentName: string;
  isActive: string;
};

type UpdateUserDeptStatusProps = {
  isActive: number;
  id: number;
};

export type { Payload, UpdateUserDeptStatusProps, UserDeptDrawerProps };
