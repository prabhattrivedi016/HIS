import * as yup from "yup";

export const userGroupSchema = yup.object().shape({
  id: yup.string().nullable(),
  groupName: yup.string().required("Group Name is required"),
  isActive: yup.string().required("Status is required"),
});
