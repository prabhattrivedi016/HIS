import * as yup from "yup";

export const addNewTabSchema = yup.object().shape({
  tabId: yup.string().nullable(),
  tabName: yup.string().required("Tab Name is required"),
  faIconId: yup.string().required("Icon is required"),
});
