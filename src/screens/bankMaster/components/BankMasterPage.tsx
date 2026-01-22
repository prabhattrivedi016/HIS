import InputField from "../../../components/customInputField";

const BankMasterPage = () => {
  return (
    <div className="shadow-lg m-2 p-6 rounded-lg">
      <form>
        <h2 className="mb-4 text-xl font-semibold">Bank Master</h2>

        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-1 lg:grid-cols-4 ">
          <InputField label="Bank Name" required>
            <input type="text" className="input-field" placeholder="Enter Bank Name.." />
          </InputField>
          <InputField label="Status" required>
            <select className="input-field">
              <option>Select</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </InputField>
          <div className="lg:col-span-4 flex justify-end gap-3">
            <button type="submit" className="submit-btn">
              Submit
            </button>
            <button type="button" className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default BankMasterPage;
