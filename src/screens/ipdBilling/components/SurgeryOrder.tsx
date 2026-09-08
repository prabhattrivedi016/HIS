import CustomDatePicker from "../../../components/customDateTimeInput/index";
import InputField from "../../../components/CustomInputField";

const SurgeryOrder = ({ patient }) => {
  return (
    <div className="w-full">
      {/* ================= Surgery Order ================= */}
      <div className="form-grid-4">
        <InputField label="Department">
          <input className="input-field" />
        </InputField>

        <InputField label="Sub Department">
          <input className="input-field" />
        </InputField>

        <InputField label="Service">
          <input className="input-field" />
        </InputField>

        <InputField label="Main Surgery">
          <input className="input-field" />
        </InputField>

        <InputField label="Surgery Group Rule">
          <input className="input-field" />
        </InputField>

        <InputField label="Order Date">
          <CustomDatePicker />
        </InputField>

        {/* Add Service */}
        <div className="flex items-end justify-end lg:col-start-4">
          <button className="save-btn w-full sm:w-auto">Add Service</button>
        </div>
      </div>

      {/* ================= Table ================= */}
      <div className="table-container mt-2">
        <div className="table-scroll-wrapper overflow-x-auto">
          <div className="table-size min-w-[900px] lg:min-h-50 lg:max-h-50">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">S.No</th>
                  <th className="table-th">Surgery Name</th>
                  <th className="table-th">Surgery Group Rule</th>
                  <th className="table-th">Main</th>
                  <th className="table-th">Move</th>
                  <th className="table-th">Remove</th>
                  <th className="table-th">Doctor Share</th>
                  <th className="table-th">Surgery Component</th>
                </tr>
              </thead>

              <tbody>
                {[].length === 0 && (
                  <tr>
                    <td colSpan={8} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {[].map((item, idx) => (
                  <tr key={item?.bankId} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.bankName || "-"}</td>

                    <td className="table-td">
                      {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                    </td>

                    <td className="table-td">{item?.createdBy || "-"}</td>

                    <td className="table-td">{item?.createdOn || "-"}</td>

                    <td className="table-td">{item?.lastModifiedBy || "-"}</td>

                    <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= OT + Surgery Charges ================= */}
      <div className="w-full flex flex-col lg:flex-row gap-2 mt-1">
        {/* ================= OT Details ================= */}
        <div className="w-full lg:w-[50%] card">
          <h3 className="ipd-billing-text">OT Details</h3>

          <div className="form-grid-3">
            <InputField label="OT Room">
              <input className="input-field" />
            </InputField>

            <InputField label="CheckIn Time">
              <input className="input-field" />
            </InputField>

            <InputField label="CheckOut Time">
              <input className="input-field" />
            </InputField>

            <InputField label="OT Equipments">
              <input className="input-field" />
            </InputField>

            <InputField label="Duration">
              <input className="input-field" />
            </InputField>

            <InputField label="Duration (Minutes)">
              <input className="input-field" />
            </InputField>
          </div>
        </div>

        {/* ================= Surgery Linked Charges ================= */}
        <div className="w-full lg:w-[50%] card">
          <h3 className="ipd-billing-text">Surgery linked charges</h3>

          <div className="form-grid-3">
            <InputField label="Anesthesia / Other Charges">
              <input className="input-field" />
            </InputField>

            <InputField label="Start Time">
              <input className="input-field" />
            </InputField>

            <InputField label="End Time">
              <input className="input-field" />
            </InputField>

            <InputField label="Billing Category">
              <input className="input-field" />
            </InputField>

            <InputField label="Incision">
              <select className="input-field">
                <option>Single Incision</option>
                <option>Multiple Incision</option>
              </select>
            </InputField>

            {/* Calculate Charges */}
            <div className="flex items-end justify-end lg:col-start-3">
              <button className="save-btn w-full sm:w-auto">Calculate Charges</button>
            </div>
          </div>
        </div>
      </div>

      {/* final table  */}
      <div className="table-container mt-2">
        <div className="table-scroll-wrapper overflow-x-auto">
          <div className="table-size min-w-[900px] lg:min-h-50 lg:max-h-50">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">S.No</th>
                  <th className="table-th">Surgery Name</th>
                  <th className="table-th">Resource Type</th>
                  <th className="table-th">Resource Name</th>
                  <th className="table-th">Service Charge</th>
                  <th className="table-th">Charge %</th>
                  <th className="table-th">Gross Charge Share</th>
                  <th className="table-th">Disc % </th>
                  <th className="table-th">Disc Amount</th>
                  <th className="table-th">Net Charge</th>
                  <th className="table-th">Patient Amount</th>
                  <th className="table-th">Payer Amount</th>
                  <th className="table-th">Incision Time</th>
                </tr>
              </thead>

              <tbody>
                {[].length === 0 && (
                  <tr>
                    <td colSpan={13} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {[].map((item, idx) => (
                  <tr key={item?.bankId} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.bankName || "-"}</td>

                    <td className="table-td">
                      {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                    </td>

                    <td className="table-td">{item?.createdBy || "-"}</td>

                    <td className="table-td">{item?.createdOn || "-"}</td>

                    <td className="table-td">{item?.lastModifiedBy || "-"}</td>

                    <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurgeryOrder;
