type SurgeryItem = {
  ComponentId: number;
  ComponentName: string;
  HasDoctor: number;
  HasDoctorDate: number;
  IsBaseComponent: number;
  SharePercentage: number;
  IsActive: number;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
};

export type { SurgeryItem };
