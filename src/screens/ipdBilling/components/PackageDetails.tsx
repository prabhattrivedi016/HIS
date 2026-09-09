import InputField from "@/components/customInputField";

const PackageDetails = ({ patient }) => {
  console.log("patient", patient);
  return (
    <div className="overflow-auto">
      <div className="form-grid-4">
        <InputField label="Department">
          <input type="text" className="input-field" />
        </InputField>
        <InputField label=" Sub Department">
          <input type="text" className="input-field" />
        </InputField>
        <InputField label="Package">
          <div className="flex flex-row gap-2">
            <input type="text" className="input-field" />
            <i className="fa-solid fa-gear mt-4"></i>
          </div>
        </InputField>

        <InputField label="Applicable For">
          <select className="input-field">
            <option>--Select</option>
            <option>IPD</option>
            <option>OPD</option>
          </select>
        </InputField>
        <InputField label=" Surgical">
          <select className="input-field">
            <option>--Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </InputField>
        <InputField label=" Multiple Visit Allow">
          <select className="input-field">
            <option>--Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </InputField>
        <InputField label="Total Days ">
          <input type="text" className="input-field" />
        </InputField>
        <InputField label=" ICU Days ">
          <input type="text" className="input-field" />
        </InputField>

        <InputField label="No of Visits Included">
          <input type="text" className="input-field" />
        </InputField>

        <InputField label=" Medicine Limit Store Wise">
          <select className="input-field">
            <option>--Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </InputField>

        <InputField label="Medicine Amount">
          <input type="text" className="input-field" />
        </InputField>

        <InputField label="Consumable Amount">
          <input type="text" className="input-field" />
        </InputField>
      </div>
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-orange-500 rounded-full"></div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">Package Limits</h3>

            <p className="text-[11px] text-slate-400">Manage package-specific limits and charges</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {/* Department Wise Limit */}
          <button
            type="button"
            className="group flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all text-left"
          >
            <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100">
              <i className="fa-solid fa-building text-sm"></i>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                Department Wise
              </p>

              <p className="text-[10px] text-slate-400">Limit</p>
            </div>

            <i className="fa-solid fa-chevron-right ml-auto text-[10px] text-slate-300 group-hover:text-blue-500"></i>
          </button>

          {/* Surgery Charges */}
          <button
            type="button"
            className="group flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
          >
            <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100">
              <i className="fa-solid fa-user-doctor text-sm"></i>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                Surgery Charges
              </p>

              <p className="text-[10px] text-slate-400">Configure</p>
            </div>

            <i className="fa-solid fa-chevron-right ml-auto text-[10px] text-slate-300 group-hover:text-emerald-500"></i>
          </button>

          {/* Service Limit */}
          <button
            type="button"
            className="group flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-200 transition-all text-left"
          >
            <div className="w-9 h-9 shrink-0 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100">
              <i className="fa-solid fa-list-check text-sm"></i>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">
                Service Limit
              </p>

              <p className="text-[10px] text-slate-400">Manage</p>
            </div>

            <i className="fa-solid fa-chevron-right ml-auto text-[10px] text-slate-300 group-hover:text-purple-500"></i>
          </button>

          {/* Medicine Limit */}
          <button
            type="button"
            className="group flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-200 transition-all text-left"
          >
            <div className="w-9 h-9 shrink-0 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100">
              <i className="fa-solid fa-pills text-sm"></i>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 group-hover:text-orange-700">
                Medicine Limit
              </p>

              <p className="text-[10px] text-slate-400">Store Wise</p>
            </div>

            <i className="fa-solid fa-chevron-right ml-auto text-[10px] text-slate-300 group-hover:text-orange-500"></i>
          </button>

          {/* Item Limit */}
          <button
            type="button"
            className="group flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-cyan-50 hover:border-cyan-200 transition-all text-left"
          >
            <div className="w-9 h-9 shrink-0 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-100">
              <i className="fa-solid fa-boxes-stacked text-sm"></i>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 group-hover:text-cyan-700">
                Item Limit
              </p>

              <p className="text-[10px] text-slate-400">Configure</p>
            </div>

            <i className="fa-solid fa-chevron-right ml-auto text-[10px] text-slate-300 group-hover:text-cyan-500"></i>
          </button>
        </div>
      </section>
      <div className=" flex justify-end  m-3">
        <button className="save-btn w-40">Update</button>
      </div>
    </div>
  );
};

export default PackageDetails;
