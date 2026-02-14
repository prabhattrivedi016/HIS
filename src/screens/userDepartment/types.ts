type UserDeptDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  deptId?: number | null;
};

type Payload = {
  id: string | null | undefined;
  departmentName: string;
  isActive: number;
};

type UpdateUserDeptStatusProps = {
  isActive: number;
  id: number;
};

export type { Payload, UpdateUserDeptStatusProps, UserDeptDrawerProps };
