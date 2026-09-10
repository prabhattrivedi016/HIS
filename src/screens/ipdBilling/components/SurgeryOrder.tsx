import CustomDatePicker from "../../../components/customDateTimeInput/index";
import InputField from "../../../components/CustomInputField";

const SurgeryOrder = ({ patient }) => {
  console.log("patient", patient);

  // Replace these with your API data later
  const surgeryList = [];
  const surgeryChargesList = [];

  return (
    <div className="w-full space-y-3">
      {/* =========================================================
          SURGERY ORDER
      ========================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-100 text-blue-600">
              <i className="fa-solid fa-user-doctor text-sm"></i>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800">Surgery Order</h2>

              <p className="text-[11px] text-slate-400">Create and manage surgery orders</p>
            </div>
          </div>

          {/* {patient && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Patient:</span>

              <span className="font-semibold text-slate-700">
                {patient?.PatientName || patient?.PName || "-"}
              </span>
            </div>
          )} */}
        </div>

        {/* Form */}
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
            {/* Department */}
            <InputField label="Department">
              <input type="text" className="input-field" placeholder="Enter department" />
            </InputField>

            {/* Sub Department */}
            <InputField label="Sub Department">
              <input type="text" className="input-field" placeholder="Enter sub department" />
            </InputField>

            {/* Service */}
            <InputField label="Service">
              <input type="text" className="input-field" placeholder="Search service" />
            </InputField>

            {/* Main Surgery */}
            <InputField label="Main Surgery">
              <input type="text" className="input-field" placeholder="Select main surgery" />
            </InputField>

            {/* Surgery Group Rule */}
            <InputField label="Surgery Group Rule">
              <input type="text" className="input-field" placeholder="Select group rule" />
            </InputField>

            {/* Order Date */}
            <InputField label="Order Date">
              <CustomDatePicker />
            </InputField>

            {/* Add Service */}
            <div className="sm:col-span-2 lg:col-span-2 flex items-end justify-end">
              <button
                type="button"
                className="save-btn w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus text-xs"></i>
                Add Service
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SELECTED SURGERY SERVICES
      ========================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-blue-500"></div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">Selected Surgery Services</h3>

              <p className="text-[11px] text-slate-400">Review added surgery services</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
            {surgeryList.length} Services
          </span>
        </div>

        {/* Table */}
        <div className="p-3">
          <div className="table-container">
            <div className="table-scroll-wrapper overflow-x-auto">
              <div className="table-size min-w-[950px] max-h-[220px] overflow-auto">
                <table className="base-table">
                  <thead className="table-head sticky top-0 z-10">
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
                    {surgeryList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="table-empty">
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                              <i className="fa-solid fa-folder-open text-slate-400"></i>
                            </div>

                            <p className="text-xs font-medium text-slate-500">
                              No surgery services added
                            </p>

                            <p className="text-[10px] text-slate-400 mt-1">
                              Add a service from the form above
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      surgeryList.map((item, idx) => (
                        <tr key={item?.id || idx} className="table-row">
                          <td className="table-td">{idx + 1}</td>

                          <td className="table-td font-medium">{item?.surgeryName || "-"}</td>

                          <td className="table-td">{item?.surgeryGroupRule || "-"}</td>

                          <td className="table-td">{item?.main ? "Yes" : "No"}</td>

                          <td className="table-td">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            >
                              <i className="fa-solid fa-arrows-up-down-left-right text-xs"></i>
                            </button>
                          </td>

                          <td className="table-td">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                          </td>

                          <td className="table-td">{item?.doctorShare || "-"}</td>

                          <td className="table-td">{item?.surgeryComponent || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          OT DETAILS + SURGERY LINKED CHARGES
      ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* =======================================================
            OT DETAILS
        ======================================================= */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-emerald-50/70 to-white">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-hospital text-sm"></i>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">OT Details</h3>

              <p className="text-[11px] text-slate-400">Operation theatre information</p>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
              {/* OT Room */}
              <InputField label="OT Room">
                <input type="text" className="input-field" placeholder="Select OT room" />
              </InputField>

              {/* Check In */}
              <InputField label="Check In Time">
                <input type="time" className="input-field" />
              </InputField>

              {/* Check Out */}
              <InputField label="Check Out Time">
                <input type="time" className="input-field" />
              </InputField>

              {/* OT Equipment */}
              <InputField label="OT Equipments">
                <input type="text" className="input-field" placeholder="Select equipment" />
              </InputField>

              {/* Duration */}
              <InputField label="Duration">
                <input type="text" className="input-field" placeholder="HH:MM" readOnly />
              </InputField>

              {/* Duration Minutes */}
              <InputField label="Duration (Minutes)">
                <input type="number" min="0" className="input-field" placeholder="0" />
              </InputField>
            </div>
          </div>
        </section>

        {/* =======================================================
            SURGERY LINKED CHARGES
        ======================================================= */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-purple-50/70 to-white">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <i className="fa-solid fa-file-invoice-dollar text-sm"></i>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">Surgery Linked Charges</h3>

              <p className="text-[11px] text-slate-400">
                Configure charges associated with surgery
              </p>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
              {/* Anesthesia */}
              <InputField label="Anesthesia / Other Charges">
                <input type="text" className="input-field" placeholder="Select charges" />
              </InputField>

              {/* Start Time */}
              <InputField label="Start Time">
                <input type="time" className="input-field" />
              </InputField>

              {/* End Time */}
              <InputField label="End Time">
                <input type="time" className="input-field" />
              </InputField>

              {/* Billing Category */}
              <InputField label="Billing Category">
                <input type="text" className="input-field" placeholder="Select category" />
              </InputField>

              {/* Incision */}
              <InputField label="Incision">
                <select className="input-field">
                  <option value="">-- Select --</option>

                  <option value="single">Single Incision</option>

                  <option value="multiple">Multiple Incision</option>
                </select>
              </InputField>

              {/* Calculate */}
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  className="save-btn w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-calculator text-xs"></i>
                  Calculate Charges
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          SURGERY CHARGES
      ========================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-orange-50/60 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <i className="fa-solid fa-money-bill-transfer text-sm"></i>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">Surgery Charges</h3>

              <p className="text-[11px] text-slate-400">
                Detailed breakdown of surgery-linked charges
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-semibold">
            {surgeryChargesList.length} Records
          </span>
        </div>

        {/* Table */}
        <div className="p-3">
          <div className="table-container">
            <div className="table-scroll-wrapper overflow-x-auto">
              <div className="table-size min-w-[1500px] max-h-[260px] overflow-auto">
                <table className="base-table">
                  <thead className="table-head sticky top-0 z-10">
                    <tr>
                      <th className="table-th">S.No</th>
                      <th className="table-th">Surgery Name</th>
                      <th className="table-th">Resource Type</th>
                      <th className="table-th">Resource Name</th>
                      <th className="table-th">Service Charge</th>
                      <th className="table-th">Charge %</th>
                      <th className="table-th">Gross Charge Share</th>
                      <th className="table-th">Disc %</th>
                      <th className="table-th">Disc Amount</th>
                      <th className="table-th">Net Charge</th>
                      <th className="table-th">Patient Amount</th>
                      <th className="table-th">Payer Amount</th>
                      <th className="table-th">Incision Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {surgeryChargesList.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="table-empty">
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                              <i className="fa-solid fa-receipt text-slate-400"></i>
                            </div>

                            <p className="text-xs font-medium text-slate-500">
                              No surgery charges found
                            </p>

                            <p className="text-[10px] text-slate-400 mt-1">
                              Calculate charges to display the breakdown
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      surgeryChargesList.map((item, idx) => (
                        <tr key={item?.id || idx} className="table-row">
                          <td className="table-td">{idx + 1}</td>

                          <td className="table-td font-medium">{item?.surgeryName || "-"}</td>

                          <td className="table-td">{item?.resourceType || "-"}</td>

                          <td className="table-td">{item?.resourceName || "-"}</td>

                          <td className="table-td">{item?.serviceCharge || "-"}</td>

                          <td className="table-td">{item?.chargePercentage || "-"}</td>

                          <td className="table-td">{item?.grossChargeShare || "-"}</td>

                          <td className="table-td">{item?.discountPercentage || "-"}</td>

                          <td className="table-td">{item?.discountAmount || "-"}</td>

                          <td className="table-td font-semibold">{item?.netCharge || "-"}</td>

                          <td className="table-td">{item?.patientAmount || "-"}</td>

                          <td className="table-td">{item?.payerAmount || "-"}</td>

                          <td className="table-td">{item?.incisionTime || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {surgeryChargesList.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
              <div>
                <span className="text-slate-400">Patient Amount</span>

                <span className="ml-2 font-bold text-slate-700">₹0.00</span>
              </div>

              <div>
                <span className="text-slate-400">Payer Amount</span>

                <span className="ml-2 font-bold text-slate-700">₹0.00</span>
              </div>

              <div>
                <span className="text-slate-400">Net Charge</span>

                <span className="ml-2 font-bold text-blue-600">₹0.00</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          BOTTOM ACTIONS
      ========================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
        <button type="button" className="save-btn flex items-center justify-center gap-2">
          Save Surgery Order
        </button>
      </div>
    </div>
  );
};

export default SurgeryOrder;
