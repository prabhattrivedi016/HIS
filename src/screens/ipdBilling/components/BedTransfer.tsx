import InputField from "@/components/customInputField";
import SubmitButton from "@/components/globalButtons/SubmitButton";

const BedTransfer = ({ patient }) => {
  return (
    <div>
      <h3 className="ipd-billing-text">Bed Transfer</h3>
      <div className="form-grid-4">
        <InputField label="Billing Type" required>
          <input className="input-field" />
        </InputField>
        <InputField label="Room Type" required>
          <input className="input-field" />
        </InputField>
        <InputField label="Ward / Bed" required>
          <input className="input-field" />
        </InputField>
      </div>
      <div className="form-actions-responsive mt-5">
        <SubmitButton label="Transfer" />
      </div>
    </div>
  );
};

export default BedTransfer;
