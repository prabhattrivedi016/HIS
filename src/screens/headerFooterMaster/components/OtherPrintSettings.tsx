import InputField from "@/components/customInputField";

const OtherPrintSettings = () => {
  return (
    <div className="-mt-3">
      <div className="card ">
        <h2 className="card-title ">Report Footer Details</h2>

        <form>
          <div className="form-grid-4">
            <InputField label="Header Height" required>
              <input
                className="input-field"
                placeholder="Enter header height"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label=" Footer Height" required>
              <input
                className="input-field"
                placeholder="Enter footer height"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Default NABL Logo Path" required>
              <input
                className="input-field"
                placeholder="Enter default NABL logo path"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
          </div>
          <div className="form-grid-4">
            <div className="flex flex-row gap-2 ">
              <input type="checkbox" className="input-checkbox mt-1" />
              <label className="font-bold">Print Date Time</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input type="checkbox" className="input-checkbox mt-1" />
              <label className="font-bold">Prepared By</label>
            </div>

            <div className="flex flex-row gap-2  ">
              <input type="checkbox" className="input-checkbox mt-1 " />
              <label className="font-bold">Printed By</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input type="checkbox" className="input-checkbox mt-1" />
              <label className="font-bold">Page Numbering</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input type="checkbox" className="input-checkbox " />
              <label className="font-bold -mt-1">Doctor Signature</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input type="checkbox" className="input-checkbox mt-1 " />
              <label className="font-bold">Test Name for Single Test</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input type="checkbox" className="input-checkbox mt-1" />
              <label className="font-bold">Print Department Separate</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input type="checkbox" className="input-checkbox mt-1 " />
              <label className="font-bold">Send Email</label>
            </div>

            <div className="flex flex-row gap-2 ">
              <input type="checkbox" className="input-checkbox mt-1" />
              <label className="font-bold">Send WhatsApp Message</label>
            </div>
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

export default OtherPrintSettings;
