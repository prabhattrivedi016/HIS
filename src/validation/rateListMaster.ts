import * as yup from "yup";
import { InferType } from "yup";

export const rateListMasterSchema = yup.object().shape({
  rateListId: yup.number().nullable(),
  applicableDate: yup.string().nullable(),
  rateListName: yup.string().required("Rate list name is required"),
  expiryDate: yup.string().nullable(),
  isActive: yup.number().required("Status is required"),
  importFromRateListId: yup
    .number()
    .transform(value => (isNaN(value) ? 0 : value))
    .moreThan(0, "Import rate list is required"),
});

export type RateListMasterFormData = InferType<typeof rateListMasterSchema>;
