import { companySettingSchema } from "@/validation/companySettingSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import InputField from "../../components/customInputField";

const CompanySetting = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(companySettingSchema),
    defaultValues: {
      hospitalName: "",
      hospitalCode: "",
      website: "",
      email: "",
      contact1: "",
      contact2: "",
      address: "",
      hospitalLogo: "",
    },
  });
  return (
    <div className="page-container">
      <h1 className="page-heading">Company Setting</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Company Setting</span>
      </nav>

      <div className="card">
        <h2 className="card-title ">Hospital Details</h2>

        <form>
          <div className="form-grid-4">
            <InputField label="Hospital Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("hospitalName")}
              />
              {errors.hospitalName && (
                <p className="input-field-error">{errors.hospitalName.message}</p>
              )}
            </InputField>

            <InputField label="Hospital Code" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("hospitalCode")}
              />
              {errors.hospitalCode && (
                <p className="input-field-error">{errors.hospitalCode.message}</p>
              )}
            </InputField>

            <InputField label="Website" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("website")}
              />
              {errors.website && <p className="input-field-error">{errors.website.message}</p>}
            </InputField>

            <InputField label="Email" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("email")}
              />
              {errors.email && <p className="input-field-error">{errors.email.message}</p>}
            </InputField>

            <InputField label="Contact 1" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("contact1")}
              />
              {errors.contact1 && <p className="input-field-error">{errors.contact1.message}</p>}
            </InputField>

            <InputField label="Contact 2">
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("contact2")}
              />
              {errors.contact2 && <p className="input-field-error">{errors.contact2.message}</p>}
            </InputField>

            <InputField label="Address" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("address")}
              />
              {errors.address && <p className="input-field-error">{errors.address.message}</p>}
            </InputField>

            <InputField label="Hospital Logo" required>
              <input
                //   ref={fileInputRef}
                type="file"
                name="DocSignFile"
                accept=".png,.jpg,.jpeg"
                //   onChange={inputHandler}
                className="file-upload"
              />
              {errors.hospitalLogo && (
                <p className="input-field-error">{errors.hospitalLogo.message}</p>
              )}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {"Save"}
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySetting;
