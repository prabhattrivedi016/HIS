import * as yup from "yup";

export const tabMasterSchema = yup.object().shape({
  tabId: yup.number().nullable(),
  groupTypeId: yup.number().min(1, "Group type is required").required("Group type is required"),
  tabName: yup.string().required("Tab name is required"),
  tabViewURL: yup.string().required("Tab view URL is required"),
  sequenceNo: yup.string().required("Sequence no is required"),
  tabTypeId: yup.number().min(1, "Tab type is required").required("Tab type is required"),
  tabType: yup.string().required("Tab type is required"),
  roomTypeId: yup.number().min(1, "Room type is required").required("Room type is required"),
  isActive: yup.number().required("Status is required"),
});

export type TabMasterFormData = yup.InferType<typeof tabMasterSchema>;

export const tabGroupTypeSchema = yup.object().shape({
  groupTypeId: yup.number().nullable(),
  groupTypeName: yup.string().trim().required("Group type name is required"),
});

export type TabGroupTypeFormData = yup.InferType<typeof tabGroupTypeSchema>;
