import InputField from "@/components/customInputField";

const ImportTariffsDownload = () => {
  return (
    <div className="card -mt-3">
      <h2 className="card-title ">Import Tariff Details</h2>

      <form>
        <div className="form-grid-4">
          <InputField label="Rate List" required>
            <input type="text" className="input-field" placeholder="Enter contact number " />
          </InputField>

          <InputField label="Type" required>
            <input type="text" className="input-field" placeholder="Enter contact number " />
          </InputField>

          <InputField label="Category" required>
            <input type="text" className="input-field" placeholder="Enter contact number " />
          </InputField>

          <InputField label="Sub Category" required>
            <input type="text" className="input-field" placeholder="Enter contact number " />
          </InputField>

          <InputField label="Sub Sub Category" required>
            <input type="text" className="input-field" placeholder="Enter contact number " />
          </InputField>
        </div>

        <div className="form-actions-responsive mt-5">
          <button type="submit" className="save-btn">
            DownLoad Tariffs
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImportTariffsDownload;
