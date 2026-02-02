import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import { BankMasterTableHeader } from "../../../constants/constants";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { BankItem } from "../types";

const BankMasterPage = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [bankLists, setBankLists] = useState<BankItem[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    bankId: 0,
    bankName: "",
    isActive: "",
  });

  const buttonTitle = formData?.bankName ? "Update" : "Save";

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === "isActive" ? Number(value) : value,
    }));
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.bankName.trim()) return;
    if (formData.isActive === "") return;

    await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_BANK_MASTER, {
      bankId: formData.bankId || 0,
      bankName: formData.bankName,
      isActive: Number(formData.isActive),
    });

    resetForm();
    getBankLists();
  };

  const resetForm = () => {
    setFormData({
      bankId: 0,
      bankName: "",
      isActive: "",
    });

    setIsSubmitting(false);
  };

  const editHandler = (item: BankItem) => {
    setFormData({
      bankId: item?.bankId,
      bankName: item?.bankName,
      isActive: item?.isActive,
    });

    setIsSubmitting(false);
  };

  const showDetailPopUpHandler = () => {
    setShowDetails(prev => !prev);
  };

  const getBankLists = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_BANK_LIST);
    setBankLists(resp?.data ?? []);
  };

  useEffect(() => {
    getBankLists();
  }, []);

  return (
    <>
      <div className="shadow-lg m-2 p-6 rounded-lg">
        <h2 className="mb-4 text-xl font-semibold">Bank Master</h2>
        <form onSubmit={submitHandler}>
          <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-1 lg:grid-cols-4 ">
            <InputField label="Bank Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter Bank Name.."
                name="bankName"
                value={formData?.bankName}
                onChange={inputHandler}
              />
              {!!isSubmitting && !formData?.bankName ? (
                <p className="input-field-error">Bank Name is required</p>
              ) : (
                <></>
              )}
            </InputField>
            <InputField label="Status" required>
              <select
                className="input-field"
                name="isActive"
                onChange={inputHandler}
                value={formData?.isActive}
              >
                <option value="">Select</option>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {!!isSubmitting && !formData?.isActive ? (
                <p className="input-field-error">Status is required</p>
              ) : (
                <></>
              )}
            </InputField>
            <div className="flex justify-end gap-3 mt-6  col-start-4">
              <button type="submit" className="bg-[#0b5394] rounded-lg text-white min-w-20 h-10">
                {buttonTitle}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="shadow-lg m-2 p-6 rounded-lg bg-white overflow-hidden ">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold -mt-6">Bank Master List</h2>

          <button
            className="-mt-5"
            // className="border border-gray-500 bg-[#1e6da1] rounded-lg text-white px-4 py-2 active:scale-95"
            onClick={showDetailPopUpHandler}
          >
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
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
                        {BankMasterTableHeader.map((h, index) => (
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
                      {bankLists.map((item, idx) => (
                        <tr
                          key={item?.bankId}
                          className="hover:bg-gray-150 transition last:border-none"
                        >
                          <td className="px-2 py-3 text-gray-500">{idx + 1}</td>

                          <td className="px-1 py-3 text-gray-500">{item?.bankName}</td>

                          <td className="px-1 py-3 text-gray-500 ">
                            {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                          </td>

                          <td className="px-2 py-3 text-gray-500 ">{item?.createdBy}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.createdOn}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.lastModifiedBy}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.lastModifiedOn}</td>

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
export default BankMasterPage;
