type HmsUserItem = {
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

type SelectItem = {
  label: string;
  value: number | string;
};

type DiscountItem = {
  id: number;
  name: string;
  isActive: number;
  discountType: string;
  branchName: string;
  firstName: string;
};

export type { DiscountItem, HmsUserItem, SelectItem };
