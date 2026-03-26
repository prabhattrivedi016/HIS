import InputField from "@/components/customInputField";
import { useFormContext } from "react-hook-form";

const SearchPatient = () => {
  const { register } = useFormContext();

  return (
    <div className="form-grid-3 card">
      <InputField label="UHID / Barcode">
        <input
          className="input-field"
          placeholder="Enter UHID No and Press Enter to search"
          {...register("UhidOrBarcode")}
        />
      </InputField>

      <InputField label="Search By">
        <select className="input-field" {...register("SearchBy")}>
          <option value="">Select</option>
          <option value="PatientId">Patient Id</option>
          <option value="UHID">UHID</option>
          <option value="ContactNumber">Contact Number</option>
          <option value="BranchId">Branch Id</option>
        </select>
      </InputField>

      <InputField label="Search Value">
        <input
          className="input-field"
          placeholder="Enter Search Value and Press Enter to search"
          {...register("SearchValue")}
        />
      </InputField>
    </div>
  );
};

export default SearchPatient;
