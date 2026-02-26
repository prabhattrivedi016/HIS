interface RoleBindPageProps {
  isOpen: boolean;
  onClose: () => void;
  roleChange: (roleName: string) => void;
  branchId: number;
  userId: number;
}

type RoleMapItem = {
  roleId: number;
  roleName: string;
  iconClass: string;
  imagePath: string;
};

type TabItem = {
  tabId: number;
  tabName: string;
  iconClass: string;
};
type subMenuItem = {
  subMenuId: number;
  subMenuName: string;
  url: string;
  tabId: number;
};

type UserDetailsItem = {
  id: number;
  firstName: string;
  midelName: string;
  lastName: string;
  dob: string;
  gender: string;
  userName: string;
  password: string;
  address: string;
  contact: string;
  email: string;
  isActive: number;
  employeeID: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  reportToUserId: number;
  userDepartmentId: number;
};

export type { RoleBindPageProps, RoleMapItem, subMenuItem, TabItem, UserDetailsItem };

/*{
   
} */
