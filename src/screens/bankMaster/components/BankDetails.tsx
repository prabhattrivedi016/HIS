import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import { BankDetailsTableHeader } from "../../../constants/constants";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { BankDetailsList } from "../types";

const BankDetails = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [bankDetailsList, setBankDetailsList] = useState<BankDetailsList[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [bankForm, setBankForm] = useState({
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

  const buttonTitle = Number(bankForm.bankId) > 0 ? "Update" : "Save";

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setBankForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildPayload = () => ({
    bankId: bankForm.bankId,
    payeeName: bankForm.payeeName,
    panNumber: bankForm.panNumber,
    bankName: bankForm.bankName,
    bankAccountNumber: bankForm.bankAccountNumber,
    bankAddress: bankForm.bankAddress,
    ifscCode: bankForm.ifscCode,
    pinCode: bankForm.pinCode,
    tinNumber: bankForm.tinNumber,
    isActive: Number(bankForm.isActive),
  });

  const showDetailPopUpHandler = () => {
    setShowDetails(prev => !prev);
  };

  const resetForm = () => {
    setBankForm({
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

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!bankForm?.payeeName) return;
    try {
      const payload = buildPayload();

      const resp = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_BANK_DETAIL_MASTER, payload);
      console.log("resp", resp);

      resetForm();
      getBankDetailsList();
    } catch (error) {
      console.error("Error while submitting Bank details form", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBankDetailsList = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_BANK_DETAIL_LIST, {}, {});

    setBankDetailsList(resp?.data ?? []);
  };

  useEffect(() => {
    getBankDetailsList();
  }, []);

  /*-------------------------edit handler------------------------ */
  const editHandler = (item: BankDetailsList) => {
    setBankForm({
      bankId: Number(item?.id),
      payeeName: item?.payeeName,
      panNumber: item?.panNumber,
      bankName: item?.bankName,
      bankAccountNumber: item?.bankAccountNumber,
      bankAddress: item?.bankAddress,
      ifscCode: item?.ifscCode,
      pinCode: item?.pinCode,
      tinNumber: item?.tinNumber,
      isActive: item?.isActive,
    });
  };

  return (
    <>
      <div className="shadow-lg m-2 p-6 rounded-lg bg-white">
        <h2 className="mb-4 text-xl font-semibold">Bank Details</h2>

        <form onSubmit={submitHandler}>
          <div className="form-grid-4">
            <InputField label="Payee Name" required>
              <input
                className="input-field"
                name="payeeName"
                value={bankForm.payeeName}
                onChange={inputHandler}
                placeholder="Enter Payee Name"
              />
              {!!isSubmitting && !bankForm?.payeeName && (
                <p className="input-field-error">Payee Name is required</p>
              )}
            </InputField>

            <InputField label="PAN Number" required>
              <input
                className="input-field"
                name="panNumber"
                value={bankForm.panNumber}
                onChange={inputHandler}
                placeholder="Enter Pan number"
              />
              {!!isSubmitting && !bankForm?.panNumber && (
                <p className="input-field-error">PAN is required</p>
              )}
            </InputField>

            <InputField label="Bank Name" required>
              <input
                className="input-field"
                name="bankName"
                value={bankForm.bankName}
                onChange={inputHandler}
                placeholder="Enter bank name"
              />
              {!!isSubmitting && !bankForm?.bankName && (
                <p className="input-field-error">Bank Name is required</p>
              )}
            </InputField>

            <InputField label="Bank Account Number" required>
              <input
                className="input-field"
                name="bankAccountNumber"
                value={bankForm.bankAccountNumber}
                onChange={inputHandler}
                placeholder="Enter bank account"
              />
              {!!isSubmitting && !bankForm?.bankAccountNumber && (
                <p className="input-field-error">Bank Account is required</p>
              )}
            </InputField>

            <InputField label="Bank Address" required>
              <input
                className="input-field"
                name="bankAddress"
                value={bankForm.bankAddress}
                onChange={inputHandler}
                placeholder="Enter bank address"
              />
              {!!isSubmitting && !bankForm?.bankAddress && (
                <p className="input-field-error">Bank Address is required</p>
              )}
            </InputField>

            <InputField label="IFSC Code" required>
              <input
                className="input-field"
                name="ifscCode"
                value={bankForm.ifscCode}
                onChange={inputHandler}
                placeholder="Enter ifsc"
              />
              {!!isSubmitting && !bankForm?.ifscCode && (
                <p className="input-field-error">IFSC is required</p>
              )}
            </InputField>

            <InputField label="PIN Code" required>
              <input
                className="input-field"
                name="pinCode"
                value={bankForm.pinCode}
                onChange={inputHandler}
                placeholder="Enter pin code"
              />
              {!!isSubmitting && !bankForm?.pinCode && (
                <p className="input-field-error">PIN is required</p>
              )}
            </InputField>

            <InputField label="TIN Number" required>
              <input
                className="input-field"
                name="tinNumber"
                value={bankForm.tinNumber}
                onChange={inputHandler}
                placeholder="Enter TIN number"
              />
              {!!isSubmitting && !bankForm?.tinNumber && (
                <p className="input-field-error">TIN is required</p>
              )}
            </InputField>

            <InputField label="Status" required>
              <select
                className="input-field"
                name="isActive"
                value={bankForm.isActive}
                onChange={inputHandler}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>

            <div className="flex justify-end gap-3 mt-6  col-start-4">
              <button type="submit" className="bg-[#0b5394] rounded-lg text-white min-w-20 h-10">
                {buttonTitle}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="shadow-lg m-2 p-6 rounded-lg bg-white overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Bank Details List</h2>

          <button
            className="border border-gray-500 bg-[#1e6da1] rounded-lg text-white px-4 py-2 active:scale-95"
            onClick={showDetailPopUpHandler}
          >
            {showDetails ? "Hide" : "Show"}
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="max-w-290 w-full   rounded-xl shadow-lg border border-gray-200 mt-4 overflow-hidden bg-white">
                <div className="max-h-80 overflow-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-[#f5f9ff] sticky top-0 z-10 ">
                      <tr>
                        {BankDetailsTableHeader.map((h, index) => (
                          <th
                            key={index}
                            className="px-2 py-3 text-left font-semibold text-gray-900 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {bankDetailsList.map((item, idx) => (
                        <tr
                          key={item?.id}
                          className="hover:bg-gray-150 transition last:border-none"
                        >
                          <td className="px-2 py-3 text-gray-500">{idx + 1}</td>

                          <td className="px-1 py-3 text-gray-500">{item?.payeeName}</td>

                          <td className="px-1 py-3 text-gray-500">{item?.panNumber}</td>

                          <td className="px-1 py-3 text-gray-500">{item?.bankName}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.bankAccountNumber}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.bankAddress}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.ifscCode}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.pinCode}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.tinNumber}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.createdBy}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.createdOn}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.lastModifiedBy}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.lastModifiedOn}</td>

                          <td className="px-1 py-3 text-gray-500 ">
                            {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                          </td>

                          <td
                            className="px-2 py-3 text-blue-500 active:scale-90"
                            onClick={() => editHandler(item)}
                          >
                            <i className="fa-edit fa-solid fa-xl"></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? <CustomLoader isLoading={loading} /> : <></>}
      </div>
    </>
  );
};

export default BankDetails;
