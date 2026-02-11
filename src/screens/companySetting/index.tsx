import { NavLink } from "react-router-dom";
import InputField from "../../components/customInputField";

const CompanySetting = () => {
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

        <form className="form-grid-4">
          <InputField label="Hospital Name" required>
            <input type="text" className="input-field" placeholder="Enter hospital name" />
          </InputField>

          <InputField label="Hospital Code" required>
            <input type="text" className="input-field" placeholder="Enter hospital code" />
          </InputField>

          <InputField label="Website" required>
            <input type="text" className="input-field" placeholder="Enter website" />
          </InputField>

          <InputField label="Email" required>
            <input type="email" className="input-field" placeholder="Enter Email" />
          </InputField>

          <InputField label="Contact 1" required>
            <input type="text" className="input-field" placeholder="Enter contact number" />
          </InputField>

          <InputField label="Contact 2">
            <input type="text" className="input-field" placeholder="Enter contact number" />
          </InputField>

          <InputField label="Address" required>
            <input type="text" className="input-field" placeholder="Enter address" />
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
          </InputField>
        </form>
      </div>
    </div>
  );
};

export default CompanySetting;
