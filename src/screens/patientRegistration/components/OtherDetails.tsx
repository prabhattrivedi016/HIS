import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

const OtherDetails = () => {
  const {} = useGlobalApi();

  const { register } = useFormContext();

  const religion = usePickMaster("Religion");
  const religionList = religion?.pickMasterValue ?? [];

  const patientType = usePickMaster("PatientType");
  const patientTypeList = patientType?.pickMasterValue ?? [];

  const referenceType = usePickMaster("ReferenceType");
  const referenceTypeList = referenceType?.pickMasterValue ?? [];

  const gender = usePickMaster("Gender");
  const genderList = gender?.pickMasterValue ?? [];

  const [renderOtherDetails, setRenderOtherDetails] = useState<boolean>(false);
  const [showOtherDetails, setShowOtherDetails] = useState<boolean>(false);

  const tablePopupHandler = () => {
    setShowOtherDetails(prev => !prev);
    setRenderOtherDetails(prev => (prev ? prev : true));
  };

  return (
    <div className="card -mt-1 w-full">
      <div className="card-header flex items-center justify-between">
        <h2 className="card-title">Other Details</h2>

        <button type="button" onClick={tablePopupHandler}>
          {showOtherDetails ? <Minus size={22} /> : <Plus size={22} />}
        </button>
      </div>
      {showOtherDetails && (
        <Animation isOpen={renderOtherDetails}>
          <div className="form-grid-4">
            <InputField label="Emergency Contact No.">
              <input
                type="text"
                className="input-field"
                {...register("EmergencyContactNumber")}
                maxLength={10}
                minLength={10}
                onInput={allowOnlyNumbers}
              />
            </InputField>
            <InputField label="Landline Number">
              <input
                className="input-field"
                {...register("LandlineNo")}
                placeholder="Enter Landline Number"
              />
            </InputField>
            <InputField label="Birth Place">
              <input
                className="input-field"
                {...register("BirthPlace")}
                placeholder="Enter Birth Place"
              />
            </InputField>
            <InputField label="Religion">
              <select className="input-field" {...register("Religion")}>
                <option value="">Select Religion</option>
                {religionList.map(item => (
                  <option key={item.key} value={item.key}>
                    {item.value}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField label="Relation Phone ">
              <input
                type="text"
                className="input-field"
                {...register("RelationPhone")}
                placeholder="Enter Relation Phone"
              />
            </InputField>
            <InputField label="Relation Age">
              <input
                type="text"
                className="input-field"
                {...register("RelationAge")}
                placeholder="Enter Relation Age"
              />
            </InputField>
            <InputField label="Relation Gender">
              <select className="input-field" {...register("RelationGender")}>
                <option value="">Select Relation Gender</option>
                {genderList.map(item => (
                  <option key={item.key} value={item.key}>
                    {item.value}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField label="EMG_FirstName">
              <input
                type="text"
                className="input-field"
                {...register("EMG_FirstName")}
                placeholder="Enter EMG first name"
              />
            </InputField>
            <InputField label="EMG_LastName">
              <input
                type="text"
                className="input-field"
                {...register("EMG_LastName")}
                placeholder="Enter EMG last name"
              />
            </InputField>
            <InputField label="EMG_Relation">
              <input
                type="text"
                className="input-field"
                {...register("EMG_Relation")}
                placeholder="Enter EMG Relation"
              />
            </InputField>
            <InputField label="EMG_MobileNo">
              <input
                type="text"
                className="input-field"
                {...register("EMG_MobileNo")}
                onInput={allowOnlyNumbers}
                placeholder="Enter EMG Mobile No"
              />
            </InputField>
            <InputField label="EMG_ResidentNo">
              <input
                type="text"
                className="input-field"
                {...register("EMG_ResidentNo")}
                placeholder="Enter EMG Resident No"
              />
            </InputField>
            <InputField label="EMG_Address">
              <input
                type="text"
                className="input-field"
                {...register("EMG_Address")}
                placeholder="Enter EMG Address"
              />
            </InputField>
            <InputField label="Is International">
              <select className="input-field" {...register("IsInternational")}>
                <option value="">Select</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </InputField>
            <InputField label="Locality">
              <input
                className="input-field"
                {...register("Locality")}
                placeholder="Enter Locality"
              />
            </InputField>
            <InputField label="Passport Number">
              <input
                type="text"
                className="input-field"
                {...register("PassportNumber")}
                placeholder="Enter Passport Number"
              />
            </InputField>
            <InputField label="International Number">
              <input
                type="text"
                className="input-field"
                {...register("InternationalNo")}
                placeholder="Enter International Number"
              />
            </InputField>
            <InputField label="Membership Number">
              <input
                type="text"
                className="input-field"
                {...register("MembershipNo")}
                placeholder="Enter Membership"
              />
            </InputField>
            <InputField label="PatientType">
              <select className="input-field" {...register("PatientType")}>
                <option value="">Select Patient Type</option>
                {patientTypeList.map(item => (
                  <option key={item.key} value={item.key}>
                    {item.value}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField label="Identity Mark">
              <input
                type="text"
                className="input-field"
                {...register("IdentityMark")}
                placeholder="Enter identity mark"
              />
            </InputField>
            <InputField label="Identity Mark 2">
              <input
                type="text"
                className="input-field"
                {...register("IdentityMark2")}
                placeholder="Enter identity mark2"
              />
            </InputField>
            <InputField label="Reference Type">
              <select className="input-field" {...register("ReferenceType")}>
                <option value="">Select Reference Type</option>
                {referenceTypeList.map(item => (
                  <option key={item.key} value={item.key}>
                    {item.value}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField label="Remarks">
              <input
                type="text"
                className="input-field"
                {...register("Remarks")}
                placeholder="Enter remarks"
              />
            </InputField>
          </div>
        </Animation>
      )}
    </div>
  );
};

export default OtherDetails;
