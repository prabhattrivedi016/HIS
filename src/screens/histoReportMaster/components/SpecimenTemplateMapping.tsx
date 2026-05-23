import InputField from "../../../components/customInputField";

const SpecimenTemplateMapping = () => {
  return (
    <div className="mt-1">
      <div className="card mb-1">
        {/* <h2 className="card-title ">Bank Details</h2> */}

        {/* form data */}
        <form>
          <div className="form-grid-4">
            <InputField label="Specimen Name" required>
              <input
                className="input-field"
                placeholder="Enter specimen name"
                // {...register("payeeName")}
              />
              {/* {errors.payeeName && <p className="input-field-error">{errors.payeeName.message}</p>} */}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>

            <InputField label="Gross Template" required>
              <select className="input-field">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>

            <InputField label="Microscopic Template" required>
              <select className="input-field">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>

            <InputField label="Impression Template" required>
              <select className="input-field">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecimenTemplateMapping;
