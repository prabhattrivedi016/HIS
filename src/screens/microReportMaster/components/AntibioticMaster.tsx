import InputField from "@/components/customInputField";

const AntibioticMaster = () => {
  return (
    <div className="mt-1">
      <div className="card mb-1">
        {/* <h2 className="card-title ">Bank Details</h2> */}

        {/* form data */}
        <form>
          <div className="form-grid-4">
            <InputField label="Antibiotic Name" required>
              <input
                className="input-field"
                placeholder="Enter antibiotic name"
                // {...register("payeeName")}
              />
              {/* {errors.payeeName && <p className="input-field-error">{errors.payeeName.message}</p>} */}
            </InputField>

            <InputField label="Antibiotic Group" required>
              <div className="flex gap-2 items-center">
                <select className="input-field">
                  <option value="">Select</option>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
                <button className="-mt-2">
                  <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
                </button>
              </div>
            </InputField>

            <InputField label="Status" required>
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

export default AntibioticMaster;
