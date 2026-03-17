import Animation from "@/components/animation";
import { BankDetailsTableHeader } from "@/constants/constants";
import { showError, showSuccess } from "@/utils/alert";
import { bankDetailsSchema } from "@/validation/bankMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { BankDetailsListItem } from "../types";
type BankDetailsFormItem = InferType<typeof bankDetailsSchema>;

const BankDetails = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [bankDetailsList, setBankDetailsList] = useState<BankDetailsListItem[]>([]);

  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bankDetailsSchema),
    defaultValues: {
      bankId: 0,
      payeeName: "",
      panNumber: "",
      bankName: "",
      bankAccountNumber: "",
      bankAddress: "",
      ifscCode: "",
      pinCode: "",
      tinNumber: "",
      isActive: 1,
    },
  });

  const bankId = watch("bankId");
  const isEditMode = Boolean(bankId);
  const buttonTitle = isEditMode ? "Update" : "Create";

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  // bank details
  const getBankDetailsList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BANK_DETAIL_LIST,
      {},
      {},
      { component: "BankDetails", silent: true }
    );

    setBankDetailsList(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) {
      getBankDetailsList();
    }
  }, [showDetails]);

  // edit handler
  const editHandler = (item: BankDetailsListItem) => {
    if (!item) {
      reset({
        bankId: 0,
        payeeName: "",
        panNumber: "",
        bankName: "",
        bankAccountNumber: "",
        bankAddress: "",
        ifscCode: "",
        pinCode: "",
        tinNumber: "",
        isActive: 1,
      });
      return;
    }
    reset({
      bankId: item?.id || 0,
      payeeName: item?.payeeName,
      panNumber: item?.panNumber,
      bankName: item?.bankName || "",
      bankAccountNumber: item?.bankAccountNumber,
      bankAddress: item?.bankAddress,
      ifscCode: item?.ifscCode,
      pinCode: item?.pinCode,
      tinNumber: item?.tinNumber,
      isActive: Number(item?.isActive ?? 1),
    });
  };

  // submit handler
  const onSubmit = async (formData: BankDetailsFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_BANK_DETAIL_MASTER,
      formData,
      {},
      { component: "BankDetails" }
    );
    if (!resp) {
      showError(error?.message ?? "Something went wrong!");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    reset({
      bankId: 0,
      payeeName: "",
      panNumber: "",
      bankName: "",
      bankAccountNumber: "",
      bankAddress: "",
      ifscCode: "",
      pinCode: "",
      tinNumber: "",
      isActive: 1,
    });

    await getBankDetailsList();
  };

  //  cancel handler
  const cancelHandler = () => {
    reset({
      bankId: 0,
      payeeName: "",
      panNumber: "",
      bankName: "",
      bankAccountNumber: "",
      bankAddress: "",
      ifscCode: "",
      pinCode: "",
      tinNumber: "",
      isActive: 1,
    });
  };

  return (
    <div className="-mt-3">
      <div className="card mb-1">
        <h2 className="card-title ">Bank Details</h2>

        {/* form data */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Payee Name" required>
              <input
                className="input-field"
                placeholder="Enter Payee Name"
                {...register("payeeName")}
              />
              {errors.payeeName && <p className="input-field-error">{errors.payeeName.message}</p>}
            </InputField>

            <InputField label="PAN Number" required>
              <input
                className="input-field"
                placeholder="Enter Pan number"
                {...register("panNumber")}
              />
              {errors.panNumber && <p className="input-field-error">{errors.panNumber.message}</p>}
            </InputField>

            <InputField label="Bank Name" required>
              <input
                className="input-field"
                placeholder="Enter bank name"
                {...register("bankName")}
              />
              {errors.bankName && <p className="input-field-error">{errors.bankName.message}</p>}
            </InputField>

            <InputField label="Bank Account Number" required>
              <input
                className="input-field"
                placeholder="Enter bank account"
                {...register("bankAccountNumber")}
              />
              {errors.bankAccountNumber && (
                <p className="input-field-error">{errors.bankAccountNumber.message}</p>
              )}
            </InputField>

            <InputField label="Bank Address" required>
              <input
                className="input-field"
                placeholder="Enter bank address"
                {...register("bankAddress")}
              />
              {errors.bankAddress && (
                <p className="input-field-error">{errors.bankAddress.message}</p>
              )}
            </InputField>

            <InputField label="IFSC Code" required>
              <input className="input-field" placeholder="Enter ifsc" {...register("ifscCode")} />
              {errors.ifscCode && <p className="input-field-error">{errors.ifscCode.message}</p>}
            </InputField>

            <InputField label="PIN Code" required>
              <input
                className="input-field"
                placeholder="Enter pin code"
                {...register("pinCode")}
                minLength={6}
                maxLength={6}
              />
              {errors.pinCode && <p className="input-field-error">{errors.pinCode.message}</p>}
            </InputField>

            <InputField label="TIN Number" required>
              <input
                className="input-field"
                placeholder="Enter tin number"
                {...register("tinNumber")}
              />
              {errors.tinNumber && <p className="input-field-error">{errors.tinNumber.message}</p>}
            </InputField>

            <InputField label="Status" required>
              <select
                className="input-field"
                required
                {...register("isActive", { valueAsNumber: true })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button " onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Bank Details List</h2>

          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-60 lg:max-h-60">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {BankDetailsTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {bankDetailsList?.length === 0 && (
                      <tr>
                        <td colSpan={BankDetailsTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {bankDetailsList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.payeeName || "-"}</td>
                        <td
                          className={`table-td ${
                            Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                        </td>
                        <td className="table-td">{item?.panNumber || "-"}</td>{" "}
                        <td className="table-td">{item?.bankName || "-"}</td>{" "}
                        <td className="table-td">{item?.bankAccountNumber || "-"}</td>{" "}
                        <td className="table-td">{item?.bankAddress || "-"}</td>{" "}
                        <td className="table-td">{item?.ifscCode || "-"}</td>
                        <td className="table-td">{item?.pinCode || "-"}</td>
                        <td className="table-td">{item?.tinNumber || "-"}</td>
                        <td className="table-td">{item?.createdBy || "-"}</td>
                        <td className="table-td">{item?.createdOn || "-"}</td>
                        <td className="table-td">{item?.lastModifiedBy || "-"}</td>
                        <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                        <td className="table-td" onClick={() => editHandler(item)}>
                          <i className="fa-solid fa-edit text-xl icon-color-button" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Animation>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default BankDetails;
