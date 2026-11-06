import * as yup from "yup";
import { InferType } from "yup";

// Optional number
const optionalNumber = yup
  .number()
  .transform((value, originalValue) => (originalValue === "" || Number.isNaN(value) ? null : value))
  .nullable();

// Required number
const requiredNumber = yup
  .number()
  .transform((value, originalValue) =>
    originalValue === "" || Number.isNaN(value) ? undefined : value
  )
  .typeError("Please enter a valid number")
  .required("This field is required");

export const labReportPrintSettingSchema = yup.object().shape({
  BranchId: requiredNumber,

  // QR code
  IsActiveQRCode: optionalNumber,
  XQRCode: optionalNumber,
  YQRCode: optionalNumber,
  QRHeight: optionalNumber,
  QRWidth: optionalNumber,
  QRCodePosition: optionalNumber,

  // Barcode
  IsActiveBarcode: optionalNumber,
  XBarcode: optionalNumber,
  YBarcode: optionalNumber,
  BarcodeHeight: optionalNumber,
  BarcodeWidth: optionalNumber,
  BarcodePosition: optionalNumber,
  RotateBarcode90Degree: optionalNumber,

  // Other settings
  PrintDateTime: optionalNumber,
  PreparedBy: optionalNumber,
  PrintedBy: optionalNumber,
  PageNumbering: optionalNumber,
  SendEmail: optionalNumber,
  SendWhatsAppMessage: optionalNumber,
  MarginLeft: optionalNumber,
  PageWidth: optionalNumber,
  BrowserWidth: optionalNumber,
  TopLine: optionalNumber,
  BottomLine: optionalNumber,

  // Test
  HideTestNameForSingleTest: optionalNumber,
  PrintDepartmentSeparate: optionalNumber,

  // Doctor digital signature
  ShowDigitalSignature: optionalNumber,
  XSignature: optionalNumber,
  YSignature: optionalNumber,

  // Header
  HeaderHeight: optionalNumber,
  XHeader: optionalNumber,
  YHeader: optionalNumber,
  HeaderBrowserWidth: optionalNumber,

  // Footer
  FooterHeight: optionalNumber,
  XFooter: optionalNumber,
  YFooter: optionalNumber,
  FooterBrowserWidth: optionalNumber,
  FooterTopLine: optionalNumber,
});

export type LabReportPrintSettingFromData = InferType<typeof labReportPrintSettingSchema>;
