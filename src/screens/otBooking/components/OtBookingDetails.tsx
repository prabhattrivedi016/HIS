import InputField from "@/components/customInputField";

const OtBookingDetails = () => {
  return (
    <div className="card">
      {/* case details */}
      <div className=" w-full mb-1 border-2 border-gray-200 p-1 rounded-lg">
        <div className="flex gap-2 justify-between">
          <h1 className="font-bold text-lg -mt-1 p-1">Case Details & Provisional Diagnosis</h1>
          {/* check box */}
          <div className="flex gap-2 -mt-1 ">
            <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="input-checkbox" />

                <span className="font-semibold">Blood Required</span>
              </label>
            </div>
            <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="input-checkbox" />

                <span className="font-semibold">Ventilator Required</span>
              </label>
            </div>

            <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="input-checkbox" />

                <span className="font-semibold">ICU Required</span>
              </label>
            </div>

            <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="input-checkbox" />

                <span className="font-semibold">Infectious Case</span>
              </label>
            </div>
            <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="input-checkbox" />

                <span className="font-semibold">Under package</span>
              </label>
            </div>
          </div>
        </div>

        {/* input field */}
        <div className="form-grid-4 m-2">
          <InputField label="IPD Number">
            <input className="input-field" />
          </InputField>
          <InputField label="Admission Date">
            <input className="input-field" />
          </InputField>
          <InputField label="Blood Group">
            <input className="input-field" />
          </InputField>

          <InputField label="No of blood Unit">
            <input className="input-field" />
          </InputField>

          <InputField label="OT Type">
            <select className="input-field">
              <option value={0}>--Select--</option>
              <option value={1}>Elective</option>
              <option value={2}>Emergency</option>
            </select>
          </InputField>

          <InputField label="Infectious Remarks">
            <input className="input-field" />
          </InputField>
          <InputField label="Diagnosis">
            <input className="input-field" />
          </InputField>
        </div>
      </div>

      {/* theature details and surgery details */}
      <div className="w-full border-2 border-gray-200  rounded-lg p-1">
        <div className="flex gap-2 justify-between">
          <h1 className="font-bold text-lg mb-1 p-1">Theater Details & Surgery Details</h1>
          <div className="flex items-center gap-6 m-2">
            {/* <span className="bg-yellow-300 px-1 rounded-sm font-semibold">Infectious Case</span> */}

            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="infectiousCase" value="yes" className="h-4 w-4" />
              <span className="font-bold">Package</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="infectiousCase" value="no" className="h-4 w-4" />
              <span className="font-bold">Surgery</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="infectiousCase" value="no" className="h-4 w-4" />
              <span className="font-bold">Procedure</span>
            </label>
          </div>
        </div>
        <div className="form-grid-4 ">
          <InputField label="Theater">
            <input className="input-field" />
          </InputField>
          <InputField label="Date">
            <input className="input-field" />
          </InputField>
          <InputField label="Start Time">
            <input className="input-field" />
          </InputField>
          <InputField label="End Time">
            <input className="input-field" />
          </InputField>
          <InputField label="Equipment Required">
            <input className="input-field" />
          </InputField>
          <InputField label="Department">
            <input className="input-field" />
          </InputField>
          <InputField label="Sub Department">
            <input className="input-field" />
          </InputField>
          <InputField label="Surgery/Procedure">
            <input className="input-field" />
          </InputField>
        </div>
      </div>

      {/* surgeon details and other resources */}
      <div className="w-full border-2 border-gray-200  rounded-lg  mt-1 p-1">
        <h1 className="font-bold text-lg">Surgeon Details & Other Resources</h1>
        <div className="form-grid-4 m-2">
          <InputField label="Surgeon">
            <input className="input-field" />
          </InputField>
          <InputField label="Anesthetist">
            <input className="input-field" />
          </InputField>
          <InputField label="Asst Surgeon 1">
            <input className="input-field" />
          </InputField>
          <InputField label="Asst Surgeon 2">
            <input className="input-field" />
          </InputField>
          <InputField label="Asst Anesthetist ">
            <input className="input-field" />
          </InputField>
          <InputField label=" Anesthesia ">
            <input className="input-field" />
          </InputField>
          <InputField label="Perfusionist">
            <input className="input-field" />
          </InputField>
          <InputField label="Scrub Nurse(s)">
            <input className="input-field" />
          </InputField>
          <InputField label="Circulating Nurse(s)">
            <input className="input-field" />
          </InputField>
          <InputField label="OT Technician">
            <input className="input-field" />
          </InputField>
          <InputField label="OT Equipments">
            <input className="input-field" />
          </InputField>
          <InputField label="AT Technician">
            <input className="input-field" />
          </InputField>
        </div>
      </div>
    </div>
  );
};

export default OtBookingDetails;
