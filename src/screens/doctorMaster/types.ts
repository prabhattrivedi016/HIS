type DepartmentItem = {
  departmentId: number;
  department: string;
  departmentTypeId: number;
  departmentType: string;
  isActive: number;
};

type SpecializationItem = {
  specializationId: number;
  specialization: string;
  isActive: number;
};

type SelectItem = {
  value: number;
  label: string;
};

export type { DepartmentItem, SelectItem, SpecializationItem };
