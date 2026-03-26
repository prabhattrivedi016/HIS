import InputField from "@/components/customInputField";
import { useFormContext } from "react-hook-form";

const ContactAndIdProof = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="form-grid-3 card -mt-3">
      <InputField label="Aadhar Number">
        <input type="text" className="input-field" placeholder="Enter aadhar number" />
      </InputField>
      <InputField label="ID Proof Type">
        <input type="text" className="input-field" {...register("IdProofName")} />
      </InputField>
      <InputField label="ID proof number">
        <input
          type="text"
          className="input-field"
          placeholder="Enter id proof number"
          {...register("IdProofNumber")}
        />
      </InputField>
      <InputField label="Contact No (self)" required>
        <input
          type="text"
          className="input-field"
          placeholder="Enter contact no"
          maxLength={10}
          inputMode="numeric"
          {...register("SelfContactNumber", {
            onChange: e => {
              e.target.value = e.target.value.replace(/\D/g, "");
            },
          })}
        />
        {errors.SelfContactNumber && (
          <p className="input-field-error">{String(errors.SelfContactNumber.message)}</p>
        )}
      </InputField>
      <InputField label="Emergency contact no">
        <input
          type="text"
          className="input-field"
          placeholder="Enter emergency contact"
          maxLength={10}
          inputMode="numeric"
          {...register("EmergencyContactNumber", {
            onChange: e => {
              e.target.value = e.target.value.replace(/\D/g, "");
            },
          })}
        />
      </InputField>
      <InputField label="Email" required>
        <input
          type="email"
          className="input-field"
          placeholder="Enter email"
          {...register("Email")}
        />
        {errors.Email && <p className="input-field-error">{String(errors.Email.message)}</p>}
      </InputField>
    </div>
  );
};

export default ContactAndIdProof;
