import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import {
  LabReportPrintSettingFromData,
  labReportPrintSettingSchema,
} from "@/validation/labReportPrintSettingSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DefaultPrintSettingItemValue } from "../types";

const LabReportPrintSettings = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = useContext(BranchContext)?.branchId;

  const {
    register,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(labReportPrintSettingSchema),
    defaultValues: {
      BranchId: branchId,
      // qr
      IsActiveQRCode: 0,
      XQRCode: 0,
      YQRCode: 0,
      QRHeight: 0,
      QRWidth: 0,
      QRCodePosition: 0,

      // barcode
      IsActiveBarcode: 0,
      XBarcode: 0,
      YBarcode: 0,
      BarcodeHeight: 0,
      BarcodeWidth: 0,
      BarcodePosition: 0,
      RotateBarcode90Degree: 0,

      // other settings
      PrintDateTime: 0,
      PreparedBy: 0,
      PrintedBy: 0,
      PageNumbering: 0,
      SendEmail: 0,
      SendWhatsAppMessage: 0,
      MarginLeft: 0,
      PageWidth: 0,
      BrowserWidth: 0,
      TopLine: 0,
      BottomLine: 0,

      // test
      HideTestNameForSingleTest: 0,
      PrintDepartmentSeparate: 0,

      // digital sign
      ShowDigitalSignature: 0,
      XSignature: 10,
      YSignature: 0,

      // footer
      FooterHeight: 0,
      XFooter: 0,
      YFooter: 0,
      FooterBrowserWidth: 0,
      FooterTopLine: 0,

      // header
      HeaderHeight: 0,
      XHeader: 0,
      YHeader: 0,
      HeaderBrowserWidth: 0,
    },
  });

  // get print setting values
  const getPrintSettingValues = async (
    isDefault: number = 0
  ): Promise<DefaultPrintSettingItemValue | null> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LAB_REPORT_PRINT_SETTING,
      {},
      { params: { branchId, applyDefaults: isDefault } },
      { component: "LabReportPrintSettings" }
    );

    if (!resp?.result) {
      showError(resp?.message ?? "Error while fetching print settings");
      return null;
    }

    return resp?.data ?? null;
  };

  useEffect(() => {
    getAllDataOnMount();
  }, []);

  // auto fill data onm mount
  const getAllDataOnMount = async () => {
    const resultValues = await getPrintSettingValues(0);
    if (resultValues) {
      reset({
        BranchId: resultValues?.BranchId,

        // QR code
        IsActiveQRCode: resultValues?.IsActiveQRCode ?? 0,
        XQRCode: resultValues?.XQRCode ?? 0,
        YQRCode: resultValues?.YQRCode ?? 0,
        QRHeight: resultValues?.QRHeight ?? 0,
        QRWidth: resultValues?.QRWidth ?? 0,
        QRCodePosition: resultValues?.QRCodePosition ?? 0,

        // Barcode
        IsActiveBarcode: resultValues?.IsActiveBarcode ?? 0,
        XBarcode: resultValues?.XBarcode ?? 0,
        YBarcode: resultValues?.YBarcode ?? 0,
        BarcodeHeight: resultValues?.BarcodeHeight ?? 0,
        BarcodeWidth: resultValues?.BarcodeWidth ?? 0,
        BarcodePosition: resultValues?.BarcodePosition ?? 0,
        RotateBarcode90Degree: resultValues?.RotateBarcode90Degree ?? 0,

        // Other settings
        PrintDateTime: resultValues?.PrintDateTime ?? 0,
        PreparedBy: resultValues?.PreparedBy ?? 0,
        PrintedBy: resultValues?.PrintedBy ?? 0,
        PageNumbering: resultValues?.PageNumbering ?? 0,
        SendEmail: resultValues?.SendEmail ?? 0,
        SendWhatsAppMessage: resultValues?.SendWhatsAppMessage ?? 0,
        MarginLeft: resultValues?.MarginLeft ?? 0,
        PageWidth: resultValues?.PageWidth ?? 0,
        BrowserWidth: resultValues?.BrowserWidth ?? 0,
        TopLine: resultValues?.TopLine ?? 0,
        BottomLine: resultValues?.BottomLine ?? 0,

        // Test settings
        HideTestNameForSingleTest: resultValues?.HideTestNameForSingleTest ?? 0,
        PrintDepartmentSeparate: resultValues?.PrintDepartmentSeparate ?? 0,

        // Digital signature
        ShowDigitalSignature: resultValues?.ShowDigitalSignature ?? 0,
        XSignature: resultValues?.XSignature ?? 0,
        YSignature: resultValues?.YSignature ?? 0,

        // Footer
        FooterHeight: resultValues?.FooterHeight ?? 0,
        XFooter: resultValues?.XFooter ?? 0,
        YFooter: resultValues?.YFooter ?? 0,
        FooterBrowserWidth: resultValues?.FooterBrowserWidth ?? 0,
        FooterTopLine: resultValues?.FooterTopLine ?? 0,

        // Header
        HeaderHeight: resultValues?.HeaderHeight ?? 0,
        XHeader: resultValues?.XHeader ?? 0,
        YHeader: resultValues?.YHeader ?? 0,
        HeaderBrowserWidth: resultValues?.HeaderBrowserWidth ?? 0,
      });
    }
  };

  // Default setting handler
  const defaultSettingHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const defaultValues = await getPrintSettingValues(1);

    if (!defaultValues) return;

    reset({
      BranchId: defaultValues?.BranchId,

      // QR code
      IsActiveQRCode: defaultValues?.IsActiveQRCode ?? 0,
      XQRCode: defaultValues?.XQRCode ?? 0,
      YQRCode: defaultValues?.YQRCode ?? 0,
      QRHeight: defaultValues?.QRHeight ?? 0,
      QRWidth: defaultValues?.QRWidth ?? 0,
      QRCodePosition: defaultValues?.QRCodePosition ?? 0,

      // Barcode
      IsActiveBarcode: defaultValues?.IsActiveBarcode ?? 0,
      XBarcode: defaultValues?.XBarcode ?? 0,
      YBarcode: defaultValues?.YBarcode ?? 0,
      BarcodeHeight: defaultValues?.BarcodeHeight ?? 0,
      BarcodeWidth: defaultValues?.BarcodeWidth ?? 0,
      BarcodePosition: defaultValues?.BarcodePosition ?? 0,
      RotateBarcode90Degree: defaultValues?.RotateBarcode90Degree ?? 0,

      // Other settings
      PrintDateTime: defaultValues?.PrintDateTime ?? 0,
      PreparedBy: defaultValues?.PreparedBy ?? 0,
      PrintedBy: defaultValues?.PrintedBy ?? 0,
      PageNumbering: defaultValues?.PageNumbering ?? 0,
      SendEmail: defaultValues?.SendEmail ?? 0,
      SendWhatsAppMessage: defaultValues?.SendWhatsAppMessage ?? 0,
      MarginLeft: defaultValues?.MarginLeft ?? 0,
      PageWidth: defaultValues?.PageWidth ?? 0,
      BrowserWidth: defaultValues?.BrowserWidth ?? 0,
      TopLine: defaultValues?.TopLine ?? 0,
      BottomLine: defaultValues?.BottomLine ?? 0,

      // Test settings
      HideTestNameForSingleTest: defaultValues?.HideTestNameForSingleTest ?? 0,
      PrintDepartmentSeparate: defaultValues?.PrintDepartmentSeparate ?? 0,

      // Digital signature
      ShowDigitalSignature: defaultValues?.ShowDigitalSignature ?? 0,
      XSignature: defaultValues?.XSignature ?? 0,
      YSignature: defaultValues?.YSignature ?? 0,

      // Footer
      FooterHeight: defaultValues?.FooterHeight ?? 0,
      XFooter: defaultValues?.XFooter ?? 0,
      YFooter: defaultValues?.YFooter ?? 0,
      FooterBrowserWidth: defaultValues?.FooterBrowserWidth ?? 0,
      FooterTopLine: defaultValues?.FooterTopLine ?? 0,

      // Header
      HeaderHeight: defaultValues?.HeaderHeight ?? 0,
      XHeader: defaultValues?.XHeader ?? 0,
      YHeader: defaultValues?.YHeader ?? 0,
      HeaderBrowserWidth: defaultValues?.HeaderBrowserWidth ?? 0,
    });
  };

  // save button handler
  const onSubmit = async (formData: LabReportPrintSettingFromData) => {
    console.log("formdata", formData);
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_LAB_REPORT_PRINT_SETTING,
      formData,
      {},
      { component: "LavReportPrintSetting" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while saving values");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    await getPrintSettingValues(0);
  };

  // cancel button handler
  const cancelButtonHandler = () => {
    reset({
      BranchId: branchId,
      // qr
      IsActiveQRCode: 0,
      XQRCode: 0,
      YQRCode: 0,
      QRHeight: 0,
      QRWidth: 0,
      QRCodePosition: 0,

      // barcode
      IsActiveBarcode: 0,
      XBarcode: 0,
      YBarcode: 0,
      BarcodeHeight: 0,
      BarcodeWidth: 0,
      BarcodePosition: 0,
      RotateBarcode90Degree: 0,

      // other settings
      PrintDateTime: 0,
      PreparedBy: 0,
      PrintedBy: 0,
      PageNumbering: 0,
      SendEmail: 0,
      SendWhatsAppMessage: 0,
      MarginLeft: 0,
      PageWidth: 0,
      BrowserWidth: 0,
      TopLine: 0,
      BottomLine: 0,

      // test
      HideTestNameForSingleTest: 0,
      PrintDepartmentSeparate: 0,

      // digital sign
      ShowDigitalSignature: 0,
      XSignature: 10,
      YSignature: 0,

      // footer
      FooterHeight: 0,
      XFooter: 0,
      YFooter: 0,
      FooterBrowserWidth: 0,
      FooterTopLine: 0,

      // header
      HeaderHeight: 0,
      XHeader: 0,
      YHeader: 0,
      HeaderBrowserWidth: 0,
    });
  };

  return (
    <div className="-mt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* QR Code */}
        <div className="card mb-1">
          <h2 className="card-title ">QR Code</h2>

          <div className="form-grid-4">
            <InputField label="X-Axis QR Code (Horizontal Move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter X-axis"
                {...register("XQRCode")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Y-Axis QR Code (Vertical move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter Y-axis"
                {...register("YQRCode")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="QR Height">
              <input
                type="number"
                className="input-field"
                placeholder="Enter QR height"
                {...register("QRHeight")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="QR Width">
              <input
                type="number"
                className="input-field"
                placeholder="Enter QR width"
                {...register("QRWidth")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="QR Position">
              <input
                type="number"
                className="input-field"
                placeholder="Enter QR position"
                {...register("QRCodePosition")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Status">
              <select className="input-field" {...register("IsActiveQRCode")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
          </div>
        </div>

        {/* barcode */}

        <div className="card ">
          <div className=" flex flex-row items-center justify-between">
            <h2 className="card-title">Bar Code</h2>

            <div className="flex flex-row items-center gap-2">
              <input
                id="RotateBarcode90Degree"
                type="checkbox"
                className="input-checkbox"
                checked={Number(watch("RotateBarcode90Degree")) === 1}
                onChange={e => {
                  setValue("RotateBarcode90Degree", e.target.checked ? 1 : 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />

              <label htmlFor="RotateBarcode90Degree" className="font-bold">
                Rotate Barcode 90 Degree
              </label>
            </div>
          </div>

          <div className="form-grid-4">
            <InputField label="X-Axis Barcode (Horizontal move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter X-axis"
                {...register("XBarcode")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Y-Axis Barcode (Vertical move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter Y-axis"
                {...register("YBarcode")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Barcode Height">
              <input
                type="number"
                className="input-field"
                placeholder="Enter barcode height"
                {...register("BarcodeHeight")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Barcode Width">
              <input
                type="number"
                className="input-field"
                placeholder="Enter barcode width"
                {...register("BarcodeWidth")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Barcode Position">
              <input
                type="number"
                className="input-field"
                placeholder="Enter barcode position "
                {...register("BarcodePosition")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Status">
              <select className="input-field" {...register("IsActiveBarcode")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
          </div>
        </div>

        {/* other print setting */}
        <div className="card mt-1 ">
          <h2 className="card-title ">Header Footer & Test Details</h2>

          <div className="form-grid-4">
            <InputField label="Header Height">
              <input
                type="number"
                className="input-field"
                placeholder="Enter header height"
                {...register("HeaderHeight")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="X-Axis Header (Horizontal move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter X-axis"
                {...register("XHeader")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
            <InputField label="Y-Axis Header (Vertical move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter Y-axis"
                {...register("YHeader")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
            <InputField label="Header Browser Width">
              <input
                type="number"
                className="input-field"
                placeholder="Enter header browser width"
                {...register("HeaderBrowserWidth")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label=" Footer Height">
              <input
                type="number"
                className="input-field"
                placeholder="Enter footer height"
                {...register("FooterHeight")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="X-Axis Footer (Horizontal move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter X-axis"
                {...register("XFooter")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
            <InputField label="Y-Axis Header (Vertical move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter Y-axis"
                {...register("YFooter")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
            <InputField label=" Footer Browser Width">
              <input
                type="number"
                className="input-field"
                placeholder="Enter footer browser width"
                {...register("FooterBrowserWidth")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
            <InputField label=" Footer Top Line">
              <input
                type="number"
                className="input-field"
                placeholder="Enter footer top line"
                {...register("FooterTopLine")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Hide Test Name For Single ">
              <select className="input-field" {...register("HideTestNameForSingleTest")}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Print Department Separate">
              <select className="input-field" {...register("PrintDepartmentSeparate")}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
          </div>
        </div>

        {/* doctor digital signature and other details */}
        <div className="card mt-1">
          <h2 className="card-title ">Digital Signature & Other Details</h2>
          <div className="form-grid-4">
            <InputField label="Show Digital Signature">
              <select className="input-field" {...register("ShowDigitalSignature")}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
            <InputField label="X-Axis Signature (Horizontal move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter X-axis"
                {...register("XSignature")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
            <InputField label="Y-Axis Signature (Vertical move)">
              <input
                type="number"
                className="input-field"
                placeholder="Enter Y-axis"
                {...register("YSignature")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
            <InputField label="Margin Left">
              <input
                type="number"
                className="input-field"
                placeholder="Enter margin left"
                {...register("MarginLeft")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>{" "}
            <InputField label="Page Width">
              <input
                type="number"
                className="input-field"
                placeholder="Enter page width"
                {...register("PageWidth")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>{" "}
            <InputField label="Browser Width">
              <input
                type="number"
                className="input-field"
                placeholder="Enter browser width"
                {...register("BrowserWidth")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>{" "}
            <InputField label="Top Line">
              <input
                type="number"
                className="input-field"
                placeholder="Enter footer height"
                {...register("TopLine")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
            <InputField label="Bottom Line">
              <input
                type="number"
                className="input-field"
                placeholder="Enter footer height"
                {...register("BottomLine")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
          </div>

          {/* check boxes */}
          <div className="form-grid-4">
            <div className="flex flex-row gap-2 ">
              <input
                type="checkbox"
                className="input-checkbox mt-1"
                checked={Number(watch("PrintDateTime")) === 1}
                onChange={e =>
                  setValue("PrintDateTime", e.target.checked ? 1 : 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <label className="font-bold">Print Date Time</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input
                type="checkbox"
                className="input-checkbox mt-1"
                checked={Number(watch("PreparedBy")) === 1}
                onChange={e =>
                  setValue("PreparedBy", e.target.checked ? 1 : 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <label className="font-bold">Prepared By</label>
            </div>

            <div className="flex flex-row gap-2  ">
              <input
                type="checkbox"
                className="input-checkbox mt-1"
                checked={Number(watch("PrintedBy")) === 1}
                onChange={e =>
                  setValue("PrintedBy", e.target.checked ? 1 : 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <label className="font-bold">Printed By</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input
                type="checkbox"
                className="input-checkbox mt-1"
                checked={Number(watch("PageNumbering")) === 1}
                onChange={e =>
                  setValue("PageNumbering", e.target.checked ? 1 : 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <label className="font-bold">Page Numbering</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input
                type="checkbox"
                className="input-checkbox mt-1"
                checked={Number(watch("SendEmail")) === 1}
                onChange={e =>
                  setValue("SendEmail", e.target.checked ? 1 : 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />

              <label className="font-bold">Send Email</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input
                type="checkbox"
                className="input-checkbox mt-1"
                checked={Number(watch("SendWhatsAppMessage")) === 1}
                onChange={e =>
                  setValue("SendWhatsAppMessage", e.target.checked ? 1 : 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <label className="font-bold">Send WhatsApp Message</label>
            </div>
          </div>
        </div>

        {/* buttons */}
        <div className="form-actions-responsive mt-5">
          <button type="submit" className="save-btn" onClick={defaultSettingHandler}>
            Default Settings
          </button>
          <button type="submit" className="save-btn">
            Preview
          </button>
          <button type="submit" className="save-btn">
            {"Save"}
          </button>
          <button type="button" className="cancel-button" onClick={cancelButtonHandler}>
            Cancel
          </button>
        </div>
      </form>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default LabReportPrintSettings;
