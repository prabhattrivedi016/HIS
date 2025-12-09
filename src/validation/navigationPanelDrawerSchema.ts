import * as yup from "yup";

export const navigationPanelDrawerSchema = yup.object().shape({
  subMenuId: yup.number().nullable(),
  tabId: yup.number().required("Tab Name is required"),
  subMenuName: yup.string().required("Sub Menu Name is required"),
  url: yup.string().required("Url is required"),
  isActive: yup.boolean().required("Status is required"),
});
