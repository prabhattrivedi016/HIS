import InputField from "@/components/customInputField";

const OrganismAntibioticMapping = () => {
  return (
    <div className="mt-1">
      <div className="card mb-1">
        {/* <h2 className="card-title ">Bank Details</h2> */}

        {/* form data */}
        <form>
          <div className="form-grid-4">
            <InputField label="Organism" required>
              <input
                className="input-field"
                placeholder="Enter organism name"
                // {...register("payeeName")}
              />
              {/* {errors.payeeName && <p className="input-field-error">{errors.payeeName.message}</p>} */}
            </InputField>

            <InputField label="Antibiotic " required>
              <select className="input-field">
                <option value="">Select</option>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>

            <InputField label="Antibiotic Class" required>
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

export default OrganismAntibioticMapping;
