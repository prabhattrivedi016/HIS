import * as yup from "yup";

export const bedMasterSchema = yup.object().shape({
  bedId: yup.number().nullable(),
  branchId: yup.number().min(1, "Branch is required"),
  typeId: yup.number().min(1, "Type is required"),
  blockId: yup.number().min(1, "Block is required"),
  floorId: yup.number().min(1, "Floor is required"),
  wardNameId: yup.number().min(1, "Ward name is required"),
  roomName: yup.string().required("Room name is required"),
  gender: yup.string().nullable(),
  bedNo: yup
    .string()
    .required("Bed number is required")
    .test("bed-range", "Bed number must be between 1 and 25", value => {
      const num = Number(value);
      return num >= 1 && num <= 25;
    }),
  isActive: yup.number().nullable(),
});
export type BranchMasterFormItem = yup.InferType<typeof bedMasterSchema>;

export const createUpdateFloorSchema = yup.object().shape({
  floorId: yup.number().nullable(),
  floorName: yup.string().required("Floor name is required"),
});

export type CreateUpdateFloorSchemaFormItem = yup.InferType<typeof createUpdateFloorSchema>;

export const createUpdateWardSchema = yup.object().shape({
  wardNameId: yup.number().nullable(),
  wardName: yup.string().required("Ward name is required"),
});

export type CreateUpdateWardSchemaFormItem = yup.InferType<typeof createUpdateWardSchema>;

export const createUpdateBlockSchema = yup.object().shape({
  blockId: yup.number().nullable(),
  blockName: yup.string().required("Block name is required"),
});

export type CreateUpdateBlockSchemaFormItem = yup.InferType<typeof createUpdateBlockSchema>;
