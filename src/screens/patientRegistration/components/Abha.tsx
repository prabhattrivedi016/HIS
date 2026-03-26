import InputField from "@/components/customInputField";
import { useFormContext } from "react-hook-form";

const Abha = () => {
  const { register } = useFormContext();

  return (
    <div className="form-grid-3 card -mt-3">
      <InputField label="ABHA No">
        <input
          type="text"
          className="input-field"
          placeholder="Enter abha number"
          {...register("HealthIdNumber")}
        />
      </InputField>
      <InputField label="ABHA address">
        <input
          type="text"
          className="input-field"
          placeholder="Enter abha address"
          {...register("HealthId")}
        />
      </InputField>
    </div>
  );
};

export default Abha;
