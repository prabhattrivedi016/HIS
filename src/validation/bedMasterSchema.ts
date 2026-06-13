import * as yup from "yup";

// export const bedMasterInputSchema = yup.object().shape({
//   branchId: yup.string().nullable(),
//   typeId: yup.string().nullable(),
//   floorId: yup.string().nullable(),
//   wardNameId: yup.string().nullable(),
//   bedId: yup.string().nullable(),
// });

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
