import InputField from "@/components/customInputField";
import SubmitButton from "@/components/globalButtons/SubmitButton";

const DoctorTransfer = ({ patient }) => {
  return (
    <div>
      <h3 className="ipd-billing-text">Doctor Transfer</h3>
      <div className="form-grid-4">
        <InputField label="Doctor" required>
          <input className="input-field" />
        </InputField>
      </div>
      <div className="form-actions-responsive mt-5">
        <SubmitButton label="Transfer" />
      </div>
    </div>
  );
};

export default DoctorTransfer;
