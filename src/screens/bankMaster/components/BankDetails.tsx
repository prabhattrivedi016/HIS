import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import InputField from "../../../components/customInputField";
import { BankDetailsTableHeader } from "../../../constants/constants";

const BankDetails = () => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const showDetailPopUpHandler = () => {
    setShowDetails(prev => !prev);
  };

  const bankDetailsTableData = [
    {
      id: 1,
      payeeName: "Rahul Sharma",
      panNumber: "ABCDE1234F",
      bankName: "HDFC Bank",
      accountNumber: "123456789012",
      bankAddress: "Connaught Place, New Delhi",
      ifscCode: "HDFC0000456",
      pinCode: "110001",
      tinNo: "TIN9876543",
      createdBy: "Admin",
      createdOn: "2025-01-10",
      status: "Active",
    },
    {
      id: 2,
      payeeName: "Amit Verma",
      panNumber: "PQRSX5678L",
      bankName: "State Bank of India",
      accountNumber: "987654321098",
      bankAddress: "Alambagh, Lucknow",
      ifscCode: "SBIN0001234",
      pinCode: "226005",
      tinNo: "TIN1234567",
      createdBy: "Manager",
      createdOn: "2025-01-18",
      status: "Inactive",
    },
    {
      id: 3,
      payeeName: "Amit Verma",
      panNumber: "PQRSX5678L",
      bankName: "State Bank of India",
      accountNumber: "987654321098",
      bankAddress: "Alambagh, Lucknow",
      ifscCode: "SBIN0001234",
      pinCode: "226005",
      tinNo: "TIN1234567",
      createdBy: "Manager",
      createdOn: "2025-01-18",
      status: "Inactive",
    },
    {
      id: 4,
      payeeName: "Amit Verma",
      panNumber: "PQRSX5678L",
      bankName: "State Bank of India",
      accountNumber: "987654321098",
      bankAddress: "Alambagh, Lucknow",
      ifscCode: "SBIN0001234",
      pinCode: "226005",
      tinNo: "TIN1234567",
      createdBy: "Manager",
      createdOn: "2025-01-18",
      status: "Inactive",
    },
    {
      id: 5,
      payeeName: "Amit Verma",
      panNumber: "PQRSX5678L",
      bankName: "State Bank of India",
      accountNumber: "987654321098",
      bankAddress: "Alambagh, Lucknow",
      ifscCode: "SBIN0001234",
      pinCode: "226005",
      tinNo: "TIN1234567",
      createdBy: "Manager",
      createdOn: "2025-01-18",
      status: "Inactive",
    },
    {
      id: 6,
      payeeName: "Amit Verma",
      panNumber: "PQRSX5678L",
      bankName: "State Bank of India",
      accountNumber: "987654321098",
      bankAddress: "Alambagh, Lucknow",
      ifscCode: "SBIN0001234",
      pinCode: "226005",
      tinNo: "TIN1234567",
      createdBy: "Manager",
      createdOn: "2025-01-18",
      status: "Inactive",
    },
  ];

  return (
    <>
      <div className="shadow-lg m-2 p-6 rounded-lg bg-white">
        <h2 className="mb-4 text-xl font-semibold">Bank Details</h2>

        <form>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InputField label="Payee Name" required>
              <input className="input-field" placeholder="Enter Payee Name" />
            </InputField>

            <InputField label="PAN Number" required>
              <input className="input-field" placeholder="Enter PAN Number" />
            </InputField>

            <InputField label="Bank Name" required>
              <input className="input-field" placeholder="Enter Bank Name" />
            </InputField>

            <InputField label="Bank Account Number" required>
              <input className="input-field" placeholder="Enter Account Number" />
            </InputField>

            <InputField label="Bank Address" required>
              <input className="input-field" placeholder="Enter Bank Address" />
            </InputField>

            <InputField label="IFSC Code" required>
              <input className="input-field" placeholder="Enter IFSC Code" />
            </InputField>

            <InputField label="PIN Code" required>
              <input className="input-field" placeholder="Enter PIN Code" />
            </InputField>

            <InputField label="TIN Number" required>
              <input className="input-field" placeholder="Enter TIN Number" />
            </InputField>

            <InputField label="Status" required>
              <select className="input-field">
                <option>Select</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </InputField>

            <div className="lg:col-span-4 flex flex-col sm:flex-row justify-end gap-3 mt-4">
              <button type="submit" className="submit-btn w-full sm:w-auto">
                Submit
              </button>
              <button type="button" className="cancel-btn w-full sm:w-auto">
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="shadow-lg m-2 p-6 rounded-lg bg-white overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Bank Detail List</h2>

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
              <div className="max-w-[1150px]  max-h-[250px] w-full overflow-x-auto border rounded-md mt-4">
                <table className="min-w-max border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      {BankDetailsTableHeader.map((h, index) => (
                        <th key={index} className="border-b px-4 py-2 text-left whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {bankDetailsTableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border-b px-4 py-2">{idx + 1}</td>

                        <td className="border-b px-4 py-2">{item.payeeName}</td>

                        <td className="border-b px-4 py-2">{item.panNumber}</td>

                        <td className="border-b px-4 py-2">{item.bankName}</td>

                        <td className="border-b px-4 py-2">{item.accountNumber}</td>

                        <td className="border-b px-4 py-2">{item.accountNumber}</td>
                        <td className="border-b px-4 py-2">{item.accountNumber}</td>
                        <td className="border-b px-4 py-2">{item.accountNumber}</td>
                        <td className="border-b px-4 py-2">{item.accountNumber}</td>
                        <td className="border-b px-4 py-2">{item.accountNumber}</td>
                        <td className="border-b px-4 py-2">{item.accountNumber}</td>
                        <td className="border-b px-4 py-2">{item.accountNumber}</td>
                        <td className="border-b px-4 py-2">{item.accountNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BankDetails;
