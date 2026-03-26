import InputField from "@/components/customInputField";
import { useFormContext } from "react-hook-form";

const PatientMaritalStatus = () => {
  const { register } = useFormContext();

  return (
    <div className="form-grid-3 card -mt-3">
      <InputField label="Marital Status">
        <select className="input-field" {...register("MaritalStatus")}>
          <option value="">Select</option>
          <option value={"UN-MARRIED"}>Un-Married</option>
          <option value={"MARRIED"}>Married</option>
        </select>
      </InputField>
      <InputField label="Relation">
        <input type="text" className="input-field" {...register("Relation")} />
      </InputField>
      <InputField label="Relative Name">
        <input
          type="text"
          className="input-field"
          placeholder="Enter relative name"
          {...register("RelativeName")}
        />
      </InputField>
    </div>
  );
};

export default PatientMaritalStatus;
