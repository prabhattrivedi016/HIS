import * as yup from "yup";
import { InferType } from "yup";

export const rateListMasterSchema = yup.object().shape({
  rateListId: yup.number().nullable(),
  rateListName: yup.string().required("Rate list name is required"),
  expiryDate: yup.string().required("Expiry date is required"),
  isActive: yup.number().required("Status is required"),
});

export type RateListMasterFormData = InferType<typeof rateListMasterSchema>;
