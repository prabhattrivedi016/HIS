import InputField from "@/components/customInputField";

const SampleRejection = () => {
  return (
    <div className="-mt-3">
      <div className="card ">
        <h2 className="card-title ">Sample Rejection Details</h2>

        <form>
          <div className="form-grid-4">
            <InputField label="Sample Rejection Remarks Name" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Status" required>
              {/* <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              /> */}
              <select className="input-field" required>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {"Save"}
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

export default SampleRejection;
