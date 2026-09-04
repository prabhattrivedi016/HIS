import InputField from "@/components/customInputField";

const QrCodeBarCode = () => {
  return (
    <div className="-mt-3">
      <form>
        {/* QR Code */}
        <div className="card mb-1">
          <h2 className="card-title ">QR Code</h2>

          <div className="form-grid-4">
            <InputField label="X-Axis QR Code (Horizontal Move)" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Y-Axis QR Code (Vertical move)" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="QR Height" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="QR Width" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="QR Position" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" required>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>
          </div>
        </div>

        {/* barcode */}

        <div className="card ">
          <h2 className="card-title ">Bar Code</h2>

          <div className="form-grid-4">
            <InputField label="X-Axis Barcode (Horizontal move)" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Y-Axis Barcode (Vertical move)" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Barcode Height" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Barcode Width" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Barcode Position" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                // {...register("vendorName")}
              />
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" required>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {/* {errors.vendorName && <p className="input-field-error">{errors.vendorName.message}</p>} */}
            </InputField>

            <div className="flex flex-row gap-2 mt-8">
              <label className="font-bold">Rotate Barcode 90 Degree</label>
              <input type="checkbox" className="input-checkbox mt-1" />
            </div>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              Update
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QrCodeBarCode;

/*
 */
